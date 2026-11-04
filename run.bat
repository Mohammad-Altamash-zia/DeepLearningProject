@echo off
REM InspectAI - Windows Launcher
title InspectAI Quality Inspection System

cd /d "%~dp0"

echo ==========================================================
echo       INSPECTAI -- Industrial Quality Inspection System     
echo ==========================================================

REM Check for virtual environment
if exist "venv\Scripts\python.exe" (
    set "PYTHON_EXE=venv\Scripts\python.exe"
) else (
    echo [!] Creating virtual environment...
    python -m venv venv
    set "PYTHON_EXE=venv\Scripts\python.exe"
    echo [+] Installing dependencies...
    venv\Scripts\pip.exe install -r backend\requirements.txt
)

REM Build frontend if needed
if not exist "frontend\dist\index.html" (
    echo [*] Building React frontend distribution...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo ----------------------------------------------------------
echo  Starting InspectAI Server on http://localhost:8000
echo ----------------------------------------------------------

set PYTHONPATH=%cd%
"%PYTHON_EXE%" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
pause

