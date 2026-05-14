// ============================================
// Notification Controller
// Daily Planner — each activity sends email
// at its exact scheduled time automatically
// ============================================

const Notification = require('../models/NotificationModel');
const User         = require('../models/User');
const nodemailer   = require('nodemailer');

// ── Daily Planner Schedule ───────────────────
// Each activity has its exact time, icon, tip
const DAILY_PLANNER = [
  { time:'6:00 AM',  hour:6,  min:0,  icon:'🌅', activity:'Wake Up',                   category:'wake',       tip:'Check your fasting blood glucose immediately after waking.' },
  { time:'6:15 AM',  hour:6,  min:15, icon:'💧', activity:'Drink Water (2 glasses)',    category:'water',      tip:'Drink 2 glasses of water. Helps flush excess glucose.' },
  { time:'6:30 AM',  hour:6,  min:30, icon:'🧘', activity:'Morning Meditation (10 min)',category:'meditation', tip:'10 minutes deep breathing lowers cortisol and stabilizes glucose.' },
  { time:'7:00 AM',  hour:7,  min:0,  icon:'🚶', activity:'Morning Walk (30 min)',      category:'exercise',   tip:'Light walking improves insulin sensitivity for the day.' },
  { time:'7:45 AM',  hour:7,  min:45, icon:'💊', activity:'Morning Medication',         category:'medication', tip:'Take prescribed medication with water, not on empty stomach.' },
  { time:'8:00 AM',  hour:8,  min:0,  icon:'🍳', activity:'Breakfast',                  category:'meal',       tip:'Low-GI foods: oats, eggs, whole wheat toast, avocado.' },
  { time:'10:00 AM', hour:10, min:0,  icon:'💉', activity:'Glucose Check',              category:'glucose',    tip:'Check blood sugar 2 hours after breakfast. Log in app.' },
  { time:'10:30 AM', hour:10, min:30, icon:'🍎', activity:'Morning Snack',              category:'meal',       tip:'Small snack: apple, almonds, or low-fat yogurt.' },
  { time:'12:00 PM', hour:12, min:0,  icon:'💧', activity:'Hydration Reminder',         category:'water',      tip:'Drink 1-2 glasses of water. Avoid sugary drinks.' },
  { time:'1:00 PM',  hour:13, min:0,  icon:'🥗', activity:'Lunch',                      category:'meal',       tip:'50% vegetables, 25% lean protein, 25% whole grains.' },
  { time:'2:00 PM',  hour:14, min:0,  icon:'💉', activity:'Post-Lunch Glucose Check',   category:'glucose',    tip:'Target: below 180 mg/dL after meals. Log your reading.' },
  { time:'4:00 PM',  hour:16, min:0,  icon:'🍌', activity:'Afternoon Snack',            category:'meal',       tip:'Prevents glucose dip before dinner. Try nuts or fruit.' },
  { time:'5:30 PM',  hour:17, min:30, icon:'🏃', activity:'Evening Exercise (30 min)',  category:'exercise',   tip:'30-min walk or yoga lowers blood sugar naturally.' },
  { time:'7:00 PM',  hour:19, min:0,  icon:'💊', activity:'Evening Medication',         category:'medication', tip:'Take your evening prescribed dose on time.' },
  { time:'7:30 PM',  hour:19, min:30, icon:'🍽️', activity:'Dinner',                   category:'meal',       tip:'Light meal. Avoid heavy carbs at night. Eat before 8PM.' },
  { time:'9:00 PM',  hour:21, min:0,  icon:'💉', activity:'Evening Glucose Check',      category:'glucose',    tip:'Log your evening reading before winding down.' },
  { time:'9:30 PM',  hour:21, min:30, icon:'💧', activity:'Final Hydration',            category:'water',      tip:'Last glass of water for the day.' },
  { time:'10:00 PM', hour:22, min:0,  icon:'😴', activity:'Sleep (7-8 hours)',          category:'sleep',      tip:'Good sleep is essential. Poor sleep raises blood sugar.' },
];

