# InspectAI — Autonomous Industrial Defect Detection System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![YOLO11n](https://img.shields.io/badge/YOLO11-Ultralytics_ONNX-00FFFF?style=flat)](https://github.com/ultralytics/ultralytics)
[![React 18](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_6-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite_WAL-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**InspectAI** is a local-first, autonomous quality inspection platform engineered for high-speed manufacturing lines, steel processing mills, and visual quality assurance. Powered by an Ultralytics **YOLO11n** model exported to **ONNX Runtime** and trained on the industrial **Severstal Steel Defect Detection** benchmark, InspectAI continuously ingests visual feeds, computes sub-second defect bounding boxes, enforces strict **PASS / FAIL** acceptance gating, and maintains a dual-tier storage strategy (rolling 100-second disk buffer + permanent SQLite audit logging).

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Design System & UI/UX](#design-system--uiux)
- [Severstal Defect Taxonomy & Training](#severstal-defect-taxonomy--training)
- [Hardware & Stream Input Flexibility](#hardware--stream-input-flexibility)
- [Project Directory Structure](#project-directory-structure)
- [Quick Start Guide](#quick-start-guide)
  - [Automated Single-Command Launcher](#1-automated-launcher-recommended)
  - [Manual Production Deployment](#2-manual-step-by-step-single-port-8000)
  - [Frontend & Backend Development Mode](#3-development-mode-hot-reloading)
- [Dual-Tiered Storage & Retention Architecture](#dual-tiered-storage--retention-architecture)
- [REST API & WebSocket Reference](#rest-api--websocket-reference)
- [Verification & Diagnostic Suite](#verification--diagnostic-suite)
- [Team & Version Control](#team--version-control)

---

## System Architecture

```
                          INPUT STREAM SOURCES
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
 Integrated Webcam         Mobile Phone IP Camera      Manual Image Upload
(V4L2 /dev/video0)       (HTTP MJPEG / RTSP Wi-Fi)    (JPG / PNG / WebP files)
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                        Camera Stream Receiver
                     (OpenCV Threaded Reader Loop)
                                   │
                                   ▼
                      1-Second Inspection Cadence
                    (Bounded Thread-Safe Queue)
                                   │
                                   ▼
                     YOLO11n ONNX Inference Engine
               (Aspect Letterbox + NMS + Confidence Filter)
                                   │
                                   ▼
                       PASS / FAIL Decision Logic
                 [0 Defects = PASS  |  ≥1 Defect = FAIL]
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
         SQLite Database                   Local Disk Storage
      (Permanent Audit Trail)           (storage/captures & annotated)
      • Inspection code & timestamp     • High-resolution JPEG frames
      • Pass/fail status & counts       • Visual bounding box overlays
      • Precision bbox coordinates                      │
      • Latency & telemetry metrics                     ▼
                  │                        Rolling 100s Cleanup Daemon
                  │                        (Deletes raw/annotated images)
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                            FastAPI Backend
                    (REST API + /ws WebSocket Hub)
                                   │
                                   ▼
                         React 18 SPA Dashboard
              (Warm Neutral Cream UI, Recharts, Dark Mode)
```

---

## Key Features

1. **Multi-Input Camera & Ingestion Engine:**
   - **Integrated Webcam Auto-Connect:** Automatically acquires the local camera (`/dev/video0` / index `0`) at `640x480` on startup without requiring manual button clicks.
   - **Mobile IP Camera Support:** Connects over Wi-Fi to any Android or iOS device running apps like *IP Webcam*, *DroidCam*, or RTSP streams.
   - **Interactive File Upload:** Drag-and-drop or upload custom steel surface images for immediate single-frame inference and annotation.
   - **Zero-Latency Background Thread:** Decouples video capture from inference processing to prevent OpenCV internal buffer lag.
   - **Built-In Synthetic Simulation:** Generates continuous synthetic steel roll textures with injected defects when physical cameras are offline.

2. **YOLO11n ONNX Inference Pipeline:**
   - Lightweight, ultra-fast model (~30–50ms on standard CPUs) running via `onnxruntime`.
   - Maintains original aspect ratio through bilateral letterbox padding.
   - Non-Maximum Suppression (NMS) with configurable IoU and confidence thresholds.

3. **1-Second Inspection Cadence & Retention:**
   - Captures exactly 1 frame per second during active production runs.
   - Frame-dropping overflow policy to prevent backlog under heavy CPU load.
   - **100-Second Rolling Retention:** Background worker automatically removes images older than 100 seconds to conserve disk space.
   - **Permanent Telemetry Log:** All inspection records, defect coordinates, timestamps, and confidence scores remain in SQLite forever.

4. **Robust Single-Page Application (SPA) Resilience:**
   - **React ErrorBoundary:** Intercepts runtime UI exceptions with an inline recovery interface so the screen never goes blank on unexpected errors.
   - **Full SPA Routing:** Handles direct page refreshes (`/`, `/live`, `/history`, `/analytics`, `/settings`) with zero 404 or 500 errors.
   - **Safe Geometry Parsing:** Dual-compatible bounding box handling supporting both flat coordinates (`x1, y1, x2, y2`) and vector arrays (`[x1, y1, x2, y2]`).

---

## Design System & UI/UX

The dashboard UI was designed around an organic, tactile industrial aesthetic:

- **Color Palette & Tone:**
  - **Light Mode Background:** Soft, warm neutral cream / light taupe (`#F5F2EB`).
  - **Dark Mode Background:** Deep charcoal stone (`#141312`) with high-contrast text elements (`#F5F2EB`).
  - **Theme Persistence:** Stores user preference in browser `localStorage` and respects system preferences (`prefers-color-scheme`).
- **Squircle & Pill Geometry:**
  - Modern squircle container cards with rounded pill buttons (`rounded-3xl` and `rounded-2xl`).
- **Status & Highlight Accents:**
  - **Neon Lime Accent (`#84CC16`):** Indicates `PASS` quality status, active streaming nodes, and optimal health indicators.
  - **Earthy Terracotta (`#DC2626` / `#E06D53`):** Highlights `FAIL` defect rejections, bounding box boundaries, and critical alarms.
  - **Amber (`#F59E0B`):** Represents latency warnings and pending calibrations.
- **Micro-Interactions & Polish:**
  - Subtle multi-layered soft drop shadows (`shadow-sm` to `shadow-md`) delivering neo-morphic depth without clutter.
  - Live charts powered by Recharts (Severstal defect distribution, 24-hour yield bar charts, latency sparklines).

---

## Severstal Defect Taxonomy & Training

The detection model is trained on the Severstal Steel Defect dataset across 4 critical industrial flaw categories:

| Class ID | Defect Name | Description | Severity Impact |
| :---: | :--- | :--- | :---: |
| **Class_1** | Pitted Surface | Localized corrosion pits, surface cavities, and roll marks | Medium |
| **Class_2** | Inclusions & Cracks | Non-metallic structural inclusions, longitudinal fissures | High (Structural) |
| **Class_3** | Scratches & Gouges | Mechanical abrasion marks, guide scratches, gouging | Medium |
| **Class_4** | Patches & Delaminations | Large-scale scale patches, lamination tears, surface peeling | Critical (Rejection) |

### Training History & Model Weights
- **Model Checkpoints:**
  - ONNX Model: [`models/inspectai_yolo11n.onnx`](models/inspectai_yolo11n.onnx) (Optimized for edge CPU inference)
  - PyTorch Weights: [`models/best.pt`](models/best.pt)
- **Training Progression:** Logged in [`models/results.csv`](models/results.csv) across 100 epochs, reaching a validated $mAP_{50}$ of ~0.505 with low box/class/DFL losses.

---

## Hardware & Stream Input Flexibility

InspectAI can ingest video streams from several source types:

```bash
# 1. Local USB or Laptop Webcam (default index 0)
0

# 2. Linux Video Device Path
/dev/video0

# 3. Mobile IP Webcam (Android)
http://192.168.1.105:8080/video

# 4. RTSP Industrial Security / IP Camera
rtsp://admin:password@192.168.1.50:554/h264Preview_01_main
```

---

## Project Directory Structure

```
DeepLearning/
├── backend/
│   ├── api/
│   │   ├── analytics.py            # Analytics summary & distribution endpoints
│   │   ├── camera.py               # Camera connection, devices & MJPEG stream
│   │   ├── inspection.py           # Cadence start/stop, single test, upload & history
│   │   └── system.py               # Health checks, model status, image serving
│   ├── services/
│   │   ├── camera_service.py       # Threaded OpenCV reader & synthetic simulator
│   │   ├── cleanup_service.py      # Rolling 100-second retention pruning worker
│   │   ├── inference_service.py    # ONNX Runtime YOLO11n inference & annotation
│   │   ├── inspection_service.py   # 1-second cadence scheduler & queue
│   │   └── storage_service.py      # File system image writer & paths
│   ├── config.py                   # Paths, defect classes, default tolerances
│   ├── database.py                 # SQLite WAL connection, schemas & queries
│   ├── main.py                     # FastAPI app, WebSocket manager, SPA static routes
│   ├── requirements.txt            # Python dependencies
│   └── schemas.py                  # Pydantic request & response models
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MetricCards.jsx     # Top KPI metric cards
│   │   │   ├── Sidebar.jsx         # Navigation menu
│   │   │   └── TopHeader.jsx       # Top navigation, status pills, dark mode toggle
│   │   ├── pages/
│   │   │   ├── About.jsx           # System specifications & model documentation
│   │   │   ├── Analytics.jsx       # Long-term statistical reports & charts
│   │   │   ├── CameraSettings.jsx  # Resolution, threshold & stream configuration
│   │   │   ├── DashboardOverview.jsx # Executive overview & quick activity log
│   │   │   ├── InspectionHistory.jsx # Paginated audit log & modal viewer
│   │   │   ├── LiveInspection.jsx  # Side-by-side live video & annotated capture
│   │   │   └── SystemStatus.jsx    # Health metrics, CPU/memory, retention stats
│   │   ├── services/
│   │   │   └── api.js              # Fetch client & WebSocket subscription manager
│   │   ├── App.jsx                 # Master application controller & state
│   │   ├── main.jsx                # React root mount with ErrorBoundary
│   │   └── index.css               # Tailwind directives & theme custom properties
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/
│   └── inspectai.db                # SQLite audit database
├── models/
│   ├── best.pt                     # PyTorch model checkpoint
│   ├── inspectai_yolo11n.onnx      # Exported ONNX model
│   └── results.csv                 # 100-epoch training metrics
├── storage/
│   ├── captures/                   # Raw captured frames (100-second buffer)
│   └── annotated/                  # Annotated defect frames (100-second buffer)
├── test_images/
│   ├── clean_steel.jpg             # Defect-free surface test strip
│   └── defect_steel.jpg            # Flawed surface test strip
├── run.sh                          # Linux / macOS automated runner
├── run.bat                         # Windows CMD launcher
└── README.md                       # Comprehensive documentation
```

---

## Quick Start Guide

### 1. Automated Launcher (Recommended)

Run the included startup script. It checks your virtual environment, builds the React frontend if needed, ensures all directories exist, and starts the server on port `8000`:

```bash
cd /home/devfardeen/Desktop/DeepLearning
./run.sh
```

Open your browser at **`http://localhost:8000`**.

---

### 2. Manual Step-by-Step (Single Port 8000)

1. **Activate Virtual Environment:**
   ```bash
   cd /home/devfardeen/Desktop/DeepLearning
   source venv/bin/activate
   ```

2. **Install Backend Dependencies (if first run):**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Launch Server:**
   ```bash
   export PYTHONPATH="/home/devfardeen/Desktop/DeepLearning"
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

---

### 3. Development Mode (Hot-Reloading)

For frontend developers making live UI changes:

- **Terminal 1 — Backend (FastAPI with Auto-Reload):**
  ```bash
  cd /home/devfardeen/Desktop/DeepLearning
  source venv/bin/activate
  export PYTHONPATH="/home/devfardeen/Desktop/DeepLearning"
  python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
  ```

- **Terminal 2 — Frontend (Vite Dev Server):**
  ```bash
  cd /home/devfardeen/Desktop/DeepLearning/frontend
  npm run dev
  ```

Open **`http://localhost:5173`** (Vite proxies all `/api` and `/ws` calls directly to port `8000`).

---

## Dual-Tiered Storage & Retention Architecture

```
Capture Frame (1080p / 480p)
           │
           ├───► Written to SQLite Database (Permanent)
           │     • Full inspection metadata
           │     • Precision bounding boxes [x1, y1, x2, y2]
           │     • Defect classification & confidence scores
           │     • Latency & hardware telemetry
           │
           └───► Written to Local Filesystem (Rolling Buffer)
                 • storage/captures/capture_*.jpg
                 • storage/annotated/annotated_*.jpg
                           │
                           ▼ (After 100 Seconds)
                 Cleanup Service unlinks files to preserve disk space.
                 Database flags record as "IMAGE_EXPIRED".
```

---

## REST API & WebSocket Reference

### Core Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | System health check (database status, uptime, model loaded) |
| `GET` | `/api/model/status` | Model architecture, execution provider, and class taxonomy |
| `GET` | `/api/camera/status` | Live camera stream state, active FPS, and resolution |
| `GET` | `/api/camera/devices` | Lists local V4L2 video devices available on the host |
| `POST`| `/api/camera/connect` | Connects to a video stream (`{"url": "0"}` or IP stream) |
| `POST`| `/api/camera/disconnect`| Disconnects current camera and frees device hardware |
| `GET` | `/api/camera/stream` | Continuous MJPEG multipart stream for live viewing |
| `POST`| `/api/inspection/start` | Starts the 1-second automated capture and inference loop |
| `POST`| `/api/inspection/stop` | Stops the automated capture loop |
| `GET` | `/api/inspection/status`| Telemetry: total captured, processed, skipped, last latency |
| `POST`| `/api/inspection/test-single` | On-demand test of current frame or built-in test strip |
| `POST`| `/api/inspection/upload` | Multipart file upload for instant single-image inspection |
| `GET` | `/api/inspections` | Paginated inspection audit history with search and status filters |
| `GET` | `/api/inspections/{id}`| Retrieves single inspection record with full detection boxes |
| `GET` | `/api/analytics/summary`| Total count, pass rate, fail rate, average latency |
| `GET` | `/api/analytics/defects`| Defect class occurrence breakdown for charts |

### WebSocket Event Stream (`/ws`)

Clients receive live JSON messages:
- `INIT_STATE`: Emitted upon connection with immediate camera, inspection, and model status.
- `NEW_INSPECTION`: Emitted every second with inspection decision, defect count, and image filename.
- `STATISTICS_UPDATE`: Emitted periodically with updated pass/fail rates.
- `CAMERA_STATUS`: Emitted whenever camera connects, disconnects, or drops frames.

---

## Verification & Diagnostic Suite

You can verify the backend services from the command line:

```bash
# 1. Verify YOLO11n ONNX Inference
PYTHONPATH=. python -c "
import cv2
from backend.services.inference_service import inference_service
img = cv2.imread('test_images/defect_steel.jpg')
status, dets, _, latency = inference_service.predict(img)
print(f'Decision: {status} | Found: {len(dets)} defect(s) | Latency: {latency:.1f}ms')
"

# 2. Verify Database Connection & Retention Daemon
PYTHONPATH=. python -c "
from backend.database import db
from backend.services.cleanup_service import cleanup_service
print('Summary:', db.get_analytics_summary())
pruned = cleanup_service.run_cleanup_cycle()
print(f'Pruned {pruned} expired image(s) from disk buffer.')
"

# 3. Test Camera Device Prober
PYTHONPATH=. python -c "
from backend.services.camera_service import camera_service
success, msg = camera_service.test_connection('0')
print('Camera Test (Index 0):', success, msg)
"
```

---

## Team & Version Control

- **Lead Developer & Contributor:** [devops-fardeen](https://github.com/devops-fardeen)
- **Primary Team Repository:** [Mohammad-Altamash-zia/DeepLearningProject](https://github.com/Mohammad-Altamash-zia/DeepLearningProject)
- **Personal Fork:** [devops-fardeen/DeepLearningProject](https://github.com/devops-fardeen/DeepLearningProject)

Both repositories are kept in synchronized parity across the `main` branch.
