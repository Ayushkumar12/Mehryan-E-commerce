@echo off
echo ========================================
echo Mehryaan E-Commerce Platform Setup
echo ========================================
echo.

echo Installing frontend dependencies...
call npm install

echo.
echo ========================================
echo Frontend Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. cd backend
echo 2. Run: setup.bat (to setup backend)
echo 3. In separate terminals:
echo    - Terminal 1: cd backend && npm run dev
echo    - Terminal 2: npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause