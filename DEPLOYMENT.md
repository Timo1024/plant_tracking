# 🚀 TrueNAS Scale Deployment Guide

This guide will help you deploy the Plant Tracker application on TrueNAS Scale.

## 📋 Prerequisites

- TrueNAS Scale installed and running
- SSH access enabled on TrueNAS
- Basic knowledge of Linux commands

## 🎯 Quick Deployment

### Step 1: Prepare TrueNAS

1. **Enable SSH** (if not already enabled):
   - Go to **System Settings** → **Services**
   - Find **SSH** and click the toggle to enable it
   - Click the pencil icon to configure (ensure "Allow Password Authentication" is enabled)

2. **Create a dataset** (recommended but optional):
   ```bash
   # SSH into your TrueNAS
   ssh root@YOUR_TRUENAS_IP
   
   # Create dataset for the app
   zfs create pool/plant_tracker
   ```

### Step 2: Transfer Files to TrueNAS

**Option A: Using SCP from Windows**

```powershell
# Navigate to your project directory
cd C:\Users\Robin\OneDrive\Dokumente\programming\plant_tracking

# Transfer files to TrueNAS
scp -r * root@YOUR_TRUENAS_IP:/mnt/pool/plant_tracker/
```

**Option B: Using WinSCP or FileZilla**

