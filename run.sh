#!/usr/bin/env bash
# InspectAI - Autonomous Industrial Defect Detection System Launcher

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "      INSPECTAI — Industrial Quality Inspection System     "
echo "=========================================================="
echo "Project Root: $PROJECT_ROOT"

# Check Python environment
if [ -d "$PROJECT_ROOT/venv" ]; then
    PYTHON_BIN="$PROJECT_ROOT/venv/bin/python"
    PIP_BIN="$PROJECT_ROOT/venv/bin/pip"
elif [ -d "$PROJECT_ROOT/.venv" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python"
    PIP_BIN="$PROJECT_ROOT/.venv/bin/pip"
else
    echo "[!] Virtual environment not detected. Creating venv..."
    python3 -m venv "$PROJECT_ROOT/venv"
    PYTHON_BIN="$PROJECT_ROOT/venv/bin/python"
    PIP_BIN="$PROJECT_ROOT/venv/bin/pip"
    echo "[+] Installing backend dependencies..."
    "$PIP_BIN" install -r "$PROJECT_ROOT/backend/requirements.txt"
fi

# Ensure directories exist
mkdir -p "$PROJECT_ROOT/storage/captures" "$PROJECT_ROOT/storage/annotated" "$PROJECT_ROOT/database" "$PROJECT_ROOT/results"

# Check if frontend needs to be built
if [ ! -f "$PROJECT_ROOT/frontend/dist/index.html" ]; then
    echo "[*] Building React frontend distribution..."
    if command -v npm &> /dev/null; then
        cd "$PROJECT_ROOT/frontend"
        npm install
        npm run build
        cd "$PROJECT_ROOT"
    else
        echo "[!] Warning: npm not found. Frontend dist not built."
    fi
fi

echo "----------------------------------------------------------"
echo " Starting InspectAI FastAPI Server on http://0.0.0.0:8000"
echo " Dashboard UI will be accessible at http://localhost:8000"
echo "----------------------------------------------------------"

export PYTHONPATH="$PROJECT_ROOT"
exec "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

