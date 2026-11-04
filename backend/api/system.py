import os
import time
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse

try:
    import psutil
except ImportError:
    psutil = None

from backend.config import MODEL_PATH, DEFAULT_SETTINGS
from backend.database import db
from backend.schemas import SettingsUpdateRequest
from backend.services.inference_service import inference_service
from backend.services.storage_service import storage_service

router = APIRouter(prefix="/api", tags=["System"])

SERVER_START_TIME = time.time()


@router.get("/health")
def health_check():
    """System diagnostic health endpoint."""
    uptime_sec = int(time.time() - SERVER_START_TIME)
    
    ram_mb = 0.0
    cpu_pct = 0.0
    if psutil is not None:
        try:
            process = psutil.Process(os.getpid())
            mem_info = process.memory_info()
            ram_mb = round(mem_info.rss / (1024 * 1024), 1)
            cpu_pct = psutil.cpu_percent()
        except Exception:
            pass

    return {
        "status": "online",
        "service": "InspectAI Quality Inspection System",
        "uptime_seconds": uptime_sec,
        "memory_mb": ram_mb,
        "cpu_usage_pct": cpu_pct,
        "database": "connected" if db.db_path.exists() else "error",
        "model_loaded": inference_service.is_loaded,
    }


@router.get("/model/status")
def model_status():
    """Returns detailed ONNX model specifications."""
    return {
        "is_loaded": inference_service.is_loaded,
        "model_path": str(inference_service.model_path),
        "input_name": inference_service.input_name,
        "input_dimensions": inference_service.input_shape,
        "output_tensors": inference_service.output_names,
        "classes": inference_service.class_names,
        "execution_providers": inference_service.providers,
        "load_error": inference_service.load_error,
    }


@router.get("/settings")
def get_settings():
    """Returns current persistent settings."""
    settings = db.get_all_settings()
    # Fill in defaults if any key missing
    for k, v in DEFAULT_SETTINGS.items():
        if k not in settings:
            settings[k] = str(v)
    return settings


@router.post("/settings")
def update_settings(req: SettingsUpdateRequest):
    """Updates persistent system parameters."""
    updates = req.model_dump(exclude_unset=True)
    for k, v in updates.items():
        if v is not None:
            db.set_setting(k, v)
    return {"success": True, "message": "Settings updated successfully.", "settings": db.get_all_settings()}


@router.get("/images/latest")
def get_latest_annotated_image():
    """Returns the most recent annotated frame file."""
    path = storage_service.get_latest_annotated_path()
    if path and path.exists():
        return FileResponse(str(path), media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="No annotated images generated yet.")


@router.get("/images/{filename}")
def get_stored_image(filename: str):
    """Serves a stored capture or annotated inspection image."""
    path = storage_service.get_image_path(filename)
    if path and path.exists():
        return FileResponse(str(path), media_type="image/jpeg")
    
    # Check if the image has expired due to 100-second retention
    raise HTTPException(
        status_code=404,
        detail="Image file is not available. The image may have expired and been cleaned up by the 100-second retention policy. Metadata is still preserved in database.",
    )
