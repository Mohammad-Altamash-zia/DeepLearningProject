from fastapi import APIRouter
from backend.database import db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def get_analytics_summary():
    """Returns primary KPI metrics: total inspections, pass/fail counts, defect rate, and avg latency."""
    return db.get_analytics_summary()


@router.get("/defects")
def get_defect_distribution():
    """Returns defect count and percentage breakdown across Class 1-4."""
    return db.get_defect_distribution()


@router.get("/timeline")
def get_inspection_timeline():
    """Returns hourly chronological inspection counts for dashboard chart."""
    return db.get_inspection_timeline()

