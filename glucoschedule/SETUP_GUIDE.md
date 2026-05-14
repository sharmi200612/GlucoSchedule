# 🚀 GlucoSchedule — Step-by-Step Setup Guide (For Beginners)

Follow these steps IN ORDER to get your project running in VS Code.

---

## ✅ BEFORE YOU START — Install These Tools

Download and install each one if you don't have it already:

| Tool | Download Link | Why You Need It |
|------|--------------|----------------|
| **Node.js** (v18+) | https://nodejs.org | Runs your backend |
| **MongoDB Community** | https://www.mongodb.com/try/download/community | Your database |
| **VS Code** | https://code.visualstudio.com | Your code editor |
| **Git** (optional) | https://git-scm.com | Version control |

---

## 📁 STEP 1 — Open the Project in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Select the `glucoschedule` folder

---

## ⚙️ STEP 2 — Set Up the Backend

Open a **Terminal** in VS Code (press `` Ctrl+` ``):

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install

# Create your .env file
cp .env.example .env
```

Now open the `.env` file and make sure it looks like this:
```
MONGO_URI=mongodb://localhost:27017/glucoschedule
JWT_SECRET=mySecretKey123456
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 🗄️ STEP 3 — Start MongoDB

**On Windows:**
- MongoDB usually starts automatically as a service
- Or open it from the Start Menu

**On Mac:**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

---

## ▶️ STEP 4 — Start the Backend

In VS Code terminal (make sure you're in the `backend` folder):
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

---

## 💻 STEP 5 — Set Up and Start the Frontend

Open a **NEW** terminal in VS Code (click the `+` icon in the terminal panel):

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (this may take a few minutes)
npm install

# Start the React app
npm start
```

Your browser will automatically open to: **http://localhost:3000**

---

## 🎉 STEP 6 — Use the App!

1. Go to http://localhost:3000
2. Click **"Register here"** to create your account
3. Fill in your profile details
4. Start using all the modules!

---

## 🐛 Common Problems & Fixes

| Problem | Solution |
|---------|----------|
| "Cannot connect to MongoDB" | Make sure MongoDB is running (Step 3) |
| "Port 5000 already in use" | Change PORT in .env to 5001 |
| "npm not found" | Install Node.js from nodejs.org |
| Frontend shows blank page | Check browser console (F12) for errors |
| Login not working | Make sure backend is running on port 5000 |

---

## 📂 File Structure Quick Reference

```
glucoschedule/
├── backend/
│   ├── server.js          ← Start here! Main server file
│   ├── .env               ← Your configuration (create this!)
│   ├── models/            ← Database structures
│   │   ├── User.js
│   │   ├── Glucose.js
│   │   ├── Medication.js
│   │   └── HealthModels.js
│   ├── controllers/       ← Business logic
│   ├── routes/            ← API endpoints
│   └── middleware/        ← JWT authentication
│
└── frontend/
    └── src/
        ├── App.js          ← Main React app with routes
        ├── pages/          ← One file per page/screen
        ├── components/     ← Reusable UI pieces
        ├── context/        ← AuthContext (login state)
        └── utils/api.js    ← HTTP requests to backend
```

---

## 🔑 How Authentication Works (Simple Explanation)

1. User registers/logs in → Backend creates a **JWT token**
2. Token is saved in **localStorage** on the browser
3. Every API request automatically includes the token
4. Backend verifies the token before responding

---

## 📚 Next Steps to Learn

- Learn about React Hooks: https://react.dev/reference/react
- Learn about Express.js: https://expressjs.com/
- Learn about MongoDB: https://www.mongodb.com/docs/
- Learn about JWT: https://jwt.io/introduction
