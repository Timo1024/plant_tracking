# 🚀 Plant Tracker - Setup Guide

This guide will help you get the Plant Tracker application up and running on your machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (includes Docker and Docker Compose)
  - Windows/Mac: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Linux: Install Docker and Docker Compose separately

- **Git** (to clone the repository)

## 🎯 Quick Start (Recommended)

### Windows (PowerShell)

```powershell
# Run the setup script
.\setup.ps1
```

### Mac/Linux (Bash)

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The setup script provides an interactive menu with options to:
1. Start the application
2. Stop the application
3. Seed database with sample data
4. View logs
5. Clean up

## 🔧 Manual Setup

If you prefer to run commands manually:

### 1. Build and Start

```bash
docker compose up --build -d
```

This command will:
- Build the frontend, backend, and database containers
- Start all services in detached mode
- Create the necessary networks and volumes

### 2. Verify Services

Check if all services are running:

```bash
docker compose ps
```

You should see three services:
- `plant_tracking-frontend-1` (running on port 3000)
- `plant_tracking-backend-1` (running on port 5000)
- `plant_tracking-db-1` (running on port 3306)

### 3. Access the Application

Once all services are running:

- **Frontend (Web UI)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

### 4. Seed Sample Data (Optional but Recommended)

To populate the database with sample plants, pots, and soils:

```bash
docker compose exec backend python seed.py
```

This creates:
- 4 soil mixes (Aroid Mix, Succulent Mix, etc.)
- 5 pots with QR codes
- 5 sample plants (Monstera, Snake Plant, etc.)
- Historical pot assignments

## 🎨 Using the Application

### Adding Your First Plant

1. Click **"Add Plant"** in the navigation
2. Fill in the botanical information:
   - Common name (e.g., "My Monstera")
   - Family, Genus, Species
   - Size (seedling, small, medium, large, giant)
3. Add optional notes
4. Click **"Add Plant"**

### Creating a Pot with QR Code

1. Click **"Add Pot"** in the navigation
2. Enter:
   - Room/Location (e.g., "Living Room")
   - Pot Size (e.g., "15 cm" or "2L")
3. A unique QR code will be automatically generated
4. You can print this QR code and attach it to the physical pot

### Moving a Plant to a New Pot

1. Click **"Move Plant"** in the navigation
2. Select the plant to move
3. Choose the destination pot
4. Select a soil mix
5. Set the start date
6. The system automatically:
   - Closes the previous pot assignment
   - Creates a new history entry
   - Updates the plant's current location

### Managing Soil Mixes

1. Click **"Soils"** in the navigation
2. Click **"+ Add Soil Mix"**
3. Enter:
   - Mix name (e.g., "Aroid Mix")
   - Composition (e.g., "40% bark, 30% perlite, 30% peat")
4. Reuse soil mixes when repotting plants

### Scanning QR Codes

1. Use your phone's camera or QR scanner app
2. Scan the QR code on a pot
3. Your browser opens to: `http://localhost:3000/pot/{QR_CODE_ID}`
4. View:
   - Current plant in the pot
   - Soil mix used
   - Pot location and size

## 🛑 Stopping the Application

```bash
docker compose down
```

This stops all services but preserves your data.

## 🗑️ Complete Cleanup

⚠️ **Warning**: This removes ALL data!

```bash
docker compose down -v
```

This command:
- Stops all services
- Removes containers
- Deletes volumes (including database data)

## 📊 Viewing Logs

### All services:
```bash
docker compose logs -f
```

### Specific service:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Press `Ctrl+C` to exit logs.

## 🔍 Troubleshooting

### Port Already in Use

If you see errors like "port 3000 is already allocated":

1. Stop the service using that port
2. Or change the port in `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "3001:80"  # Changed from 3000 to 3001
```

### Database Connection Issues

If the backend can't connect to the database:

1. Check if all services are running:
   ```bash
   docker compose ps
   ```

2. Restart the backend:
   ```bash
   docker compose restart backend
   ```

3. Check database logs:
   ```bash
   docker compose logs db
   ```

### Frontend Shows Connection Error

1. Verify backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check backend logs for errors:
   ```bash
   docker compose logs backend
   ```

### QR Codes Not Generating

1. Check if the qrcodes directory exists:
   ```bash
   ls backend/static/qrcodes/
   ```

2. Verify backend has write permissions

3. Check backend logs when creating a pot

## 🔄 Rebuilding After Code Changes

If you make changes to the code:

### Frontend changes:
```bash
docker compose up --build frontend
```

### Backend changes:
```bash
docker compose up --build backend
```

### All services:
```bash
docker compose up --build
```

## 💻 Development Mode

For local development without Docker:

### Backend:
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=mysql+pymysql://tracker:trackerpass@localhost:3306/planttracker
python app.py
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

Note: You'll still need MySQL running (via Docker or locally).

## 📱 Production Deployment

For production deployment:

1. Use environment variables for sensitive data
2. Change default passwords in `docker-compose.yml`
3. Set up HTTPS/SSL
4. Use a reverse proxy (nginx, Traefik)
5. Configure proper backup strategy for MySQL data
6. Update the QR code domain in pot creation

## 🆘 Getting Help

- Check the main README.md for API documentation
- Review Docker logs for error messages
- Open an issue on GitHub

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:5000/api/health
- [ ] Database is accessible (check with seed script)
- [ ] Can add a plant
- [ ] Can add a pot (with QR code generation)
- [ ] Can move a plant between pots
- [ ] Can view plant history
- [ ] QR code scanning works (test with phone)

---

**Happy Plant Tracking! 🌱**
