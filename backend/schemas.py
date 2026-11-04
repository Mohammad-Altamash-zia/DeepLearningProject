from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CameraConnectRequest(BaseModel):
    url: str = Field(..., description="Camera stream URL, e.g. http://192.168.1.100:8080/video or RTSP link")


class CameraTestRequest(BaseModel):
    url: str = Field(..., description="Camera stream URL to test")


class SettingsUpdateRequest(BaseModel):
    camera_url: Optional[str] = None
    capture_interval: Optional[float] = Field(None, ge=0.2, le=60.0)
    confidence_threshold: Optional[float] = Field(None, ge=0.01, le=1.0)
    iou_threshold: Optional[float] = Field(None, ge=0.01, le=1.0)
    retention_period: Optional[int] = Field(None, ge=10, le=86400)


class SingleInspectionRequest(BaseModel):
    use_sample: Optional[bool] = False
    sample_type: Optional[str] = "defect"  # "clean" or "defect"

