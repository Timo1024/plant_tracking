# 🌱 Plant Tracker - Quick Reference

## 🚀 Start/Stop Commands

```bash
# Start application
docker compose up --build -d

# Stop application
docker compose down

# Stop and remove all data
docker compose down -v

# View logs
docker compose logs -f

# Seed sample data
docker compose exec backend python seed.py
```

## 🔗 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📋 API Quick Reference

### Plants
```bash
GET    /api/plants           # List all
GET    /api/plants/<id>      # Get one
POST   /api/plants           # Create
PUT    /api/plants/<id>      # Update
DELETE /api/plants/<id>      # Remove
```

### Pots
```bash
GET    /api/pots                  # List all
GET    /api/pots/<qr_code_id>    # Get by QR
POST   /api/pots                 # Create (generates QR)
PUT    /api/pots/<id>            # Update
```

### Soils
```bash
GET    /api/soils           # List all
POST   /api/soils           # Create
PUT    /api/soils/<id>      # Update
```

### Movement
```bash
GET    /api/history/<plant_id>   # Get history
POST   /api/move                 # Move plant
```

## 📱 Frontend Routes

```
/                    Dashboard
/plants/:id          Plant details
/pot/:qrCodeId       QR-scannable pot page
/add-plant           Add plant form
/add-pot             Add pot form
/move                Move/repot form
/soils               Soil mix manager
```

## 🗃️ Database Tables

```
plants            - Plant records
pots              - Pot records with QR codes
soils             - Soil mix definitions
plant_pot_history - Movement tracking
```

## 🛠️ Troubleshooting

**Port in use:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000   # Windows
lsof -i :3000                  # Mac/Linux
```

**Reset database:**
```bash
docker compose down -v
docker compose up -d
docker compose exec backend python seed.py
```

**Rebuild specific service:**
```bash
docker compose up --build backend
docker compose up --build frontend
```

**Enter container:**
```bash
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec db mysql -u tracker -p
```

## 📝 Sample API Calls

**Create Plant:**
```bash
curl -X POST http://localhost:5000/api/plants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Plant",
    "family": "Araceae",
    "genus": "Monstera",
    "species": "deliciosa",
    "size": "small"
  }'
```

**Create Pot:**
```bash
curl -X POST http://localhost:5000/api/pots \
  -H "Content-Type: application/json" \
  -d '{
    "room": "Living Room",
    "size": "15 cm"
  }'
```

**Move Plant:**
```bash
curl -X POST http://localhost:5000/api/move \
  -H "Content-Type: application/json" \
  -d '{
    "plant_id": 1,
    "pot_id": 2,
    "soil_id": 1,
    "start_date": "2025-11-02"
  }'
```

## 🔍 Useful SQL Queries

**Connect to MySQL:**
```bash
docker compose exec db mysql -u tracker -ptrackerpass planttracker
```

**Queries:**
```sql
-- View all plants with current pots
SELECT p.name, pot.room, pot.size
FROM plants p
LEFT JOIN plant_pot_history h ON p.id = h.plant_id AND h.end_date IS NULL
LEFT JOIN pots pot ON h.pot_id = pot.id;

-- View plant movement history
SELECT p.name, pot.room, h.start_date, h.end_date
FROM plant_pot_history h
JOIN plants p ON h.plant_id = p.id
JOIN pots pot ON h.pot_id = pot.id
ORDER BY h.start_date DESC;

-- Find empty pots
SELECT * FROM pots
WHERE id NOT IN (
  SELECT pot_id FROM plant_pot_history WHERE end_date IS NULL
);
```

## 📦 File Locations

```
backend/app.py               - Main Flask app
backend/models.py            - Database models
backend/static/qrcodes/      - Generated QR codes
frontend/src/pages/          - React pages
frontend/src/services/api.ts - API client
data/mysql/                  - Database data
```

## 🎯 Common Tasks

**Add new plant:**
1. Go to http://localhost:3000/add-plant
2. Fill form → Submit

**Generate QR code for pot:**
1. Go to http://localhost:3000/add-pot
2. Fill form → QR generated automatically

**Move/repot plant:**
1. Go to http://localhost:3000/move
2. Select plant, pot, soil → Submit

**View plant history:**
1. Click plant on dashboard
2. Scroll to "Pot History" section

---

**Need more help?** See SETUP.md for detailed instructions.
