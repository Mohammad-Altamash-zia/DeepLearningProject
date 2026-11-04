from typing import Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
import cv2
import numpy as np

from backend.config import TEST_IMAGES_DIR
from backend.database import db
from backend.schemas import SingleInspectionRequest
from backend.services.camera_service import camera_service
from backend.services.inspection_service import inspection_service

router = APIRouter(prefix="/api", tags=["Inspection"])


@router.post("/inspection/start")
def start_inspection():
    """Starts the 1-second automated capture and inference pipeline."""
    try:
        success = inspection_service.start_inspection()
        return {"success": success, "message": "Inspection started.", "status": inspection_service.get_status()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inspection/stop")
def stop_inspection():
    """Stops automated inspection."""
    try:
        success = inspection_service.stop_inspection()
        return {"success": success, "message": "Inspection stopped.", "status": inspection_service.get_status()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inspection/status")
def get_inspection_status():
    """Returns runtime telemetry for inspection processing."""
    return inspection_service.get_status()


@router.post("/inspection/test-single")
def test_single_inspection(req: Optional[SingleInspectionRequest] = None):
    """
    Executes a single test inspection on demand.
    Can test current camera frame or built-in steel sample image.
    """
    try:
        frame = None
        source_name = "Camera Frame"

        if req and req.use_sample:
            sample_file = "defect_steel.jpg" if req.sample_type == "defect" else "clean_steel.jpg"
            p = TEST_IMAGES_DIR / sample_file
            if p.exists():
                frame = cv2.imread(str(p))
                source_name = f"Sample Image ({sample_file})"

        if frame is None:
            frame = camera_service.get_latest_frame()

        if frame is None or frame.size == 0:
            raise HTTPException(
                status_code=400,
                detail="No camera frame or test image available to inspect. Connect camera or select sample image.",
            )

        result = inspection_service.inspect_single(frame, source_name=source_name)
        return {"success": True, "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/inspection/upload")
async def upload_and_inspect_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file (JPG, PNG, WebP), executes YOLO11n defect detection,
    stores the persistent inspection record, and returns the annotated result.
    """
    try:
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format.")

        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None or frame.size == 0:
            raise HTTPException(status_code=400, detail="Failed to decode uploaded image data.")

        source_name = f"File Upload ({file.filename})"
        result = inspection_service.inspect_single(frame, source_name=source_name)
        return {"success": True, "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image inspection failed: {str(e)}")


@router.get("/inspections")
def list_inspections(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Returns paginated historical inspection records."""
    return db.get_inspections(page=page, limit=limit, status=status, search=search)


@router.get("/inspections/{inspection_id}")
def get_inspection(inspection_id: int):
    """Returns full details and bounding box detections for a specific inspection."""
    inspection = db.get_inspection_by_id(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection record not found.")
    return inspection

