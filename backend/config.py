import os
from pathlib import Path

# Base Paths (Works seamlessly across Linux and Windows)
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = BASE_DIR

MODEL_PATH = PROJECT_DIR / "models" / "inspectai_yolo11n.onnx"
DATABASE_PATH = PROJECT_DIR / "database" / "inspectai.db"
STORAGE_DIR = PROJECT_DIR / "storage"
CAPTURES_DIR = STORAGE_DIR / "captures"
ANNOTATED_DIR = STORAGE_DIR / "annotated"
TEST_IMAGES_DIR = PROJECT_DIR / "test_images"

# Ensure runtime directories exist
CAPTURES_DIR.mkdir(parents=True, exist_ok=True)
ANNOTATED_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

# Defect Classes for Severstal Steel Defect Detection Dataset
DEFECT_CLASSES = {
    0: "Class_1",
    1: "Class_2",
    2: "Class_3",
    3: "Class_4",
}

# Color palette for classes (BGR for OpenCV)
CLASS_COLORS = {
    "Class_1": (0, 165, 255),   # Vibrant Orange
    "Class_2": (255, 105, 180), # Deep Pink / Violet
    "Class_3": (34, 34, 238),   # Warning Red / Crimson
    "Class_4": (0, 215, 255),   # Golden Yellow
}

# Default System Settings
DEFAULT_SETTINGS = {
    "camera_url": "0",             # Laptop built-in webcam (Device 0)
    "capture_interval": 1.0,        # seconds between automatic captures
    "confidence_threshold": 0.25,  # YOLO confidence cutoff
    "iou_threshold": 0.45,         # NMS IoU threshold
    "retention_period": 100,       # seconds to retain image files
    "input_dim": 640,              # YOLO11n input resolution (640x640)
    "queue_maxsize": 3,            # max items in inference queue before dropping
}

