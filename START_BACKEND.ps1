# Virtual Watch Try-On Backend Startup Script
# Run this before starting the frontend

Write-Host "🚀 Starting Virtual Watch Backend..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend"

# Activate virtual environment
if (Test-Path "../.venv/Scripts/Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "../.venv/Scripts/Activate.ps1"
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} elseif (Test-Path "../venv/Scripts/Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "../venv/Scripts/Activate.ps1"
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
}

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found! Install Python 3.10+ from python.org" -ForegroundColor Red
    exit 1
}

# Check/Install dependencies
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow

if (Test-Path "requirements.txt") {
    Write-Host "Installing requirements..." -ForegroundColor Cyan
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ requirements.txt not found" -ForegroundColor Yellow
}

# Start uvicorn server
Write-Host ""
Write-Host "🎯 Starting FastAPI server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
