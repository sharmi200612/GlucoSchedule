// ============================================
// GlucoSchedule Server — with Email Scheduler
// ============================================
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/glucose',       require('./routes/glucoseRoutes'));
app.use('/api/medication',    require('./routes/medicationRoutes'));
app.use('/api/meals',         require('./routes/mealRoutes'));
app.use('/api/exercise',      require('./routes/exerciseRoutes'));
app.use('/api/meditation',    require('./routes/meditationRoutes'));
app.use('/api/appointments',  require('./routes/appointmentRoutes'));
app.use('/api/planner',       require('./routes/plannerRoutes'));
app.use('/api/reports',       require('./routes/reportRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai',            require('./routes/aiRoutes'));
app.get('/', (req, res) => res.json({ message: '✅ GlucoSchedule API running!' }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startEmailScheduler();
    });
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

function startEmailScheduler() {
  const { runScheduledEmails } = require('./controllers/notificationController');

  // Run immediately once on startup
  runScheduledEmails();

  // Try node-cron first
  try {
    const cron = require('node-cron');
    cron.schedule('* * * * *', runScheduledEmails);
    console.log('⏰ node-cron scheduler active — checks every minute');
  } catch {
    // Fallback: setInterval every 60 seconds
    setInterval(runScheduledEmails, 60000);
    console.log('⏰ setInterval scheduler active — checks every minute');
  }
}