// ── Category icons ────────────────────────────
const getCatIcon = c => ({medication:'💊',meal:'🍽️',glucose:'💉',exercise:'🏃',water:'💧',sleep:'😴',meditation:'🧘',wake:'🌅'}[c]||'🔔');

// ── Send email ────────────────────────────────
const sendEmail = async (toEmail, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return { success:false, reason:'No email config' };
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"GlucoSchedule 🩺" <${process.env.EMAIL_USER}>`,
      to: toEmail, subject, html,
    });
    console.log(`✅ Email sent to ${toEmail}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    return { success: false, reason: err.message };
  }
};

// ── Parse "08:30 AM" → { hour: 8, min: 30 } ──
const parseTime = (timeStr) => {
  if (!timeStr || !timeStr.trim()) return null;
  try {
    const clean = timeStr.trim().toUpperCase();
    const isPM  = clean.includes('PM');
    const isAM  = clean.includes('AM');
    const part  = clean.replace('AM','').replace('PM','').trim();
    const [h,m] = part.split(':');
    let hour    = parseInt(h, 10);
    const min   = parseInt(m||'0', 10);
    if (isPM && hour !== 12) hour += 12;
    if (isAM && hour === 12) hour  = 0;
    if (isNaN(hour)||isNaN(min)) return null;
    return { hour, min };
  } catch { return null; }
};

// ── Activity email template ───────────────────
const activityEmailHTML = (userName, userEmail, activity) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f4f0;font-family:Arial,sans-serif">
<div style="max-width:520px;margin:30px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
  <div style="background:linear-gradient(135deg,#1b2d27,#2d6a4f);padding:22px 26px;text-align:center">
    <div style="font-size:2.5rem;margin-bottom:8px">${activity.icon}</div>
    <h1 style="color:#fff;margin:0;font-size:1.2rem">${activity.activity}</h1>
    <p style="color:#b7e4c7;margin:5px 0 0;font-size:0.85rem">⏰ Daily Schedule — ${activity.time}</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:0.95rem;color:#333">Hello <strong>${userName}</strong>,</p>
    <p style="color:#555;font-size:0.9rem">It is time for your scheduled activity:</p>
    <div style="background:#f0faf4;border-left:5px solid #2d6a4f;border-radius:10px;padding:18px;margin:14px 0">
      <div style="font-size:1.2rem;font-weight:700;color:#1b2d27">${activity.icon} ${activity.activity}</div>
      <div style="color:#52b788;margin-top:6px;font-weight:600;font-size:0.9rem">⏰ Scheduled Time: <strong>${activity.time}</strong></div>
    </div>
    <div style="background:#fffbea;border:1px solid #ffe082;border-radius:8px;padding:14px;font-size:0.85rem;color:#7a5c00;line-height:1.6">
      💡 <strong>Health Tip:</strong> ${activity.tip}
    </div>
    <p style="font-size:0.78rem;color:#aaa;margin-top:16px">
      Sent to: <strong>${userEmail}</strong> &nbsp;·&nbsp; GlucoSchedule Daily Planner
    </p>
  </div>
  <div style="background:#f8fffe;padding:12px;text-align:center;font-size:0.73rem;color:#aaa;border-top:1px solid #e8f5e9">
    GlucoSchedule — Smart Diabetes Care · This is an automated daily planner reminder
  </div>
</div></body></html>`;

// ── Reminder email template ───────────────────
const reminderHTML = (name, email, dtype, notif) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f4f0;font-family:Arial,sans-serif">
<div style="max-width:540px;margin:30px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
  <div style="background:linear-gradient(135deg,#1b2d27,#2d6a4f);padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:1.2rem">🩺 GlucoSchedule Reminder</h1>
    <p style="color:#b7e4c7;margin:5px 0 0;font-size:0.85rem">Scheduled Alert</p>
  </div>
  <div style="padding:24px">
    <p>Hello <strong>${name}</strong>,</p>
    <div style="background:#f0faf4;border-left:5px solid #2d6a4f;border-radius:10px;padding:16px;margin:12px 0">
      <div style="font-size:1.1rem;font-weight:700;color:#1b2d27">${getCatIcon(notif.type)} ${notif.title}</div>
      <div style="color:#52b788;margin-top:5px;font-weight:600">⏰ ${notif.scheduledTime||'Now'}</div>
      <div style="color:#555;margin-top:7px;font-size:0.88rem;line-height:1.6">${notif.message}</div>
    </div>
    <p style="font-size:0.78rem;color:#aaa;margin-top:14px">Sent to: <strong>${email}</strong></p>
  </div>
  <div style="background:#f8fffe;padding:12px;text-align:center;font-size:0.73rem;color:#aaa;border-top:1px solid #e8f5e9">
    GlucoSchedule — Smart Diabetes Care
  </div>
</div></body></html>`;

