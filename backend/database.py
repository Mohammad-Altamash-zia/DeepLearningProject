import sqlite3
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path

from backend.config import DATABASE_PATH, DEFAULT_SETTINGS

logger = logging.getLogger("inspectai.database")


class Database:
    def __init__(self, db_path: Path = DATABASE_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        """Returns a connection with dictionary-like row access."""
        conn = sqlite3.connect(str(self.db_path), timeout=15.0)
        conn.row_factory = sqlite3.Row
        # Enable WAL mode for high concurrency between reader/writer threads
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def init_db(self):
        """Initializes tables, indexes and default settings."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Inspections Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS inspections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_code TEXT UNIQUE NOT NULL,
                timestamp TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('PASS', 'FAIL')),
                defect_count INTEGER NOT NULL DEFAULT 0,
                inference_time_ms REAL NOT NULL,
                image_filename TEXT,
                annotated_image_filename TEXT,
                camera_source TEXT,
                processing_status TEXT NOT NULL DEFAULT 'COMPLETED'
            );
            """)

            # 2. Detections Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_id INTEGER NOT NULL,
                class_id INTEGER NOT NULL,
                class_name TEXT NOT NULL,
                confidence REAL NOT NULL,
                x1 INTEGER NOT NULL,
                y1 INTEGER NOT NULL,
                x2 INTEGER NOT NULL,
                y2 INTEGER NOT NULL,
                FOREIGN KEY (inspection_id) REFERENCES inspections (id) ON DELETE CASCADE
            );
            """)

            # 3. Application Settings Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS application_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_name TEXT UNIQUE NOT NULL,
                setting_value TEXT NOT NULL
            );
            """)

            # Create Indexes for high-performance querying
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_inspections_timestamp ON inspections(timestamp);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_inspections_code ON inspections(inspection_code);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_detections_insp_id ON detections(inspection_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_detections_class_name ON detections(class_name);")

            # Seed default application settings if missing
            for name, val in DEFAULT_SETTINGS.items():
                cursor.execute(
                    "INSERT OR IGNORE INTO application_settings (setting_name, setting_value) VALUES (?, ?);",
                    (name, str(val)),
                )

            conn.commit()
            logger.info("Database initialized successfully at %s", self.db_path)

    # ------------------ Inspections CRUD ------------------

    def save_inspection(
        self,
        inspection_code: str,
        timestamp: str,
        status: str,
        defect_count: int,
        inference_time_ms: float,
        image_filename: Optional[str],
        annotated_image_filename: Optional[str],
        camera_source: str,
        detections: List[Dict[str, Any]],
    ) -> int:
        """Stores an inspection record and associated detections in an atomic transaction."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO inspections (
                    inspection_code, timestamp, status, defect_count,
                    inference_time_ms, image_filename, annotated_image_filename,
                    camera_source, processing_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED')
                """,
                (
                    inspection_code,
                    timestamp,
                    status,
                    defect_count,
                    inference_time_ms,
                    image_filename,
                    annotated_image_filename,
                    camera_source,
                ),
            )
            inspection_id = cursor.lastrowid

            if detections:
                det_rows = [
                    (
                        inspection_id,
                        d["class_id"],
                        d["class_name"],
                        d["confidence"],
                        d["x1"],
                        d["y1"],
                        d["x2"],
                        d["y2"],
                    )
                    for d in detections
                ]
                cursor.executemany(
                    """
                    INSERT INTO detections (
                        inspection_id, class_id, class_name, confidence, x1, y1, x2, y2
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    det_rows,
                )

            conn.commit()
            return inspection_id

    def get_inspections(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Returns paginated inspections with total counts."""
        offset = max(0, (page - 1) * limit)
        query = "SELECT * FROM inspections WHERE 1=1"
        count_query = "SELECT COUNT(*) as total FROM inspections WHERE 1=1"
        params: List[Any] = []

        if status and isinstance(status, str) and status.upper() in ["PASS", "FAIL"]:
            query += " AND status = ?"
            count_query += " AND status = ?"
            params.append(status.upper())

        if search and isinstance(search, str):
            query += " AND (inspection_code LIKE ? OR timestamp LIKE ?)"
            count_query += " AND (inspection_code LIKE ? OR timestamp LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(count_query, params)
            total = cursor.fetchone()["total"]

            query += " ORDER BY id DESC LIMIT ? OFFSET ?"
            cursor.execute(query, params + [limit, offset])
            rows = [dict(r) for r in cursor.fetchall()]

        return {
            "items": rows,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
        }

    def get_inspection_by_id(self, inspection_id: int) -> Optional[Dict[str, Any]]:
        """Retrieves a single inspection with its detections."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,))
            row = cursor.fetchone()
            if not row:
                return None

            inspection = dict(row)
            cursor.execute(
                "SELECT id, class_id, class_name, confidence, x1, y1, x2, y2 FROM detections WHERE inspection_id = ? ORDER BY confidence DESC",
                (inspection_id,),
            )
            inspection["detections"] = [dict(r) for r in cursor.fetchall()]
            return inspection

    def get_recent_inspections(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns latest inspections for real-time dashboard activity."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM inspections ORDER BY id DESC LIMIT ?", (limit,)
            )
            return [dict(r) for r in cursor.fetchall()]

    # ------------------ Analytics ------------------

    def get_analytics_summary(self) -> Dict[str, Any]:
        """Calculates executive dashboard stats."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("""
                SELECT 
                    COUNT(*) as total_inspections,
                    SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as pass_count,
                    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as fail_count,
                    AVG(inference_time_ms) as avg_inference_time,
                    SUM(defect_count) as total_defects
                FROM inspections
            """)
            row = cursor.fetchone()

            total = row["total_inspections"] or 0
            pass_cnt = row["pass_count"] or 0
            fail_cnt = row["fail_count"] or 0
            avg_time = round(row["avg_inference_time"] or 0.0, 2)
            total_defects = row["total_defects"] or 0
            defect_rate = round((fail_cnt / total * 100.0), 2) if total > 0 else 0.0

            # Today stats
            today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            cursor.execute(
                "SELECT COUNT(*) as today_total FROM inspections WHERE timestamp LIKE ?",
                (f"{today_str}%",),
            )
            today_total = cursor.fetchone()["today_total"] or 0

            return {
                "total_inspections": total,
                "pass_count": pass_cnt,
                "fail_count": fail_cnt,
                "defect_detection_rate": defect_rate,
                "avg_inference_time_ms": avg_time,
                "total_defects_found": total_defects,
                "today_inspections": today_total,
            }

    def get_defect_distribution(self) -> List[Dict[str, Any]]:
        """Returns count and percentage for each defect class."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT class_name, COUNT(*) as count
                FROM detections
                GROUP BY class_name
                ORDER BY count DESC
            """)
            rows = cursor.fetchall()

            total_detections = sum(r["count"] for r in rows)
            result = []
            # Make sure all 4 classes are present even if count is 0
            existing_classes = {r["class_name"]: r["count"] for r in rows}
            for cid in range(1, 5):
                cname = f"Class_{cid}"
                cnt = existing_classes.get(cname, 0)
                pct = round((cnt / total_detections * 100.0), 1) if total_detections > 0 else 0.0
                result.append({
                    "class_name": cname,
                    "count": cnt,
                    "percentage": pct,
                })
            return result

    def get_inspection_timeline(self, limit: int = 24) -> List[Dict[str, Any]]:
        """Returns inspection counts grouped by hour/period for Recharts."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Group by hour substring YYYY-MM-DD HH
            cursor.execute("""
                SELECT 
                    substr(timestamp, 1, 13) as time_slot,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as pass_count,
                    SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as fail_count,
                    AVG(inference_time_ms) as avg_latency
                FROM inspections
                GROUP BY time_slot
                ORDER BY time_slot DESC
                LIMIT ?
            """, (limit,))
            rows = [dict(r) for r in cursor.fetchall()]
            # Reverse so chronological left to right
            rows.reverse()
            return rows

    # ------------------ Settings ------------------

    def get_setting(self, name: str, default: Any = None) -> Any:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT setting_value FROM application_settings WHERE setting_name = ?", (name,))
            row = cursor.fetchone()
            if row:
                return row["setting_value"]
            return default

    def set_setting(self, name: str, value: Any):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO application_settings (setting_name, setting_value)
                VALUES (?, ?)
                ON CONFLICT(setting_name) DO UPDATE SET setting_value = excluded.setting_value
                """,
                (name, str(value)),
            )
            conn.commit()

    def get_all_settings(self) -> Dict[str, str]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT setting_name, setting_value FROM application_settings")
            return {r["setting_name"]: r["setting_value"] for r in cursor.fetchall()}

    # ------------------ Image Retention Status ------------------

    def mark_images_expired(self, cutoff_iso: str) -> int:
        """Marks records older than cutoff as having expired images."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE inspections
                SET processing_status = 'IMAGE_EXPIRED'
                WHERE timestamp < ? AND processing_status = 'COMPLETED'
                """,
                (cutoff_iso,),
            )
            count = cursor.rowcount
            conn.commit()
            return count


# Module-level singleton
db = Database()
