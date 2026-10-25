# ♻️ Smart Recycling Waste Management System

A full-stack, AI-powered web platform designed to streamline municipal and household waste segregation, promote recycling best practices, track personal environmental impact, and gamify sustainable habits.

Built with **FastAPI**, **Machine Vision & Classification (PyTorch / Scikit-learn)**, **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 🌟 Key Features

1. **AI Waste Image Classifier**
   - Drag-and-drop or upload waste photos (JPEG, PNG, WebP up to 5 MB).
   - Instant categorization into **Cardboard**, **Glass**, **Metal**, **Paper**, **Plastic**, or **Trash** using a trained multi-feature computer vision pipeline (TrashNet benchmark).
   - Generates confidence score, material type breakdown, preparation checklist, reuse ideas, and safety precautions.

2. **Interactive Recycling Guide**
   - Searchable, categorized segregation encyclopedia.
   - Detailed checklists, common recycling mistakes, and material-specific lifecycle notes.
   - Context-aware view accessible publicly or within the authenticated dashboard.

3. **Recycling Activity Tracking & LCA Analytics**
   - Log self-reported waste disposal activities with weight and material multipliers.
   - Dynamic Life Cycle Assessment (LCA) environmental metrics:
     - **CO₂ emissions averted** (1.85 kg CO₂ / kg recycled)
     - **Water saved** (26.5 L / kg recycled)
     - **Tree conservation equivalents** (0.012 trees / kg recycled)
   - Interactive charts using **Recharts** (category distribution, monthly activity trends).

4. **Eco-Points & Gamification Engine**
   - Earn points per kilogram of recycled waste with material bonuses (e.g., metals and plastics).
   - Unlockable sustainability challenges (*First Scan*, *Waste Detective*, *Recycling Habit*, *Eco Scholar*).
   - Community leaderboard ranking active recyclers.

5. **Recycling Center Directory**
   - Search and filter verified waste recovery facilities by material accepted, city, and zip code.
   - Operating hours, contact details, and facility acceptance verification.

6. **AI Recycling Assistant**
   - Natural language assistant handling common segregation dilemmas (e.g. greasy pizza boxes, broken ceramics, aerosol cans).
   - Built-in zero-dependency knowledge base with optional external LLM routing (OpenAI / Gemini).

7. **Admin Operations Hub**
   - Role-protected administrative dashboard for facility management, global user stats, and audit trails.

---

## 🏗️ Architecture & Technology Stack

```
smart_waste_managment/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── ml/                    # AI Pipeline (dataset prep, feature extraction, classifier)
│   │   │   └── waste_classifier.pkl
│   │   ├── routers/               # Modular API routes (auth, classify, activities, guide, etc.)
│   │   ├── auth.py                # JWT authentication & password hashing
│   │   ├── database.py            # SQLAlchemy 2.0 ORM session factory
│   │   ├── models.py              # 7 relational database models
│   │   ├── schemas.py             # Pydantic 2 request/response schemas
│   │   └── seed_data.py           # Auto-seeding for facilities and guides
│   ├── requirements.txt           # Python dependencies
│   ├── test_suite.py              # Automated 9-suite integration test
│   └── run.py                     # Uvicorn entry point
│
└── frontend/                      # React 18 + TypeScript + Vite Frontend
    ├── src/
    │   ├── api/                   # Fetch client with JWT interceptor & auto-logout
    │   ├── components/            # Reusable UI components (Navbar, Footer, Modal, Charts)
    │   ├── context/               # AuthContext for reactive user session state
    │   ├── pages/                 # Full-featured responsive view pages
    │   └── App.tsx                # App routing & protected dashboard layout
    ├── tailwind.config.js         # Eco-themed modern design system tokens
    ├── vite.config.ts             # Dev server & API reverse proxy configuration
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Git**

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Start FastAPI server
python run.py
```
*API runs at `http://127.0.0.1:8000`.*  
*Interactive Swagger documentation available at `http://127.0.0.1:8000/docs`.*

---

### 2. Frontend Setup

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend opens at `http://localhost:5173`.*

---

## 🧪 Running Tests

### Backend Automated Integration Test Suite
```bash
cd backend
python test_suite.py
```
Validates 9 integration test suites:
- Health and root status
- User registration, login, and JWT validation
- AI image classifier inference and confidence checks
- Recycling activities CRUD and eco-point calculation
- Dashboard summary and environmental metrics
- Challenge completion and leaderboard progression
- Recycling facility directory search & filters
- Built-in AI recycling assistant chat
- Role-based access control & multi-tenant user isolation

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🔑 Demo Credentials

Pre-seeded accounts available out-of-the-box:
- **Standard User:** `user@smartrecycling.org` | Password: `User@123456`
- **Administrator:** `admin@smartrecycling.org` | Password: `Admin@123456`

*(Available on the `/login` screen via the "Quick Fill Demo Accounts" buttons).*

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
