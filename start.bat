@echo off
echo Starting Push Performance Insights Engine...
echo.

echo Starting Flask Backend...
cd backend
start "Flask Backend" cmd /k "python app.py"
cd ..

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul