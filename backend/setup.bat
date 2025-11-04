@echo off
echo ========================================
echo Mehryaan Backend Setup
echo ========================================
echo.

echo Installing dependencies...
npm install

echo.
echo Checking if .env file exists...
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo ✓ .env file created. Please update it with your MongoDB URI and JWT_SECRET
) else (
    echo ✓ .env file already exists
)

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env file with your MongoDB connection string
echo 2. Run: npm run dev
echo 3. In another terminal, seed the database: node scripts/seedDatabase.js
echo.
pause