// ══════════════════════════════════════════════
// TEST EMAIL
// ══════════════════════════════════════════════
const testEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      return res.json({ success:false, message:'❌ EMAIL_USER or EMAIL_PASS not set in backend/.env' });
    if (!user?.email)
      return res.json({ success:false, message:'❌ No email on your account' });

    const r = await sendEmail(user.email, '🧪 GlucoSchedule Test Email',
      `<div style="font-family:Arial;padding:30px;max-width:480px;margin:auto;background:#f0faf4;border-radius:12px">
        <h2 style="color:#2d6a4f">✅ Email Working!</h2>
        <p>Hello <strong>${user.name}</strong>, your email setup is working!</p>
        <p style="color:#555">Sent to: <strong>${user.email}</strong><br>Time: ${new Date().toLocaleString()}</p>
      </div>`
    );
    res.json({
      success: r.success,
      message: r.success ? `✅ Test email sent to ${user.email}!` : `❌ Failed: ${r.reason}`,
    });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

// ══════════════════════════════════════════════
// SCHEDULE DAILY PLANNER EMAILS
// Creates 18 scheduled notifications — one for
// each activity at its exact time
// ══════════════════════════════════════════════
const scheduleDailyPlannerEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.json({ success:false, message:'❌ Add EMAIL_USER & EMAIL_PASS to backend/.env first.' });
    }
    if (!user?.email) {
      return res.json({ success:false, message:'❌ No email on your account.' });
    }

    // Delete existing daily planner notifications for today to avoid duplicates
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);
    await Notification.deleteMany({
      user: req.user._id,
      type: 'daily-planner',
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Create one notification per activity
    const created = [];
    for (const activity of DAILY_PLANNER) {
      const notif = await Notification.create({
        user:          req.user._id,
        title:         activity.activity,
        message:       activity.tip,
        type:          'daily-planner',
        scheduledTime: activity.time,
        scheduledHour: activity.hour,
        scheduledMin:  activity.min,
        emailScheduled: true,
        emailSent:      false,
        isRead:         false,
      });
      created.push(notif);
    }

    console.log(`✅ Scheduled ${created.length} daily planner emails for ${user.email}`);

    res.json({
      success: true,
      count:   created.length,
      message: `✅ Daily planner scheduled! ${created.length} emails will be sent to ${user.email} at each activity time (6:00 AM to 10:00 PM).`,
    });
  } catch (err) {
    console.error('scheduleDailyPlannerEmails error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════════════════
// CREATE SINGLE NOTIFICATION
// ══════════════════════════════════════════════
const createNotification = async (req, res) => {
  try {
    const { title, message, type, scheduledTime } = req.body;
    if (!title || !message) return res.status(400).json({ message:'Title and message are required.' });

    const parsed = parseTime(scheduledTime);

    const notification = await Notification.create({
      user: req.user._id, title, message,
      type: type || 'reminder',
      scheduledTime: scheduledTime || '',
      scheduledHour: parsed ? parsed.hour : -1,
      scheduledMin:  parsed ? parsed.min  : -1,
      emailScheduled: !!parsed,
      emailSent: false, isRead: false,
    });

    const user = await User.findById(req.user._id);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      return res.status(201).json({ notification, message:'✅ Reminder saved! (Add EMAIL_USER & EMAIL_PASS to .env for emails)' });
    if (!user?.email)
      return res.status(201).json({ notification, message:'✅ Reminder saved! No email on account.' });

    let msg = '';
    if (!parsed) {
      const r = await sendEmail(user.email, `⏰ GlucoSchedule: ${title}`, reminderHTML(user.name, user.email, user.diabetesType, notification));
      if (r.success) { notification.emailSent = true; notification.emailSentAt = new Date(); await notification.save(); }
      msg = r.success ? `✅ Reminder created & email sent to ${user.email}` : `✅ Saved. Email failed: ${r.reason}`;
    } else {
      const now = new Date(); const then = new Date(); then.setHours(parsed.hour, parsed.min, 0, 0);
      if (then > now) {
        msg = `✅ Reminder saved! Email will auto-send at ${scheduledTime} to ${user.email} 📧`;
      } else {
        const r = await sendEmail(user.email, `⏰ GlucoSchedule: ${title}`, reminderHTML(user.name, user.email, user.diabetesType, notification));
        if (r.success) { notification.emailSent = true; notification.emailSentAt = new Date(); await notification.save(); }
        msg = r.success ? `✅ Time passed. Email sent now to ${user.email}` : `✅ Saved. Email failed: ${r.reason}`;
      }
    }

    res.status(201).json({ notification, message: msg });
  } catch (err) {
    res.status(500).json({ message:'Failed: ' + err.message });
  }
};

// ══════════════════════════════════════════════
// SCHEDULER — runs every minute
// Sends emails for both custom reminders AND
// daily planner activities at their exact times
// ══════════════════════════════════════════════
const runScheduledEmails = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const now = new Date();
  const h   = now.getHours();
  const m   = now.getMinutes();

  console.log(`🔄 Scheduler [${now.toLocaleTimeString()}] — hour=${h}, min=${m}`);

  try {
    const pending = await Notification.find({
      emailScheduled: true,
      emailSent:      false,
      scheduledHour:  h,
      scheduledMin:   m,
    });

    if (pending.length > 0) {
      console.log(`   ⏰ Found ${pending.length} email(s) due now!`);
    }

    for (const notif of pending) {
      const user = await User.findById(notif.user);
      if (!user?.email) continue;

      let result;

      if (notif.type === 'daily-planner') {
        // Send beautiful activity-specific email
        result = await sendEmail(
          user.email,
          `${notif.title} — ${notif.scheduledTime} | GlucoSchedule`,
          activityEmailHTML(user.name, user.email, {
            icon:     DAILY_PLANNER.find(a => a.activity === notif.title)?.icon || '🔔',
            activity: notif.title,
            time:     notif.scheduledTime,
            tip:      notif.message,
          })
        );
      } else {
        // Send regular reminder email
        result = await sendEmail(
          user.email,
          `⏰ GlucoSchedule Reminder: ${notif.title}`,
          reminderHTML(user.name, user.email, user.diabetesType, notif)
        );
      }

      notif.emailSent   = true;
      notif.emailSentAt = now;
      await notif.save();

      if (result.success) {
        console.log(`   ✅ "${notif.title}" delivered to ${user.email}`);
      } else {
        console.log(`   ❌ "${notif.title}" failed: ${result.reason}`);
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
};

// ══════════════════════════════════════════════
// GET / MARK / DELETE
// ══════════════════════════════════════════════
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user:req.user._id }).sort({ createdAt:-1 }).limit(100);
    const unreadCount   = await Notification.countDocuments({ user:req.user._id, isRead:false });
    res.json({ notifications, unreadCount });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id:req.params.id, user:req.user._id }, { isRead:true });
    res.json({ success:true });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user:req.user._id, isRead:false }, { isRead:true });
    res.json({ success:true });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id:req.params.id, user:req.user._id });
    res.json({ success:true });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user:req.user._id });
    res.json({ success:true });
  } catch (err) { res.status(500).json({ message:err.message }); }
};

const sendDailyReminders = async (req, res) => {
  // Keep for backward compatibility — now just calls scheduleDailyPlannerEmails
  return scheduleDailyPlannerEmails(req, res);
};

module.exports = {
  createNotification, getNotifications,
  markAsRead, markAllRead,
  deleteNotification, deleteAllNotifications,
  sendDailyReminders, scheduleDailyPlannerEmails,
  runScheduledEmails, testEmail,
};
