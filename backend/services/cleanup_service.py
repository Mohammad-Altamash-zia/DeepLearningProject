import os
import time
import threading
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

from backend.config import CAPTURES_DIR, ANNOTATED_DIR
from backend.database import db

logger = logging.getLogger("inspectai.cleanup")


class CleanupService:
    def __init__(self, check_interval_sec: float = 3.0):
        self.check_interval_sec = check_interval_sec
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def start(self):
        """Starts background retention manager."""
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._cleanup_loop, daemon=True, name="InspectAI-Cleanup")
        self._thread.start()
        logger.info("Image retention cleanup service started.")

    def stop(self):
        """Stops background retention manager."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        logger.info("Image retention cleanup service stopped.")

    def _cleanup_loop(self):
        while self._running:
            try:
                self.run_cleanup_cycle()
            except Exception as e:
                logger.error(f"Error during image retention cleanup: {e}", exc_info=True)
            time.sleep(self.check_interval_sec)

    def run_cleanup_cycle(self) -> int:
        """
        Deletes capture and annotated images older than the retention period.
        Default: 100 seconds.
        """
        try:
            retention_seconds = float(db.get_setting("retention_period", 100))
        except (ValueError, TypeError):
            retention_seconds = 100.0

        now = time.time()
        cutoff_time = now - retention_seconds
        deleted_count = 0

        # Scan both captures and annotated folders
        for folder in [CAPTURES_DIR, ANNOTATED_DIR]:
            p = Path(folder)
            if not p.exists():
                continue

            for img_file in p.glob("*.jpg"):
                try:
                    mtime = img_file.stat().st_mtime
                    # If file age > retention_seconds (and at least 5 seconds old to prevent race with writes)
                    if mtime < cutoff_time and (now - mtime) > 5.0:
                        img_file.unlink(missing_ok=True)
                        deleted_count += 1
                except Exception as e:
                    logger.debug(f"Failed to delete {img_file.name}: {e}")

        # Update database records so inspection history notes image expiration
        cutoff_iso = (datetime.now(timezone.utc) - timedelta(seconds=retention_seconds)).isoformat()
        db.mark_images_expired(cutoff_iso)

        if deleted_count > 0:
            logger.info(f"Cleanup cycle removed {deleted_count} expired images older than {retention_seconds}s.")

        return deleted_count


cleanup_service = CleanupService()

