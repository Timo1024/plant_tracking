# 🌱 Plant Tracker

A full-stack web application for tracking plants and their pot assignments over time. Each pot has a unique QR code that links to its web page, showing which plant currently resides in it, what soil mix was used, and the plant's history.

## 📋 Features

- **Plant Management**: Add, edit, and track plants with detailed botanical information
- **Pot Tracking**: Manage pots with unique QR codes for easy identification
- **Soil Mixes**: Create and reuse custom soil mix compositions
- **Movement History**: Automatically track plant movements between pots
- **QR Code Integration**: Each pot has a scannable QR code linking to its details
- **Responsive UI**: Mobile-friendly interface built with React and Tailwind CSS

## 🏗️ Architecture

The application consists of three main services running via Docker Compose:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Flask REST API with SQLAlchemy ORM
- **Database**: MySQL 8.0

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Timo1024/plant_tracking.git
cd plant_tracking
```

2. Start the application:
```bash
docker compose up --build
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Seeding Sample Data (Optional)

To populate the database with sample plants, pots, and soils:

```bash
docker compose exec backend python seed.py
```

## 📱 Using QR Codes

1. Add a new pot through the web interface
2. A QR code will be automatically generated
3. Print or display the QR code on the physical pot
4. Scanning the QR code opens the pot's detail page showing:
   - Current plant information
   - Soil mix used
   - Location and pot size

## 🗄️ Database Schema

### Plants
- Botanical information (family, genus, species)
- Size, status, and notes
- Date added and removal reason (if applicable)

### Pots
- Unique QR code identifier
- Room/location and size
- Active status

### Soils
- Mix name and composition

### Plant-Pot History
- Tracks all plant movements
- Automatic end date handling when plants are moved
- Start/end dates and notes

## 🛠️ API Endpoints

### Plants
- `GET /api/plants` - List all plants
- `GET /api/plants/<id>` - Get plant details with history
- `POST /api/plants` - Add new plant
- `PUT /api/plants/<id>` - Update plant
- `DELETE /api/plants/<id>` - Mark plant as removed

### Pots
- `GET /api/pots` - List all pots
- `GET /api/pots/<qr_code_id>` - Get pot by QR code
- `POST /api/pots` - Add new pot (generates QR code)
- `PUT /api/pots/<id>` - Update pot

### Soils
- `GET /api/soils` - List all soil mixes
- `POST /api/soils` - Add soil mix
- `PUT /api/soils/<id>` - Update soil mix

### Movement
- `GET /api/history/<plant_id>` - Get plant's pot history
- `POST /api/move` - Move plant to new pot

## 🔧 Development

### Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure

```
plant_tracking/
├── backend/
│   ├── app.py              # Flask application
│   ├── models.py           # SQLAlchemy models
│   ├── requirements.txt    # Python dependencies
│   ├── seed.py            # Sample data script
│   ├── Dockerfile
│   └── static/qrcodes/    # Generated QR codes
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── data/                  # MySQL data volume
├── docker-compose.yml
└── README.md
```

## 🎨 Tech Stack

### Frontend
- React 18
- TypeScript
- React Router v6
- Axios
- Tailwind CSS
- Recharts (for visualizations)
- Vite

### Backend
- Flask 3.0
- SQLAlchemy 2.0
- PyMySQL
- qrcode library
- Flask-CORS

### Database
- MySQL 8.0

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Robin Bonkaß

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!