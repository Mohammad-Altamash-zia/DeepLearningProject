import time
import queue
import threading
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Callable

import numpy as np

from backend.config import DEFAULT_SETTINGS
from backend.database import db
from backend.services.camera_service import camera_service
from backend.services.inference_service import inference_service
from backend.services.storage_service import storage_service

logger = logging.getLogger("inspectai.inspection")


class InspectionService:
    def __init__(self):
        self.is_inspecting: bool = False
        self.capture_interval: float = float(db.get_setting("capture_interval", DEFAULT_SETTINGS["capture_interval"]))
        
        # Telemetry counters
        self.total_captured: int = 0
        self.total_processed: int = 0
        self.total_skipped: int = 0
        self.last_inference_time_ms: float = 0.0
        self.last_inspection_result: Optional[Dict[str, Any]] = None
        
        # Threads and Synchronization
        self._scheduler_thread: Optional[threading.Thread] = None
        self._worker_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        
        # Bounded Queue with Frame Dropping Policy
        max_q = int(db.get_setting("queue_maxsize", DEFAULT_SETTINGS["queue_maxsize"]))
        self._inference_queue: queue.Queue = queue.Queue(maxsize=max_q)
        
        # Sequence Counter
        self._sequence_number: int = 0
        
        # Callbacks (e.g. WebSocket broadcasters)
        self.broadcast_callbacks: List[Callable[[Dict[str, Any]], None]] = []

    def register_broadcast_callback(self, cb: Callable[[Dict[str, Any]], None]):
        """Registers a function to be notified on new inspection events."""
        if cb not in self.broadcast_callbacks:
            self.broadcast_callbacks.append(cb)

    def _broadcast(self, event_type: str, data: Any):
        payload = {"type": event_type, "data": data, "timestamp": datetime.now(timezone.utc).isoformat()}
        for cb in self.broadcast_callbacks:
            try:
                cb(payload)
            except Exception as e:
                logger.debug(f"Broadcast callback error: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Returns live inspection runtime telemetry."""
        return {
            "is_inspecting": self.is_inspecting,
            "capture_interval": self.capture_interval,
            "total_captured": self.total_captured,
            "total_processed": self.total_processed,
            "total_skipped": self.total_skipped,
            "last_inference_time_ms": round(self.last_inference_time_ms, 2),
            "queue_depth": self._inference_queue.qsize(),
            "last_inspection": self.last_inspection_result,
        }

    def start_inspection(self) -> bool:
        """Starts automatic one-second capture and inspection pipeline."""
        if self.is_inspecting:
            return True

        self.is_inspecting = True
        self._stop_event.clear()

        # Update capture interval from DB
        try:
            self.capture_interval = float(db.get_setting("capture_interval", DEFAULT_SETTINGS["capture_interval"]))
        except Exception:
            self.capture_interval = 1.0

        # Start Inference Worker Thread
        self._worker_thread = threading.Thread(
            target=self._inference_worker, daemon=True, name="InspectAI-InferenceWorker"
        )
        self._worker_thread.start()

        # Start 1-Second Capture Scheduler Thread
        self._scheduler_thread = threading.Thread(
            target=self._capture_scheduler, daemon=True, name="InspectAI-CaptureScheduler"
        )
        self._scheduler_thread.start()

        logger.info(f"Inspection pipeline started with capture interval {self.capture_interval}s.")
        self._broadcast("INSPECTION_STATUS", self.get_status())
        return True

    def stop_inspection(self) -> bool:
        """Stops the inspection pipeline and drains worker threads."""
        if not self.is_inspecting:
            return True

        self.is_inspecting = False
        self._stop_event.set()

        if self._scheduler_thread and self._scheduler_thread.is_alive():
            self._scheduler_thread.join(timeout=2.0)
            self._scheduler_thread = None

        if self._worker_thread and self._worker_thread.is_alive():
            self._worker_thread.join(timeout=2.0)
            self._worker_thread = None

        # Drain any leftover frames from queue
        while not self._inference_queue.empty():
            try:
                self._inference_queue.get_nowait()
                self._inference_queue.task_done()
            except Exception:
                break

        logger.info("Inspection pipeline stopped.")
        self._broadcast("INSPECTION_STATUS", self.get_status())
        return True

    def _capture_scheduler(self):
        """Captures one frame every capture_interval seconds and submits to inference queue."""
        while not self._stop_event.is_set():
            start_loop = time.time()

            frame = camera_service.get_latest_frame()
            if frame is not None and frame.size > 0:
                self._sequence_number += 1
                now = datetime.now(timezone.utc)
                now_iso = now.isoformat()
                now_str = now.strftime("%Y%m%d_%H%M%S")
                # Unique inspection code with date, time, and sequence
                ms = int(time.time() * 1000) % 1000
                inspection_code = f"INSP-{now.strftime('%Y%m%d-%H%M%S')}-{ms:03d}-{self._sequence_number:04d}"

                self.total_captured += 1

                # Frame Dropping Policy: If queue is full, drop frame and count as skipped
                try:
                    self._inference_queue.put_nowait({
                        "inspection_code": inspection_code,
                        "timestamp": now_iso,
                        "timestamp_str": now_str,
                        "frame": frame,
                        "camera_source": camera_service.stream_url,
                    })
                except queue.Full:
                    self.total_skipped += 1
                    logger.warning(
                        f"Inference queue full ({self._inference_queue.maxsize}). Dropping frame {inspection_code}."
                    )
            else:
                logger.debug("Scheduler attempted capture but no frame was available from camera.")

            # Sleep remaining time to maintain exact capture interval
            elapsed = time.time() - start_loop
            sleep_time = max(0.05, self.capture_interval - elapsed)
            time.sleep(sleep_time)

    def _inference_worker(self):
        """Worker thread that executes ONNX model inference on scheduled frames."""
        while not self._stop_event.is_set():
            try:
                task = self._inference_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            try:
                inspection_code = task["inspection_code"]
                timestamp = task["timestamp"]
                timestamp_str = task["timestamp_str"]
                frame = task["frame"]
                camera_source = task["camera_source"]

                # Fetch latest thresholds from DB
                conf_thresh = float(db.get_setting("confidence_threshold", DEFAULT_SETTINGS["confidence_threshold"]))
                iou_thresh = float(db.get_setting("iou_threshold", DEFAULT_SETTINGS["iou_threshold"]))

                # 1. Save original capture image
                raw_filename = storage_service.save_capture(frame, inspection_code, timestamp_str)

                # 2. Run ONNX Model Inference
                status, detections, annotated_img, latency_ms = inference_service.predict(
                    frame, conf_threshold=conf_thresh, iou_threshold=iou_thresh
                )
                self.last_inference_time_ms = latency_ms

                # 3. Save annotated image
                annotated_filename = storage_service.save_annotated(annotated_img, inspection_code, timestamp_str)

                # 4. Store persistent record in SQLite
                db_id = db.save_inspection(
                    inspection_code=inspection_code,
                    timestamp=timestamp,
                    status=status,
                    defect_count=len(detections),
                    inference_time_ms=latency_ms,
                    image_filename=raw_filename,
                    annotated_image_filename=annotated_filename,
                    camera_source=camera_source,
                    detections=detections,
                )

                self.total_processed += 1

                # 5. Build Result Payload
                result = {
                    "id": db_id,
                    "inspection_code": inspection_code,
                    "timestamp": timestamp,
                    "status": status,
                    "defect_count": len(detections),
                    "inference_time_ms": round(latency_ms, 2),
                    "image_filename": raw_filename,
                    "annotated_image_filename": annotated_filename,
                    "annotated_image_url": f"/api/images/{annotated_filename}",
                    "detections": detections,
                }
                self.last_inspection_result = result

                # 6. Broadcast Real-Time Events
                self._broadcast("NEW_INSPECTION", result)
                self._broadcast("STATISTICS_UPDATE", db.get_analytics_summary())

            except Exception as e:
                logger.error(f"Error processing frame in inference worker: {e}", exc_info=True)
                self._broadcast("SYSTEM_ERROR", {"error": str(e)})
            finally:
                self._inference_queue.task_done()

    def inspect_single(self, frame_bgr: np.ndarray, source_name: str = "manual_test") -> Dict[str, Any]:
        """Runs a single on-demand inspection on any arbitrary frame (e.g. test button)."""
        self._sequence_number += 1
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        now_str = now.strftime("%Y%m%d_%H%M%S")
        ms = int(time.time() * 1000) % 1000
        inspection_code = f"INSP-TEST-{now.strftime('%Y%m%d-%H%M%S')}-{ms:03d}-{self._sequence_number:04d}"

        conf_thresh = float(db.get_setting("confidence_threshold", DEFAULT_SETTINGS["confidence_threshold"]))
        iou_thresh = float(db.get_setting("iou_threshold", DEFAULT_SETTINGS["iou_threshold"]))

        raw_filename = storage_service.save_capture(frame_bgr, inspection_code, now_str)
        status, detections, annotated_img, latency_ms = inference_service.predict(
            frame_bgr, conf_threshold=conf_thresh, iou_threshold=iou_thresh
        )
        annotated_filename = storage_service.save_annotated(annotated_img, inspection_code, now_str)

        db_id = db.save_inspection(
            inspection_code=inspection_code,
            timestamp=now_iso,
            status=status,
            defect_count=len(detections),
            inference_time_ms=latency_ms,
            image_filename=raw_filename,
            annotated_image_filename=annotated_filename,
            camera_source=source_name,
            detections=detections,
        )

        result = {
            "id": db_id,
            "inspection_code": inspection_code,
            "timestamp": now_iso,
            "status": status,
            "defect_count": len(detections),
            "inference_time_ms": round(latency_ms, 2),
            "image_filename": raw_filename,
            "annotated_image_filename": annotated_filename,
            "annotated_image_url": f"/api/images/{annotated_filename}",
            "detections": detections,
        }
        self.last_inspection_result = result
        self._broadcast("NEW_INSPECTION", result)
        self._broadcast("STATISTICS_UPDATE", db.get_analytics_summary())
        return result


inspection_service = InspectionService()
