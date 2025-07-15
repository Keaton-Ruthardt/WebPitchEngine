#!/bin/bash

echo "Starting Push Performance Insights Engine..."
echo

echo "Starting Flask Backend..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

echo
echo "Starting React Frontend..."
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait