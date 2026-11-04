from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.schemas import CameraConnectRequest, CameraTestRequest
from backend.services.camera_service import camera_service

router = APIRouter(prefix="/api/camera", tags=["Camera"])


@router.post("/connect")
def connect_camera(req: CameraConnectRequest):
    """Connects to a mobile phone IP camera stream or RTSP URL."""
    try:
        success = camera_service.connect(req.url)
        return {"success": success, "message": "Camera connection initiated.", "camera": camera_service.get_status()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/disconnect")
def disconnect_camera():
    """Disconnects the camera and safely frees hardware handles."""
    try:
        camera_service.disconnect()
        return {"success": True, "message": "Camera disconnected.", "camera": camera_service.get_status()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
def test_camera_connection(req: CameraTestRequest):
    """Tests connection to an IP camera stream without disrupting the active stream."""
    success, msg = camera_service.test_connection(req.url)
    return {"success": success, "message": msg}


@router.get("/status")
def get_camera_status():
    """Returns real-time camera connection status, FPS, and resolution."""
    return camera_service.get_status()


@router.get("/devices")
def get_available_cameras():
    """Returns list of connected laptop webcams."""
    return camera_service.list_available_webcams()


@router.get("/stream")
def get_camera_stream():
    """MJPEG live video stream endpoint for dashboard video player."""
    return StreamingResponse(
        camera_service.generate_mjpeg_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.post("/fallback")
def enable_camera_fallback():
    """Enables simulated steel coil video stream when physical phone is not connected."""
    camera_service.enable_fallback_simulation()
    return {"success": True, "message": "Simulated steel surface camera feed activated.", "camera": camera_service.get_status()}

