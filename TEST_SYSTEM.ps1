# Complete System Test Script
# Run this to verify all components are working

Write-Host "🧪 Virtual Watch Try-On - System Test" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$passedTests = 0
$failedTests = 0

function Test-Component {
    param($name, $test)
    Write-Host "Testing: $name..." -NoNewline
    $result = & $test
    if ($result) {
        Write-Host " ✅ PASS" -ForegroundColor Green
        $script:passedTests++
        return $true
    } else {
        Write-Host " ❌ FAIL" -ForegroundColor Red
        $script:failedTests++
        return $false
    }
}

Write-Host "📦 Checking Prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Test Python
Test-Component "Python 3.10+" {
    try {
        $version = python --version 2>&1
        $version -match "Python 3\.(1[0-9]|[2-9][0-9])"
    } catch { $false }
}

# Test Node.js
Test-Component "Node.js 18+" {
    try {
        $version = node --version 2>&1
        $version -match "v(1[8-9]|[2-9][0-9])"
    } catch { $false }
}

# Test pip
Test-Component "pip" {
    try {
        pip --version 2>&1 | Out-Null
        $LASTEXITCODE -eq 0
    } catch { $false }
}

# Test npm
Test-Component "npm" {
    try {
        npm --version 2>&1 | Out-Null
        $LASTEXITCODE -eq 0
    } catch { $false }
}

Write-Host ""
Write-Host "📁 Checking Project Structure..." -ForegroundColor Yellow
Write-Host ""

# Test backend directory
Test-Component "Backend directory" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend"
}

# Test frontend directory
Test-Component "Frontend directory" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend"
}

# Test watch images
Test-Component "Watch images folder" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend\public\watch images"
}

# Count watch images
$watchCount = (Get-ChildItem "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend\public\watch images" -Filter *.png).Count
Test-Component "Watch images (8 required)" {
    $watchCount -ge 8
}

Write-Host ""
Write-Host "🔧 Checking Dependencies..." -ForegroundColor Yellow
Write-Host ""

# Test backend requirements
Test-Component "Backend requirements.txt" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend\requirements.txt"
}

# Test frontend package.json
Test-Component "Frontend package.json" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend\package.json"
}

# Test if FastAPI is installed
Test-Component "FastAPI installed" {
    try {
        python -c "import fastapi" 2>&1 | Out-Null
        $LASTEXITCODE -eq 0
    } catch { $false }
}

# Test if MediaPipe is installed
Test-Component "MediaPipe installed" {
    try {
        python -c "import mediapipe" 2>&1 | Out-Null
        $LASTEXITCODE -eq 0
    } catch { $false }
}

# Test if OpenCV is installed
Test-Component "OpenCV installed" {
    try {
        python -c "import cv2" 2>&1 | Out-Null
        $LASTEXITCODE -eq 0
    } catch { $false }
}

Write-Host ""
Write-Host "📄 Checking Key Files..." -ForegroundColor Yellow
Write-Host ""

# Backend files
Test-Component "Backend main.py" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend\app\main.py"
}

Test-Component "Backend tryon.py" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend\app\api\tryon.py"
}

Test-Component "Backend watch_tryon.py" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend\app\cv\watch_tryon.py"
}

# Frontend files
Test-Component "Frontend TryOn.jsx" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend\src\pages\TryOn.jsx"
}

Test-Component "Frontend TryOn.css" {
    Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\frontend\src\pages\TryOn.css"
}

Write-Host ""
Write-Host "🌐 Checking Ports..." -ForegroundColor Yellow
Write-Host ""

# Check if port 8000 is available
Test-Component "Port 8000 available" {
    $port8000 = netstat -ano | Select-String ":8000"
    $null -eq $port8000
}

# Check if port 5173 is available
Test-Component "Port 5173 available" {
    $port5173 = netstat -ano | Select-String ":5173"
    $null -eq $port5173
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "📊 Test Results:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($passedTests + $failedTests)" -ForegroundColor White
Write-Host "Passed:      $passedTests" -ForegroundColor Green
Write-Host "Failed:      $failedTests" -ForegroundColor Red
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "🎉 All tests passed! System is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run .\START_BACKEND.ps1 in Terminal 1" -ForegroundColor Yellow
    Write-Host "2. Run .\START_FRONTEND.ps1 in Terminal 2" -ForegroundColor Yellow
    Write-Host "3. Open http://localhost:5173 in Chrome/Firefox" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "⚠️  Some tests failed. Please fix issues above." -ForegroundColor Red
    Write-Host ""
    
    if (-not (Test-Path "c:\Users\HP\Desktop\virtual watch\virtual-watch-mvp\backend\requirements.txt")) {
        Write-Host "Missing backend requirements. Install Python dependencies:" -ForegroundColor Yellow
        Write-Host "cd backend; pip install fastapi uvicorn opencv-python mediapipe numpy python-multipart" -ForegroundColor Cyan
    }
    
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
