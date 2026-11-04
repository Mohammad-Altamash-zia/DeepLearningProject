import os
import time
import logging
from pathlib import Path
from typing import Optional, Tuple
import cv2
import numpy as np

from backend.config import CAPTURES_DIR, ANNOTATED_DIR

logger = logging.getLogger("inspectai.storage")


class StorageService:
    def __init__(self):
        self.captures_dir = Path(CAPTURES_DIR)
        self.annotated_dir = Path(ANNOTATED_DIR)
        self.captures_dir.mkdir(parents=True, exist_ok=True)
        self.annotated_dir.mkdir(parents=True, exist_ok=True)
        self._latest_annotated_filename: Optional[str] = None

    def save_capture(self, img_bgr: np.ndarray, inspection_code: str, timestamp_str: str) -> str:
        """Saves original raw frame to storage/captures/."""
        clean_ts = timestamp_str.replace(":", "-").replace(".", "-")
        filename = f"capture_{inspection_code}_{clean_ts}.jpg"
        filepath = self.captures_dir / filename
        cv2.imwrite(str(filepath), img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        return filename

    def save_annotated(self, img_bgr: np.ndarray, inspection_code: str, timestamp_str: str) -> str:
        """Saves annotated inspection frame to storage/annotated/."""
        clean_ts = timestamp_str.replace(":", "-").replace(".", "-")
        filename = f"annotated_{inspection_code}_{clean_ts}.jpg"
        filepath = self.annotated_dir / filename
        cv2.imwrite(str(filepath), img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        self._latest_annotated_filename = filename
        return filename

    def get_image_path(self, filename: str) -> Optional[Path]:
        """Finds image in captures or annotated folders."""
        if not filename:
            return None

        # Check captures
        p1 = self.captures_dir / filename
        if p1.exists():
            return p1

        # Check annotated
        p2 = self.annotated_dir / filename
        if p2.exists():
            return p2

        return None

    def get_latest_annotated_path(self) -> Optional[Path]:
        """Returns path to the most recent annotated frame."""
        if self._latest_annotated_filename:
            p = self.annotated_dir / self._latest_annotated_filename
            if p.exists():
                return p

        # Fallback: find newest file in annotated_dir
        try:
            files = list(self.annotated_dir.glob("annotated_*.jpg"))
            if files:
                latest = max(files, key=os.path.getmtime)
                self._latest_annotated_filename = latest.name
                return latest
        except Exception:
            pass
        return None


storage_service = StorageService()

