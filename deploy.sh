#!/bin/bash
# Plant Tracker - TrueNAS Scale Deployment Script

set -e

echo "🌱 Plant Tracker - TrueNAS Scale Deployment"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo or login as root)"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "TrueNAS Scale should have Docker pre-installed."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and update the following:"
        echo "   - DB_ROOT_PASSWORD"
        echo "   - DB_PASSWORD"
        echo "   - APP_DOMAIN"
        echo ""
        read -p "Press Enter after editing .env file..."
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Load environment variables
set -a
source .env
set +a

echo "🔧 Configuration loaded"
echo "   Database: planttracker"
echo "   Domain: ${APP_DOMAIN:-http://localhost:3000}"
echo ""

# Ask for confirmation
echo "📋 Deployment Options:"
echo "1. Fresh installation (clean start)"
echo "2. Update existing installation (preserve data)"
echo "3. Stop application"
echo "4. View logs"
echo "5. Backup database"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting fresh installation..."
        echo "⚠️  This will remove all existing data!"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" != "yes" ]; then
            echo "❌ Cancelled"
            exit 0
        fi
        
        echo "🗑️  Removing old containers and volumes..."
        docker compose down -v 2>/dev/null || true
        
        echo "🏗️  Building containers..."
        docker compose up -d --build
        
        echo "⏳ Waiting for services to start..."
        sleep 15
        
        echo "🌱 Seeding database with sample data..."
        docker compose exec -T backend python seed.py || echo "⚠️  Seeding skipped (already has data)"
        
        echo ""
        echo "✅ Fresh installation complete!"
        ;;
        
    2)
        echo ""
        echo "🔄 Updating existing installation..."
        
        echo "🛑 Stopping containers..."
        docker compose down
        
        echo "🏗️  Rebuilding containers..."
        docker compose up -d --build
        
        echo "⏳ Waiting for services to start..."
        sleep 10
        
        echo ""
        echo "✅ Update complete!"
        ;;
        
    3)
        echo ""
        echo "🛑 Stopping application..."
        docker compose down
        echo "✅ Application stopped"
        exit 0
        ;;
        
    4)
        echo ""
        echo "📊 Viewing logs (Ctrl+C to exit)..."
        docker compose logs -f
        exit 0
        ;;
        
    5)
        echo ""
        BACKUP_DIR="./backups"
        mkdir -p $BACKUP_DIR
        DATE=$(date +%Y%m%d_%H%M%S)
        
        echo "💾 Creating backup..."
        docker compose exec -T db mysqldump -u tracker -p${DB_PASSWORD} planttracker > $BACKUP_DIR/db_$DATE.sql
        
        echo "💾 Backing up QR codes..."
        docker run --rm \
            -v plant_tracking_qrcodes:/data \
            -v $(pwd)/$BACKUP_DIR:/backup \
            alpine tar czf /backup/qrcodes_$DATE.tar.gz -C /data .
        
        echo ""
        echo "✅ Backup created:"
        echo "   Database: $BACKUP_DIR/db_$DATE.sql"
        echo "   QR Codes: $BACKUP_DIR/qrcodes_$DATE.tar.gz"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Check if containers are running
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend API: http://$(hostname -I | awk '{print $1}'):5000/api/health"
echo ""
echo "📚 Useful Commands:"
echo "   View logs:       docker compose logs -f"
echo "   Restart:         docker compose restart"
echo "   Stop:            docker compose down"
echo "   Enter backend:   docker compose exec backend bash"
echo ""
echo "✨ Deployment complete!"
