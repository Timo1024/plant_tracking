# Plant Tracker Setup and Run Script

Write-Host "🌱 Plant Tracker Setup" -ForegroundColor Green
Write-Host "=====================`n" -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Host "✓ Docker is installed`n" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Ask user what to do
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Start the application (build and run)" -ForegroundColor White
Write-Host "2. Stop the application" -ForegroundColor White
Write-Host "3. Seed database with sample data" -ForegroundColor White
Write-Host "4. View logs" -ForegroundColor White
Write-Host "5. Clean up (remove containers and volumes)" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting Plant Tracker..." -ForegroundColor Yellow
        docker-compose up --build -d
        Write-Host "`n✓ Application started!" -ForegroundColor Green
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  Backend:  http://localhost:5000/api" -ForegroundColor Cyan
        Write-Host "`nTip: Run option 3 to seed the database with sample data" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "`nStopping Plant Tracker..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✓ Application stopped!" -ForegroundColor Green
    }
    "3" {
        Write-Host "`nSeeding database..." -ForegroundColor Yellow
        docker-compose exec backend python seed.py
        Write-Host "✓ Database seeded!" -ForegroundColor Green
    }
    "4" {
        Write-Host "`nShowing logs (Ctrl+C to exit)..." -ForegroundColor Yellow
        docker-compose logs -f
    }
    "5" {
        Write-Host "`nCleaning up..." -ForegroundColor Yellow
        $confirm = Read-Host "This will remove all containers, volumes, and data. Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            docker-compose down -v
            Write-Host "✓ Cleanup complete!" -ForegroundColor Green
        } else {
            Write-Host "Cleanup cancelled" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}
