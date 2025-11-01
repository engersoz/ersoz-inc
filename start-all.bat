@echo off
echo ==========================================
echo    ERSOZ INC Platform - Starting...
echo ==========================================
echo.
echo Starting Backend Server...
start "ERSOZ Backend" cmd /k "cd /d C:\Users\enger\OneDrive\Documents\Projects\ersozinc\server && npm start"

timeout /t 5

echo Starting Frontend Server...
start "ERSOZ Frontend" cmd /k "cd /d C:\Users\enger\OneDrive\Documents\Projects\ersozinc\client && npm run dev"

echo.
echo ==========================================
echo    ✅ Both servers are starting!
echo ==========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Login credentials:
echo Email: admin@ersozinc.com
echo Password: Admin@123456
echo.
echo Press any key to exit this window (servers will keep running)
pause
