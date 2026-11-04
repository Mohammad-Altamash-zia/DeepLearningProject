import os
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import cv2
import numpy as np
import onnxruntime as ort

from backend.config import MODEL_PATH, DEFECT_CLASSES, CLASS_COLORS, DEFAULT_SETTINGS

logger = logging.getLogger("inspectai.inference")


class InferenceService:
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = Path(model_path) if model_path else MODEL_PATH
        self.session: Optional[ort.InferenceSession] = None
        self.input_name: Optional[str] = None
        self.output_names: List[str] = []
        self.input_shape: Tuple[int, int] = (640, 640)
        self.class_names: Dict[int, str] = DEFECT_CLASSES
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None
        self.providers: List[str] = []

        self._load_model()

    def _load_model(self):
        """Loads the ONNX model into an ONNX Runtime session."""
        if not self.model_path.exists():
            self.load_error = f"Model file not found at: {self.model_path}"
            logger.error(self.load_error)
            self.is_loaded = False
            return

        try:
            available_providers = ort.get_available_providers()
            # Prefer CUDA if present and compatible, otherwise CPU
            providers = [p for p in ["CUDAExecutionProvider", "CPUExecutionProvider"] if p in available_providers]
            if not providers:
                providers = ["CPUExecutionProvider"]

            session_options = ort.SessionOptions()
            session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            session_options.intra_op_num_threads = min(4, os.cpu_count() or 1)

            self.session = ort.InferenceSession(
                str(self.model_path),
                sess_options=session_options,
                providers=providers,
            )
            self.providers = self.session.get_providers()

            # Inspect inputs
            model_inputs = self.session.get_inputs()
            self.input_name = model_inputs[0].name
            # Typically [1, 3, 640, 640]
            if len(model_inputs[0].shape) == 4:
                h = model_inputs[0].shape[2]
                w = model_inputs[0].shape[3]
                if isinstance(h, int) and isinstance(w, int):
                    self.input_shape = (w, h)

            # Inspect outputs
            self.output_names = [o.name for o in self.session.get_outputs()]

            # Inspect metadata if available
            meta = self.session.get_modelmeta().custom_metadata_map
            if "names" in meta:
                try:
                    # e.g. "{0: 'Class_1', 1: 'Class_2', ...}"
                    parsed_names = eval(meta["names"])
                    if isinstance(parsed_names, dict):
                        self.class_names = {int(k): str(v) for k, v in parsed_names.items()}
                except Exception as e:
                    logger.warning(f"Failed to parse class names from metadata: {e}")

            self.is_loaded = True
            self.load_error = None
            logger.info(
                f"Successfully loaded YOLO11n ONNX model from {self.model_path} "
                f"using providers {self.providers}, classes: {self.class_names}"
            )
        except Exception as e:
            self.is_loaded = False
            self.load_error = f"Failed to initialize ONNX Runtime session: {str(e)}"
            logger.error(self.load_error, exc_info=True)

    def letterbox(
        self,
        img: np.ndarray,
        new_shape: Tuple[int, int] = (640, 640),
        color: Tuple[int, int, int] = (114, 114, 114),
    ) -> Tuple[np.ndarray, float, Tuple[float, float]]:
        """
        Resize and pad image while maintaining aspect ratio (standard YOLO letterboxing).
        Returns:
            padded_img: image resized with padding to new_shape
            ratio: scale ratio
            (dw, dh): padding added on sides
        """
        shape = img.shape[:2]  # [height, width]
        # Scale ratio (new / old)
        r = min(new_shape[0] / shape[1], new_shape[1] / shape[0])

        # Compute padding
        new_unpad = (int(round(shape[1] * r)), int(round(shape[0] * r)))
        dw = (new_shape[0] - new_unpad[0]) / 2  # divide padding into 2 sides
        dh = (new_shape[1] - new_unpad[1]) / 2

        if shape[::-1] != new_unpad:  # resize
            img = cv2.resize(img, new_unpad, interpolation=cv2.INTER_LINEAR)

        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        padded_img = cv2.copyMakeBorder(
            img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color
        )
        return padded_img, r, (dw, dh)

    def preprocess(self, img_bgr: np.ndarray) -> Tuple[np.ndarray, float, Tuple[float, float]]:
        """Prepares an image for model input."""
        padded_img, ratio, (dw, dh) = self.letterbox(img_bgr, new_shape=self.input_shape)
        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(padded_img, cv2.COLOR_BGR2RGB)
        # Transpose HWC -> CHW
        img_chw = img_rgb.transpose((2, 0, 1))
        # Normalize 0 - 255 to 0.0 - 1.0 and expand batch dim
        input_tensor = np.ascontiguousarray(img_chw[np.newaxis, ...], dtype=np.float32) / 255.0
        return input_tensor, ratio, (dw, dh)

    def postprocess(
        self,
        output_tensor: np.ndarray,
        orig_shape: Tuple[int, int],
        ratio: float,
        pad: Tuple[float, float],
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45,
    ) -> List[Dict[str, Any]]:
        """
        Interprets the YOLO11 output tensor: shape [1, 8, 8400].
        Applies confidence filtering, Non-Maximum Suppression (NMS),
        and maps bounding boxes back to the original image coordinate frame.
        """
        orig_h, orig_w = orig_shape
        dw, dh = pad

        # Squeeze batch dimension -> [8, 8400] -> transpose to [8400, 8]
        preds = output_tensor[0].T  # [8400, 8]

        boxes = []
        confidences = []
        class_ids = []

        # Coordinates are [cx, cy, w, h] in columns 0..3
        # Class scores for 4 classes in columns 4..7
        cx = preds[:, 0]
        cy = preds[:, 1]
        w = preds[:, 2]
        h = preds[:, 3]
        scores = preds[:, 4:]  # [8400, num_classes]

        max_scores = np.max(scores, axis=1)
        max_class_ids = np.argmax(scores, axis=1)

        valid_mask = max_scores >= conf_threshold
        if not np.any(valid_mask):
            return []

        val_cx = cx[valid_mask]
        val_cy = cy[valid_mask]
        val_w = w[valid_mask]
        val_h = h[valid_mask]
        val_scores = max_scores[valid_mask]
        val_class_ids = max_class_ids[valid_mask]

        # Convert [cx, cy, w, h] to [x1, y1, w, h] for cv2.dnn.NMSBoxes
        val_x = val_cx - val_w / 2
        val_y = val_cy - val_h / 2

        nms_boxes = []
        for x, y, bw, bh in zip(val_x, val_y, val_w, val_h):
            nms_boxes.append([int(x), int(y), int(bw), int(bh)])

        # Apply Non-Maximum Suppression (NMS)
        indices = cv2.dnn.NMSBoxes(
            bboxes=nms_boxes,
            scores=val_scores.tolist(),
            score_threshold=float(conf_threshold),
            nms_threshold=float(iou_threshold),
        )

        detections = []
        if len(indices) == 0:
            return detections

        # Handle different OpenCV versions (indices might be flat or nested)
        if isinstance(indices, np.ndarray):
            indices = indices.flatten()

        for idx in indices:
            # Map coordinates back to original image space
            # 1. subtract letterbox pad
            # 2. divide by scale ratio
            bx = (val_cx[idx] - dw) / ratio
            by = (val_cy[idx] - dh) / ratio
            bw = val_w[idx] / ratio
            bh = val_h[idx] / ratio

            x1 = max(0, int(round(bx - bw / 2)))
            y1 = max(0, int(round(by - bh / 2)))
            x2 = min(orig_w - 1, int(round(bx + bw / 2)))
            y2 = min(orig_h - 1, int(round(by + bh / 2)))

            cid = int(val_class_ids[idx])
            cname = self.class_names.get(cid, f"Class_{cid+1}")
            confidence = float(val_scores[idx])

            # Discard invalid or collapsed boxes
            if x2 > x1 and y2 > y1:
                detections.append({
                    "class_id": cid,
                    "class_name": cname,
                    "confidence": round(confidence, 4),
                    "confidence_pct": f"{confidence * 100:.1f}%",
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2),
                    "width": int(x2 - x1),
                    "height": int(y2 - y1),
                })

        # Sort detections descending by confidence
        detections.sort(key=lambda d: d["confidence"], reverse=True)
        return detections

    def annotate_image(
        self,
        img_bgr: np.ndarray,
        detections: List[Dict[str, Any]],
        status: str,
        defect_count: int,
        inference_time_ms: float,
    ) -> np.ndarray:
        """
        Draws high-visibility industrial bounding boxes, defect labels,
        and an executive status banner on the image.
        """
        annotated = img_bgr.copy()
        h, w = annotated.shape[:2]

        # Draw bounding boxes for each detection
        for det in detections:
            x1, y1, x2, y2 = det["x1"], det["y1"], det["x2"], det["y2"]
            cname = det["class_name"]
            conf = det["confidence_pct"]
            color = CLASS_COLORS.get(cname, (0, 0, 255))

            # Main bounding box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            # Subtle corner brackets for high-tech industrial aesthetic
            corner_len = min(15, (x2 - x1) // 4, (y2 - y1) // 4)
            if corner_len > 0:
                cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), (255, 255, 255), 2)
                cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), (255, 255, 255), 2)
                cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), (255, 255, 255), 2)
                cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), (255, 255, 255), 2)

            # Label pill
            label = f"{cname} {conf}"
            (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            pill_y1 = max(0, y1 - th - baseline - 6)
            pill_y2 = pill_y1 + th + baseline + 6
            pill_x2 = min(w, x1 + tw + 10)

            # Filled label background
            cv2.rectangle(annotated, (x1, pill_y1), (pill_x2, pill_y2), color, -1)
            # Label text in bold white
            cv2.putText(
                annotated,
                label,
                (x1 + 5, pill_y2 - baseline - 3),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )

        # Draw executive top banner
        banner_h = 42
        # Overlay semi-transparent dark banner
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (w, banner_h), (15, 20, 28), -1)
        cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)

        # Status badge color: Emerald Green (PASS) or Crimson Red (FAIL)
        status_color = (46, 204, 113) if status == "PASS" else (50, 50, 235)
        status_badge_text = f" INSPECTAI | {status} "
        cv2.rectangle(annotated, (10, 8), (170, 34), status_color, -1)
        cv2.putText(
            annotated,
            status_badge_text,
            (14, 26),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )

        # Metrics text in header
        metrics_text = f"Defects: {defect_count}  |  Latency: {inference_time_ms:.1f}ms  |  Resolution: {w}x{h}"
        cv2.putText(
            annotated,
            metrics_text,
            (185, 26),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (210, 220, 230),
            1,
            cv2.LINE_AA,
        )

        return annotated

    def predict(
        self,
        img_bgr: np.ndarray,
        conf_threshold: Optional[float] = None,
        iou_threshold: Optional[float] = None,
    ) -> Tuple[str, List[Dict[str, Any]], np.ndarray, float]:
        """
        Runs complete inference pipeline on an image.
        Returns:
            status: "PASS" or "FAIL"
            detections: List of defect dictionaries
            annotated_image: Annotated image (BGR)
            inference_time_ms: Wall-clock latency in milliseconds
        """
        if not self.is_loaded:
            raise RuntimeError(f"Inference engine is not ready: {self.load_error}")

        if img_bgr is None or img_bgr.size == 0:
            raise ValueError("Provided image is empty or invalid.")

        conf_thresh = conf_threshold if conf_threshold is not None else DEFAULT_SETTINGS["confidence_threshold"]
        iou_thresh = iou_threshold if iou_threshold is not None else DEFAULT_SETTINGS["iou_threshold"]

        orig_shape = img_bgr.shape[:2]  # [h, w]

        # 1. Preprocess
        input_tensor, ratio, pad = self.preprocess(img_bgr)

        # 2. Run ONNX Inference
        start_time = time.perf_counter()
        outputs = self.session.run(self.output_names, {self.input_name: input_tensor})
        inference_time_ms = (time.perf_counter() - start_time) * 1000.0

        # 3. Postprocess
        detections = self.postprocess(
            output_tensor=outputs[0],
            orig_shape=orig_shape,
            ratio=ratio,
            pad=pad,
            conf_threshold=conf_thresh,
            iou_threshold=iou_thresh,
        )

        defect_count = len(detections)
        status = "FAIL" if defect_count > 0 else "PASS"

        # 4. Annotate
        annotated_image = self.annotate_image(
            img_bgr=img_bgr,
            detections=detections,
            status=status,
            defect_count=defect_count,
            inference_time_ms=inference_time_ms,
        )

        return status, detections, annotated_image, inference_time_ms


# Module-level singleton instance
inference_service = InferenceService()

