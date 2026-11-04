# InspectAI — Industrial Defect Detection & Quality Inspection System

InspectAI is a production-grade, local industrial quality inspection system designed for steel manufacturing and surface defect detection. Powered by an Ultralytics YOLO11n model exported to ONNX and trained on the Severstal Steel Defect Detection dataset, InspectAI interfaces with mobile phone IP cameras over local Wi-Fi to deliver real-time visual inspection, PASS/FAIL gating decisions, and rolling image retention.

---

## Architecture Overview

```
                               Mobile Phone IP Camera
                               (e.g. IP Webcam app)
                                         │
                                         ▼
                               Camera Stream Receiver
                            (OpenCV Low-Latency Reader)
                                         │
                                         ▼
                           1-Second Capture Scheduler
                                         │
                                         ▼
                              Inference Buffer Queue
                           (Frame-Dropping Overflow Policy)
                                         │
                                         ▼
                                YOLO11n ONNX Model
                             (ONNX Runtime CPU / GPU)
                                         │
                                         ▼
                            Defect Detection Processing
                          (Aspect Letterboxing & Scaled NMS)
                                         │
                                         ▼
                                PASS / FAIL Decision
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
             SQLite Database                       Local Image Storage
          (inspections, detections)              (storage/captures & annotated)
                     │                                       │
                     │                           Rolling 100s Retention Daemon
                     │                                       │
                     └───────────────────┬───────────────────┘
                                         ▼
                                  FastAPI Backend
                               (REST Endpoints & /ws)
                                         │
                                         ▼
                               React + Vite Dashboard
                         (Industrial UI with Recharts)
```

---

## Key Features

1. **Mobile Phone IP Camera Receiver:**
   - Connects to any mobile IP camera streaming over Wi-Fi (HTTP MJPEG, RTSP, or local webcam).
   - Dedicated background thread pulls unbuffered frames to eliminate OpenCV frame latency.
   - Non-disruptive stream connection testing, automatic reconnection on network drops, and fallback steel surface simulation.
2. **YOLO11n ONNX Inference:**
   - Direct execution via `onnxruntime` with letterbox aspect-ratio preservation.
   - Zero-shot inference time measurement (~30–45ms per frame on CPU).
   - Detects all 4 Severstal Steel Defect classes:
     - **Class_1:** Pitted Surface
     - **Class_2:** Inclusions & Cracks
     - **Class_3:** Scratches & Gouges
     - **Class_4:** Patches & Large Delaminations
3. **1-Second Automated Inspection Scheduler:**
   - Captures exactly 1 frame per second during active inspection.
   - Bounded inference queue with automated frame-dropping policy to prevent memory backlog.
   - Live telemetry tracking: Captured, Processed, and Skipped frames.
4. **PASS / FAIL Decision Engine:**
   - **PASS:** No defects detected above the configurable confidence threshold.
   - **FAIL:** One or more defect instances detected. Annotated bounding boxes with class tags and confidence percentages are rendered and saved.
5. **Rolling 100-Second Image Retention:**
   - Background cleanup daemon continuously purges image files (`storage/captures/` and `storage/annotated/`) older than 100 seconds to protect local disk space.
   - **Full historical text metadata and detection telemetry remain permanently stored in SQLite.**
6. **Dark Industrial Dashboard UI:**
   - Built with React, Vite, Tailwind CSS, Lucide icons, and Recharts.
   - Side-by-side Live Camera Stream and Latest AI Annotated Inspection frame.
   - Real-time WebSocket event feed (zero page reloads).
   - Paginated inspection history with modal detail viewer and retention status badges.
   - Historical analytics charts (PASS vs FAIL donut, Severstal class distributions, timeline trends).

---

## Folder Structure

```
DeepLearning/
├── backend/
│   ├── api/
│   │   ├── analytics.py        # Analytics KPI & chart endpoints
│   │   ├── camera.py           # Camera connect, disconnect, stream endpoints
│   │   ├── inspection.py       # Inspection start/stop, tests & pagination
│   │   └── system.py           # Health, model status, settings & images
│   ├── services/
│   │   ├── camera_service.py   # OpenCV thread-safe camera reader & MJPEG streamer
│   │   ├── cleanup_service.py  # Rolling 100-second image retention daemon
│   │   ├── inference_service.py# ONNX Runtime YOLO11n inference & NMS
│   │   ├── inspection_service.py # 1-second capture scheduler & inference queue
│   │   └── storage_service.py  # Image write/read management
│   ├── config.py               # Paths, defect classes, default settings
│   ├── database.py             # SQLite WAL-mode connection & schema queries
│   ├── main.py                 # FastAPI application & WebSocket server
│   ├── requirements.txt        # Backend Python dependencies
│   └── schemas.py              # Pydantic request & response models
├── frontend/
│   ├── src/
│   │   ├── components/         # Sidebar, TopHeader, MetricCards
│   │   ├── pages/              # LiveInspection, Dashboard, History, Analytics, Settings
│   │   ├── services/           # REST API client & WebSocket manager
│   │   ├── App.jsx             # Root layout & real-time event router
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── models/
│   └── inspectai_yolo11n.onnx  # Trained YOLO11n ONNX model (Severstal steel dataset)
├── storage/
│   ├── captures/               # Raw captured images (100s rolling buffer)
│   └── annotated/              # Annotated detection images (100s rolling buffer)
├── database/
│   └── inspectai.db            # Persistent SQLite database
├── test_images/                # Sample clean and defective steel test strips
├── results/                    # Test inspection outputs
├── .env.example
├── .gitignore
├── run.sh                      # Linux / Git Bash single-command launcher
├── run.bat                     # Windows Command Prompt launcher
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Python:** 3.10, 3.11, 3.12, 3.13, or 3.14
- **Node.js:** v18+ and npm
- **Operating System:** Windows, Linux, or macOS

### 1. Setup Python Virtual Environment
```bash
# In the project root
python -m venv venv

