#!/bin/bash

# Plant Tracker Setup and Run Script

echo "🌱 Plant Tracker Setup"
echo "====================="
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed!"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "✗ Docker Compose is not installed!"
    exit 1
fi

echo "✓ Docker is installed"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1. Start the application (build and run)"
echo "2. Stop the application"
echo "3. Seed database with sample data"
echo "4. View logs"
echo "5. Clean up (remove containers and volumes)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Starting Plant Tracker..."
        docker compose up --build -d
        echo ""
        echo "✓ Application started!"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:5000/api"
        echo ""
        echo "Tip: Run option 3 to seed the database with sample data"
        ;;
    2)
        echo ""
        echo "Stopping Plant Tracker..."
        docker compose down
        echo "✓ Application stopped!"
        ;;
    3)
        echo ""
        echo "Seeding database..."
        docker compose exec backend python seed.py
        echo "✓ Database seeded!"
        ;;
    4)
        echo ""
        echo "Showing logs (Ctrl+C to exit)..."
        docker compose logs -f
        ;;
    5)
        echo ""
        read -p "This will remove all containers, volumes, and data. Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker compose down -v
            echo "✓ Cleanup complete!"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac
