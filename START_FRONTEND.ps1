# Virtual Watch Try-On Frontend Startup Script
# Run this AFTER starting the backend

Write-Host "🎨 Starting Virtual Watch Frontend..." -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend"

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Install from nodejs.org" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start Vite dev server
Write-Host ""
Write-Host "🎯 Starting Vite dev server on http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
