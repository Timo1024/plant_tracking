#!/bin/bash
# Restore script for Plant Tracker

set -e

BACKUP_DIR="/mnt/pool/backups/plant_tracker"
APP_DIR="/mnt/pool/plant_tracker"

echo "🌱 Plant Tracker Restore"
echo "========================"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "📋 Available database backups:"
ls -lh $BACKUP_DIR/db_*.sql.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}'

echo ""
read -p "Enter the backup file name (e.g., db_20250105_120000.sql.gz): " DB_BACKUP

if [ ! -f "$BACKUP_DIR/$DB_BACKUP" ]; then
    echo "❌ Backup file not found: $BACKUP_DIR/$DB_BACKUP"
    exit 1
fi

# Extract date from filename
BACKUP_DATE=$(echo $DB_BACKUP | grep -oP '\d{8}_\d{6}')

# Check for corresponding QR codes backup
QRCODE_BACKUP="qrcodes_${BACKUP_DATE}.tar.gz"
if [ ! -f "$BACKUP_DIR/$QRCODE_BACKUP" ]; then
    echo "⚠️  Warning: QR codes backup not found: $QRCODE_BACKUP"
    read -p "Continue without restoring QR codes? (yes/no): " continue
    if [ "$continue" != "yes" ]; then
        exit 0
    fi
    RESTORE_QRCODES=false
else
    RESTORE_QRCODES=true
fi

echo ""
echo "⚠️  WARNING: This will replace all current data!"
read -p "Are you sure you want to restore? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 0
fi

# Load environment variables
if [ -f "$APP_DIR/.env" ]; then
    set -a
    source "$APP_DIR/.env"
    set +a
else
    echo "❌ .env file not found at $APP_DIR/.env"
    exit 1
fi

# Stop containers
echo ""
echo "🛑 Stopping containers..."
cd $APP_DIR
docker compose down

# Start only database
echo "🚀 Starting database..."
docker compose up -d db

echo "⏳ Waiting for database to be ready..."
sleep 10

# Restore database
echo "💾 Restoring database..."
gunzip -c $BACKUP_DIR/$DB_BACKUP | docker compose exec -T db mysql -u tracker -p${DB_PASSWORD} planttracker

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully"
else
    echo "❌ Database restore failed!"
    exit 1
fi

# Restore QR codes
if [ "$RESTORE_QRCODES" = true ]; then
    echo "💾 Restoring QR codes..."
    docker run --rm \
        -v plant_tracking_qrcodes:/data \
        -v $BACKUP_DIR:/backup \
        alpine sh -c "rm -rf /data/* && tar xzf /backup/$QRCODE_BACKUP -C /data"
    
    if [ $? -eq 0 ]; then
        echo "✅ QR codes restored successfully"
    else
        echo "❌ QR codes restore failed!"
        exit 1
    fi
fi

# Start all containers
echo "🚀 Starting all containers..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "✅ Restore completed successfully!"
echo ""
echo "🌐 Application should be available at:"
echo "   http://$(hostname -I | awk '{print $1}'):3000"
