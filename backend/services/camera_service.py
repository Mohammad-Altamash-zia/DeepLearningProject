import os
import time
import threading
import logging
from typing import Optional, Tuple, Dict, Any, Generator, List

import cv2
import numpy as np

from backend.config import DEFAULT_SETTINGS, TEST_IMAGES_DIR
from backend.database import db

logger = logging.getLogger("inspectai.camera")


class CameraService:
    def __init__(self):
        self.stream_url: str = db.get_setting("camera_url", DEFAULT_SETTINGS["camera_url"])
        self.status: str = "Disconnected"  # Connected, Connecting, Disconnected, Reconnecting, Error
        self.error_message: Optional[str] = None
        
        self._cap: Optional[cv2.VideoCapture] = None
        self._reader_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._frame_lock = threading.Lock()
        
        self._latest_frame: Optional[np.ndarray] = None
        self._latest_frame_time: float = 0.0
        self._fps: float = 0.0
        self._resolution: Tuple[int, int] = (0, 0)
        self._reconnect_attempts: int = 0
        self._max_reconnect_attempts: int = 20
        
        # Fallback test pattern index for simulation
        self._fallback_mode: bool = False
        self._synthetic_counter: int = 0

    def get_status(self) -> Dict[str, Any]:
        """Returns current camera status and telemetry."""
        is_webcam = str(self.stream_url).isdigit()
        camera_label = f"Laptop Webcam {self.stream_url}" if is_webcam else self.stream_url
        return {
            "status": self.status,
            "stream_url": str(self.stream_url),
            "camera_label": camera_label,
            "fps": round(self._fps, 1),
            "resolution": f"{self._resolution[0]}x{self._resolution[1]}" if self._resolution[0] > 0 else "0x0",
            "error_message": self.error_message,
            "fallback_mode": self._fallback_mode,
            "has_frame": self._latest_frame is not None,
        }

    def list_available_webcams(self) -> List[Dict[str, Any]]:
        """Scans local system for connected webcam video devices without resource locking."""
        available = []

        # 1. On Linux, inspect sysfs to detect real capture devices without locking them
        if os.path.exists("/sys/class/video4linux"):
            try:
                for entry in sorted(os.listdir("/sys/class/video4linux")):
                    if entry.startswith("video"):
                        idx_str = entry.replace("video", "")
                        if idx_str.isdigit():
                            idx = int(idx_str)
                            name_file = f"/sys/class/video4linux/{entry}/name"
                            name = "Laptop Webcam"
                            if os.path.exists(name_file):
                                try:
                                    with open(name_file, "r") as f:
                                        name = f.read().strip()
                                except Exception:
                                    pass

                            index_file = f"/sys/class/video4linux/{entry}/index"
                            device_index = "0"
                            if os.path.exists(index_file):
                                try:
                                    with open(index_file, "r") as f:
                                        device_index = f.read().strip()
                                except Exception:
                                    pass

                            # Only include video capture interfaces (index 0), skip metadata streams
                            if device_index == "0" or idx == 0:
                                available.append({"index": idx, "label": f"{name} (Device {idx})"})
            except Exception as e:
                logger.debug(f"Sysfs webcam enumeration error: {e}")

        # 2. Fallback / Windows / Non-Linux detection:
        if not available:
            for index in range(2):
                if self.status == "Connected" and str(self.stream_url) == str(index):
                    available.append({"index": index, "label": f"Built-in Laptop Camera (Device {index})"})
                    continue
                try:
                    cap = cv2.VideoCapture(index)
                    if cap.isOpened():
                        ret, _ = cap.read()
                        cap.release()
                        if ret:
                            label = "Built-in Laptop Camera (Device 0)" if index == 0 else f"Camera Device {index}"
                            available.append({"index": index, "label": label})
                except Exception:
                    pass

        if not available:
            available.append({"index": 0, "label": "Built-in Laptop Camera (Device 0)"})

        return available

    def connect(self, url: Optional[str] = None) -> bool:
        """Initiates connection to the camera stream."""
        if url is not None:
            self.stream_url = str(url).strip()
            db.set_setting("camera_url", self.stream_url)

        # Disconnect any existing session first
        self.disconnect()

        self.status = "Connecting"
        self.error_message = None
        self._stop_event.clear()
        self._reconnect_attempts = 0

        self._reader_thread = threading.Thread(
            target=self._capture_worker, 
            daemon=True, 
            name="InspectAI-CameraWorker"
        )
        self._reader_thread.start()
        logger.info(f"Connecting to camera stream: {self.stream_url}")
        return True

    def disconnect(self):
        """Disconnects camera and releases hardware resources safely."""
        self.status = "Disconnected"
        self._stop_event.set()

        if self._reader_thread and self._reader_thread.is_alive():
            self._reader_thread.join(timeout=2.5)
            self._reader_thread = None

        self._release_cap()
        with self._frame_lock:
            self._latest_frame = None
            self._fps = 0.0
            self._resolution = (0, 0)
        logger.info("Camera disconnected and resources released.")

    def _release_cap(self):
        if self._cap is not None:
            try:
                self._cap.release()
            except Exception as e:
                logger.warning(f"Error releasing VideoCapture: {e}")
            self._cap = None
            time.sleep(0.15)  # Allow V4L2 device buffer tear-down

    def test_connection(self, url: str, timeout_sec: float = 3.0) -> Tuple[bool, str]:
        """
        Tests connection to a camera URL or index without corrupting active streaming state.
        Returns: (success: bool, message: str)
        """
        test_url = str(url).strip()
        if not test_url:
            return False, "Camera URL or device index cannot be empty."

        source: Any = int(test_url) if test_url.isdigit() else test_url
        is_webcam = isinstance(source, int)

        # If camera is already actively running this source, return immediately
        if self.status == "Connected" and str(self.stream_url) == str(test_url) and self._latest_frame is not None:
            w, h = self._resolution
            return True, f"Webcam Device {source} is currently connected and streaming ({w}x{h})."

        try:
            if is_webcam:
                backend = cv2.CAP_V4L2 if hasattr(cv2, "CAP_V4L2") and os.name != "nt" else cv2.CAP_ANY
                temp_cap = cv2.VideoCapture(source, backend)
                if temp_cap.isOpened():
                    temp_cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
                    temp_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    temp_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            else:
                os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "timeout;3000000"
                temp_cap = cv2.VideoCapture(source)

            if not temp_cap.isOpened():
                temp_cap.release()
                return False, f"Could not connect or open video source: {test_url}"

            # Allow camera up to 1.5s warmup to produce a frame
            ret, frame = False, None
            for _ in range(15):
                ret, frame = temp_cap.read()
                if ret and frame is not None and frame.size > 0:
                    break
                time.sleep(0.1)

            temp_cap.release()

            if ret and frame is not None and frame.size > 0:
                h, w = frame.shape[:2]
                return True, f"Connection verified! Camera online ({w}x{h})."
            else:
                return False, "Camera opened but could not read video frames."
        except Exception as e:
            return False, f"Error testing stream connection: {str(e)}"

    def _capture_worker(self):
        """Continuously pulls frames into buffer to keep stream real-time."""
        while not self._stop_event.is_set():
            source: Any = int(self.stream_url) if str(self.stream_url).strip().isdigit() else self.stream_url
            is_webcam = isinstance(source, int)

            try:
                self._release_cap()
                time.sleep(0.2)

                if is_webcam:
                    # On Linux, V4L2 with MJPG is rock-solid for laptop webcams
                    backend = cv2.CAP_V4L2 if hasattr(cv2, "CAP_V4L2") and os.name != "nt" else cv2.CAP_ANY
                    self._cap = cv2.VideoCapture(source, backend)
                    if self._cap.isOpened():
                        self._cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
                        self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        self._cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                else:
                    if isinstance(self.stream_url, str) and self.stream_url.startswith("rtsp://"):
                        os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|timeout;3000000"
                    else:
                        os.environ.pop("OPENCV_FFMPEG_CAPTURE_OPTIONS", None)
                    self._cap = cv2.VideoCapture(source)
                    if self._cap.isOpened():
                        self._cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                if not self._cap.isOpened():
                    raise ConnectionError(f"Failed to open video source: {self.stream_url}")

                # Camera Warmup Phase: wait for first valid frame (up to 3 seconds)
                warmup_ok = False
                for _ in range(30):
                    if self._stop_event.is_set():
                        break
                    ret, frame = self._cap.read()
                    if ret and frame is not None and frame.size > 0:
                        warmup_ok = True
                        with self._frame_lock:
                            self._latest_frame = frame
                            self._latest_frame_time = time.time()
                            self._resolution = (frame.shape[1], frame.shape[0])
                        break
                    time.sleep(0.1)

                if self._stop_event.is_set():
                    break

                if not warmup_ok:
                    raise ConnectionError(f"Camera opened at {self.stream_url} but did not return video frames during warmup.")

                # Mark as successfully Connected
                self.status = "Connected"
                self.error_message = None
                self._fallback_mode = False
                self._reconnect_attempts = 0
                logger.info(f"Successfully connected to camera stream at {self.stream_url} ({self._resolution[0]}x{self._resolution[1]})")

                frame_count = 0
                fps_timer = time.time()
                consecutive_drops = 0

                # Inner reading loop
                while not self._stop_event.is_set():
                    ret, frame = self._cap.read()
                    if not ret or frame is None or frame.size == 0:
                        consecutive_drops += 1
                        if consecutive_drops > 60:  # 3 seconds of continuous dropped frames
                            logger.warning("Empty or dropped frames exceeded threshold, reconnecting...")
                            break
                        time.sleep(0.05)
                        continue

                    consecutive_drops = 0

                    with self._frame_lock:
                        self._latest_frame = frame
                        self._latest_frame_time = time.time()
                        self._resolution = (frame.shape[1], frame.shape[0])

                    frame_count += 1
                    elapsed = time.time() - fps_timer
                    if elapsed >= 1.0:
                        self._fps = frame_count / elapsed
                        frame_count = 0
                        fps_timer = time.time()

                    time.sleep(0.01)

            except Exception as e:
                self.error_message = str(e)
                logger.warning(f"Camera stream disconnected or error: {e}")

            # Exit or Reconnect
            self._release_cap()
            if self._stop_event.is_set():
                break

            self._reconnect_attempts += 1
            if self._reconnect_attempts <= self._max_reconnect_attempts:
                self.status = "Reconnecting"
                logger.info(f"Attempting camera reconnection ({self._reconnect_attempts}/{self._max_reconnect_attempts})...")
                for _ in range(20):
                    if self._stop_event.is_set():
                        break
                    time.sleep(0.1)
            else:
                self.status = "Error"
                self.error_message = f"Failed to connect after {self._max_reconnect_attempts} attempts."
                logger.error(self.error_message)
                break

    def get_latest_frame(self) -> Optional[np.ndarray]:
        """Returns the most recent frame thread-safely."""
        with self._frame_lock:
            if self._latest_frame is not None:
                return self._latest_frame.copy()

        # If camera not connected or in fallback mode, return simulated steel surface
        if self._fallback_mode or self.status in ["Connecting", "Error", "Disconnected"]:
            return self._generate_synthetic_steel_frame()

        return None

    def enable_fallback_simulation(self):
        """Enables synthetic steel surface stream for demonstration/testing."""
        self._fallback_mode = True
        self.status = "Connected"
        self._resolution = (640, 480)
        self._fps = 20.0

    def _generate_synthetic_steel_frame(self) -> np.ndarray:
        """Generates dynamic simulated steel coil for testing when camera is offline."""
        self._synthetic_counter += 1
        h, w = 480, 640
        base = np.full((h, w), 180, dtype=np.uint8)
        offset = (self._synthetic_counter * 8) % w
        noise = np.random.normal(0, 10, (h, w)).astype(np.int16)
        steel = np.clip(base + noise, 0, 255).astype(np.uint8)
        frame = cv2.cvtColor(steel, cv2.COLOR_GRAY2BGR)

        # Periodically insert a defect mark for inspection simulation
        if (self._synthetic_counter // 20) % 2 == 1:
            cx = (offset + 100) % w
            cv2.line(frame, (cx, 180), (cx + 80, 220), (35, 35, 35), 4)

        cv2.putText(
            frame,
            f"SIMULATED STEEL SURFACE (Laptop Camera Device {self.stream_url})",
            (15, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (0, 165, 255),
            1,
            cv2.LINE_AA,
        )
        return frame

    def generate_mjpeg_stream(self) -> Generator[bytes, None, None]:
        """Generates multipart/x-mixed-replace MJPEG stream for frontend live preview."""
        while True:
            frame = self.get_latest_frame()
            if frame is None:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                msg = f"CAMERA: {self.status.upper()}"
                cv2.putText(frame, msg, (180, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (150, 150, 150), 2)

            ret, jpeg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if ret:
                frame_bytes = jpeg.tobytes()
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                )
            time.sleep(0.04)  # ~25 FPS stream


camera_service = CameraService()