# On Linux / Git Bash:
source venv/bin/activate

# On Windows CMD / PowerShell:
# venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## How to Connect Your Mobile Phone IP Camera

You can use any Android or iOS device as an industrial IP camera:

1. **Install an IP Camera App:**
   - Android: **IP Webcam** by Pavel Khlebovich (recommended) or **DroidCam**.
   - iOS: **IP Camera Lite** or **EpocCam**.
2. **Connect to Wi-Fi:**
   - Ensure your phone and the host PC are connected to the same local Wi-Fi router.
3. **Start the Stream:**
   - In IP Webcam, scroll down and tap **Start server**.
   - Note the URL displayed on the phone screen (e.g., `http://192.168.1.105:8080`).
4. **Connect in InspectAI:**
   - In the InspectAI dashboard, enter:
     ```text
     http://192.168.1.105:8080/video
     ```
   - Click **Connect Camera** or test via the **Camera Settings** tab.
   - The live feed will immediately appear in the console.

> **Offline/Simulation Mode:** If your mobile phone is not on the same network or you are testing offline, click **Simulate Feed** or select a sample steel strip from the **Test Frame** dropdown.

---

## Running the Application

### Option A: One-Click Startup Script

**On Linux or Windows Git Bash:**
```bash
./run.sh
```

**On Windows Command Prompt:**
```cmd
run.bat
```

### Option B: Manual Two-Terminal Startup (Development Mode)

**Terminal 1 (FastAPI Backend):**
```bash
source venv/bin/activate    # or venv\Scripts\activate on Windows
export PYTHONPATH=.         # or set PYTHONPATH=%cd% on Windows CMD
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (React Vite Frontend):**
```bash
cd frontend
npm run dev
```

Open your browser at:
- **Frontend Development Server:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend & API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Built Production Bundle:** [http://localhost:8000](http://localhost:8000)

---

## Configuration Options

Settings can be customized live from the **Camera Settings** dashboard tab or modified in SQLite:

| Setting | Default | Description |
| :--- | :--- | :--- |
| `camera_url` | `http://192.168.1.100:8080/video` | IP camera MJPEG/RTSP stream URL or webcam device index |
| `capture_interval` | `1.0` | Cadence in seconds between automated inspection captures |
| `confidence_threshold` | `0.25` | YOLO defect detection confidence threshold (0.05 to 0.95) |
| `iou_threshold` | `0.45` | Non-Maximum Suppression (NMS) overlap threshold |
| `retention_period` | `100` | Rolling retention buffer in seconds for stored image files |
| `model_path` | `models/inspectai_yolo11n.onnx` | Path to trained ONNX model |

---

## Verification & Testing Suite

InspectAI includes verification tests for all system components:

1. **ONNX Model & Inference Test:**
   ```bash
   PYTHONPATH=. python -c "
   import cv2
   from backend.services.inference_service import inference_service
   img = cv2.imread('test_images/defect_steel.jpg')
   status, dets, _, latency = inference_service.predict(img)
   print(f'Test Result: {status}, Defects: {len(dets)}, Latency: {latency:.1f}ms')
   "
   ```
2. **Database & Retention Test:**
   ```bash
   PYTHONPATH=. python -c "
   from backend.database import db
   from backend.services.cleanup_service import cleanup_service
   print('Analytics:', db.get_analytics_summary())
   deleted = cleanup_service.run_cleanup_cycle()
   print(f'Pruned {deleted} expired images from rolling buffer.')
   "
   ```
3. **Camera Stream Prober:**
   ```bash
   PYTHONPATH=. python -c "
   from backend.services.camera_service import camera_service
   success, msg = camera_service.test_connection('http://192.168.1.100:8080/video')
   print('Probe Result:', success, msg)
   "
   ```

---

## Known Limitations & Best Practices

1. **Network Bandwidth on Wi-Fi:** Ensure your phone is connected to 5GHz Wi-Fi if using high resolutions (1080p+) to prevent network packet drops.
2. **Lighting Consistency:** In manufacturing defect detection, consistent non-glare top lighting yields optimal bounding-box precision.
3. **CPU vs GPU:** Default execution provider is `CPUExecutionProvider`. For GPU acceleration on Windows with NVIDIA, install `onnxruntime-gpu` and compatible CUDA/cuDNN drivers.

