import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List, Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api import camera, inspection, analytics, system
from backend.services.camera_service import camera_service
from backend.services.cleanup_service import cleanup_service
from backend.services.inference_service import inference_service
from backend.services.inspection_service import inspection_service

# Configure Root Logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("inspectai.main")


class ConnectionManager:
    """Manages active WebSocket connections for real-time dashboard events."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.loop: Optional[asyncio.AbstractEventLoop] = None

    def set_loop(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    def broadcast_sync(self, message: dict):
        """Thread-safe broadcast from synchronous worker threads to async WebSocket clients."""
        if not self.active_connections or not self.loop or self.loop.is_closed():
            return

        async def _send():
            stale = []
            for connection in list(self.active_connections):
                try:
                    await connection.send_json(message)
                except Exception:
                    stale.append(connection)
            for c in stale:
                self.disconnect(c)

        try:
            asyncio.run_coroutine_threadsafe(_send(), self.loop)
        except Exception as e:
            logger.debug(f"Error scheduling websocket broadcast: {e}")


ws_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting InspectAI backend services...")
    loop = asyncio.get_running_loop()
    ws_manager.set_loop(loop)

    # Register websocket broadcast callback in inspection service
    inspection_service.register_broadcast_callback(ws_manager.broadcast_sync)

    # Start 100-second image retention cleanup service
    cleanup_service.start()

    logger.info(
        f"InspectAI ready. Model loaded: {inference_service.is_loaded}. "
        f"Classes: {inference_service.class_names}"
    )
    yield

    # Shutdown
    logger.info("Shutting down InspectAI services...")
    inspection_service.stop_inspection()
    camera_service.disconnect()
    cleanup_service.stop()
    logger.info("Shutdown complete.")


app = FastAPI(
    title="InspectAI - Industrial Defect Detection API",
    description="Real-time quality inspection system powered by YOLO11n ONNX",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend development and local deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(camera.router)
app.include_router(inspection.router)
app.include_router(analytics.router)
app.include_router(system.router)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time event stream for the InspectAI dashboard."""
    await ws_manager.connect(websocket)
    try:
        # Send initial status snapshot on connect
        await websocket.send_json({
            "type": "INIT_STATE",
            "data": {
                "camera": camera_service.get_status(),
                "inspection": inspection_service.get_status(),
                "model_loaded": inference_service.is_loaded,
            },
        })

        # Keep connection open and receive heartbeats / pings
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.debug(f"WebSocket session closed: {e}")
        ws_manager.disconnect(websocket)


# Mount Static Frontend Distribution if built
from fastapi.responses import FileResponse
from backend.config import PROJECT_DIR

frontend_dist = PROJECT_DIR / "frontend" / "dist"
if (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(frontend_dist / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)

