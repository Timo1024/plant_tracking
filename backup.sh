#!/bin/bash
# Backup script for Plant Tracker

set -e

# Configuration
BACKUP_DIR="/mnt/pool/backups/plant_tracker"
APP_DIR="/mnt/pool/plant_tracker"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# Load environment variables
if [ -f "$APP_DIR/.env" ]; then
    set -a
    source "$APP_DIR/.env"
    set +a
else
    echo "❌ .env file not found at $APP_DIR/.env"
    exit 1
fi

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🌱 Plant Tracker Backup - $DATE"
echo "================================"

# Backup database
echo "💾 Backing up database..."
docker compose -f $APP_DIR/docker-compose.yml exec -T db \
    mysqldump -u tracker -p${DB_PASSWORD} planttracker > $BACKUP_DIR/db_$DATE.sql

if [ $? -eq 0 ]; then
    echo "✅ Database backup created: db_$DATE.sql"
    
    # Compress database backup
    gzip $BACKUP_DIR/db_$DATE.sql
    echo "✅ Database backup compressed: db_$DATE.sql.gz"
else
    echo "❌ Database backup failed!"
    exit 1
fi

# Backup QR codes
echo "💾 Backing up QR codes..."
docker run --rm \
    -v plant_tracking_qrcodes:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/qrcodes_$DATE.tar.gz -C /data .

if [ $? -eq 0 ]; then
    echo "✅ QR codes backup created: qrcodes_$DATE.tar.gz"
else
    echo "❌ QR codes backup failed!"
    exit 1
fi

# Backup environment file
echo "💾 Backing up configuration..."
cp $APP_DIR/.env $BACKUP_DIR/env_$DATE.backup
echo "✅ Configuration backup created: env_$DATE.backup"

# Clean up old backups
echo "🧹 Cleaning up backups older than $KEEP_DAYS days..."
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$KEEP_DAYS -delete
find $BACKUP_DIR -name "qrcodes_*.tar.gz" -mtime +$KEEP_DAYS -delete
find $BACKUP_DIR -name "env_*.backup" -mtime +$KEEP_DAYS -delete

# Show backup summary
echo ""
echo "📊 Backup Summary:"
echo "   Location: $BACKUP_DIR"
echo "   Database: db_$DATE.sql.gz ($(du -h $BACKUP_DIR/db_$DATE.sql.gz | cut -f1))"
echo "   QR Codes: qrcodes_$DATE.tar.gz ($(du -h $BACKUP_DIR/qrcodes_$DATE.tar.gz | cut -f1))"
echo "   Config:   env_$DATE.backup"
echo ""
echo "   Total backups: $(ls -1 $BACKUP_DIR/db_*.sql.gz 2>/dev/null | wc -l) database, $(ls -1 $BACKUP_DIR/qrcodes_*.tar.gz 2>/dev/null | wc -l) QR codes"
echo ""
echo "✅ Backup completed successfully!"
