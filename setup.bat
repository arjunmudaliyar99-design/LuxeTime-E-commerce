@echo off
REM Quick Start Script for Windows
REM Virtual Watch Try-On MVP

echo.
echo ========================================
echo   LUXETIME - Virtual Watch Try-On Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.10+ first.
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo [OK] Python and Node.js found
echo.

REM Setup Backend
echo Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -q -r requirements.txt

echo [OK] Backend setup complete
echo.

REM Setup Frontend
echo Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

echo [OK] Frontend setup complete
echo.

REM Create .env files
cd ..\backend
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
)

cd ..\frontend
if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env
)

cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
