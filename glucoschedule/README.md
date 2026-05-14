# 🩺 GlucoSchedule — Smart Diabetes Care & Daily Planning System

A full-stack web application built with **React.js**, **Node.js**, and **MongoDB**.

---

## 📁 Project Structure

```
glucoschedule/
├── frontend/          ← React.js app (user interface)
│   └── src/
│       ├── components/   ← UI components for each module
│       ├── pages/        ← Full page views
│       ├── context/      ← Global state (AuthContext)
│       ├── hooks/        ← Custom React hooks
│       ├── utils/        ← Helper functions
│       └── styles/       ← Global CSS
├── backend/           ← Node.js + Express API
│   ├── controllers/   ← Business logic
│   ├── models/        ← MongoDB schemas
│   ├── routes/        ← API route definitions
│   ├── middleware/    ← Auth middleware
│   ├── utils/         ← Helper utilities
│   └── config/        ← DB connection
└── README.md
```

---

## 🚀 Getting Started

### Step 1 — Install MongoDB
Download and install MongoDB Community from https://www.mongodb.com/try/download/community

### Step 2 — Setup Backend
```bash
cd backend
npm install
# Create a .env file (see backend/.env.example)
npm run dev
```

### Step 3 — Setup Frontend
```bash
cd frontend
npm install
npm start
```

### Step 4 — Open in Browser
Visit: http://localhost:3000

---

## 🔧 Tech Stack
| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React.js, Axios, Chart.js |
| Backend   | Node.js, Express.js    |
| Database  | MongoDB, Mongoose      |
| Auth      | JWT (JSON Web Tokens)  |
| Styling   | CSS Variables + Custom CSS |

---

## 📦 Modules
1. User Authentication & Profile Management
2. Blood Glucose Monitoring
3. Medication & Reminder
4. Meal Planning & Diet Management
5. Exercise & Physical Activity
6. Meditation & Stress Management
7. Doctor Appointment Management
8. Daily Planner & Task Management
9. Reports & Health History
10. Admin Management
11. Notification & Alert