1. Download and install [WinSCP](https://winscp.net/) or [FileZilla](https://filezilla-project.org/)
2. Connect to your TrueNAS IP using SFTP
3. Upload the entire `plant_tracking` folder to `/mnt/pool/plant_tracker/`

### Step 3: Configure Environment Variables

1. SSH into TrueNAS:
   ```bash
   ssh root@YOUR_TRUENAS_IP
   ```

2. Navigate to the app directory:
   ```bash
   cd /mnt/pool/plant_tracker
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **IMPORTANT**: Update the following values in `.env`:
   ```bash
   DB_ROOT_PASSWORD=your_secure_root_password_here
   DB_PASSWORD=your_secure_tracker_password_here
   FLASK_ENV=production
   APP_DOMAIN=http://YOUR_TRUENAS_IP:3000
   ```
   
   Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Step 4: Deploy the Application

1. Make sure you're in the app directory:
   ```bash
   cd /mnt/pool/plant_tracker
   ```

2. Start the application:
   ```bash
   docker compose up -d --build
   ```

3. Wait for containers to start (about 1-2 minutes):
   ```bash
   docker compose ps
   ```

4. (Optional) Seed with sample data:
   ```bash
   docker compose exec backend python seed.py
   ```

### Step 5: Access Your Application

Open your web browser and navigate to:
- **Frontend**: `http://YOUR_TRUENAS_IP:3000`
- **Backend API**: `http://YOUR_TRUENAS_IP:5000/api/health`

## 🔧 Configuration

### Port Configuration

By default, the application uses:
- Port **3000** for the frontend
- Port **5000** for the backend API

To change ports, edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change 8080 to your preferred port

backend:
  ports:
    - "8000:5000"  # Change 8000 to your preferred port
```

### Data Persistence

All data is stored in Docker volumes:
- `mysql_data` - Database files
- `qrcodes` - QR code images

To backup these volumes:
```bash
# Backup database
docker compose exec db mysqldump -u tracker -p planttracker > backup_$(date +%Y%m%d).sql

# Backup QR codes
docker run --rm -v plant_tracking_qrcodes:/data -v $(pwd):/backup alpine tar czf /backup/qrcodes_backup_$(date +%Y%m%d).tar.gz -C /data .
```

## 🌐 Network Access

### Local Network Access

The application will be accessible from any device on your local network using `http://YOUR_TRUENAS_IP:3000`

### Internet Access (Optional)

For access from outside your network, you have several options:

#### Option 1: Port Forwarding (Basic)

1. Configure your router to forward ports 3000 and 5000 to your TrueNAS IP
2. Access via `http://YOUR_PUBLIC_IP:3000`
3. ⚠️ **Warning**: QR scanner requires HTTPS for camera access on mobile devices

#### Option 2: Reverse Proxy with SSL (Recommended)

Install **Nginx Proxy Manager** on TrueNAS:

1. Go to **Apps** → **Discover Apps**
2. Search for "Nginx Proxy Manager"
3. Install and configure
4. Add a proxy host:
   - Domain: `plants.yourdomain.com`
   - Forward to: `http://YOUR_TRUENAS_IP:3000`
   - Enable SSL with Let's Encrypt

#### Option 3: Cloudflare Tunnel (Free & Easy)

1. Install Cloudflare Tunnel on TrueNAS
2. Configure tunnel to point to `http://localhost:3000`
3. Access via `https://plants.yourdomain.com`
4. ✅ Free SSL/HTTPS included

#### Option 4: Tailscale (Private Network)

1. Install Tailscale on TrueNAS
2. Install Tailscale on your devices
3. Access via Tailscale IP: `http://100.x.x.x:3000`
4. Works from anywhere without exposing to internet

## 📱 Mobile Access & HTTPS

**Important**: The QR code scanner requires HTTPS when accessed from mobile devices over the network.

For local testing with HTTPS:
1. Use ngrok: `ngrok http YOUR_TRUENAS_IP:3000`
2. Use one of the internet access options above (Option 2, 3, or 4)

## 🔄 Updating the Application

To update the application after making changes:

```bash
# SSH into TrueNAS
cd /mnt/pool/plant_tracker

# Pull latest changes (if using git)
git pull

# Rebuild and restart containers
docker compose down
docker compose up -d --build

# Check status
docker compose ps
```

## 📊 Monitoring & Logs

### View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Check container status:
```bash
docker compose ps
```

### Restart services:
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

## 🛡️ Security Best Practices

- [ ] Change default passwords in `.env` file
- [ ] Use strong passwords for database
- [ ] Set up SSL/HTTPS for production use
- [ ] Configure firewall rules
- [ ] Regular backups of database and QR codes
- [ ] Keep Docker images updated
- [ ] Restrict SSH access to specific IPs (optional)

## 🔐 Backup Strategy

Create a backup script at `/mnt/pool/scripts/backup_plant_tracker.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/mnt/pool/backups/plant_tracker"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose -f /mnt/pool/plant_tracker/docker-compose.yml exec -T db \
  mysqldump -u tracker -p$DB_PASSWORD planttracker > $BACKUP_DIR/db_$DATE.sql

# Backup QR codes
docker run --rm \
  -v plant_tracking_qrcodes:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/qrcodes_$DATE.tar.gz -C /data .

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make it executable and create a cron job:
```bash
chmod +x /mnt/pool/scripts/backup_plant_tracker.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /mnt/pool/scripts/backup_plant_tracker.sh
```

## 🆘 Troubleshooting

### Containers won't start:
```bash
# Check logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### Can't access the application:
```bash
# Check if containers are running
docker compose ps

# Check TrueNAS firewall
# Ensure ports 3000 and 5000 are open

# Test from TrueNAS
curl http://localhost:3000
curl http://localhost:5000/api/health
```

### Database connection errors:
```bash
# Check database is healthy
docker compose exec db mysqladmin -u tracker -p ping

# Restart database
docker compose restart db
```

### QR codes not generating:
```bash
# Check QR codes volume
docker volume inspect plant_tracking_qrcodes

# Check permissions
docker compose exec backend ls -la /app/static/qrcodes

# Generate missing QR codes
docker compose exec backend python generate_missing_qr.py
```

## 📚 Useful Commands

```bash
# Stop application
docker compose down

# Stop and remove all data (CAUTION!)
docker compose down -v

# View resource usage
docker stats

# Access backend shell
docker compose exec backend bash

# Access MySQL shell
docker compose exec db mysql -u tracker -p planttracker

# Export database
docker compose exec db mysqldump -u tracker -p planttracker > backup.sql

# Import database
docker compose exec -T db mysql -u tracker -p planttracker < backup.sql
```

## 🎉 Success!

Your Plant Tracker is now running on TrueNAS Scale! 

- Access it at: `http://YOUR_TRUENAS_IP:3000`
- Scan QR codes from your mobile device
- Manage your plant collection

---

**Need help?** Check the logs with `docker compose logs -f` or refer to the troubleshooting section above.
