# 🌱 Plant Tracker - TrueNAS Scale Quick Start

## 🚀 Quick Deployment Steps

### 1. Transfer Files to TrueNAS

**Windows (PowerShell):**
```powershell
scp -r C:\Users\Robin\OneDrive\Dokumente\programming\plant_tracking root@YOUR_TRUENAS_IP:/mnt/pool/
```

### 2. SSH into TrueNAS

```bash
ssh root@YOUR_TRUENAS_IP
```

### 3. Configure & Deploy

```bash
# Navigate to app directory
cd /mnt/pool/plant_tracking

# Create environment file
cp .env.example .env
nano .env

# Update these values:
# - DB_ROOT_PASSWORD=your_secure_password
# - DB_PASSWORD=your_secure_password  
# - APP_DOMAIN=http://YOUR_TRUENAS_IP:3000

# Make scripts executable
chmod +x deploy.sh backup.sh restore.sh

# Run deployment
./deploy.sh
```

### 4. Access Your App

Open: `http://YOUR_TRUENAS_IP:3000`

## 📋 Common Commands

```bash
# View logs
docker compose logs -f

# Restart application
docker compose restart

# Stop application
docker compose down

# Backup
./backup.sh

# Restore
./restore.sh
```

## 🔐 Important Security Notes

1. **Change default passwords** in `.env`
2. Use **HTTPS** for mobile QR scanner (use Cloudflare Tunnel or Nginx Proxy Manager)
3. Enable **automatic backups** with cron

## 📚 Full Documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions and troubleshooting.

---

**Need help?** Check logs with `docker compose logs -f`
