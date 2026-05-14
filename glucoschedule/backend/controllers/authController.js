// ============================================
// Controller: Auth
// Sends welcome email to every new user
// Sends reminder emails to each user's own Gmail
// ============================================

const User     = require('../models/User');
const jwt      = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Email sender ─────────────────────────────
const sendEmail = async (toEmail, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"GlucoSchedule 🩺" <${process.env.EMAIL_USER}>`,
      to:   toEmail,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

// ── Welcome email to new user ─────────────────
const buildWelcomeEmail = (user) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin:0; padding:0; background:#f0f4f0; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { max-width:560px; margin:30px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.1); }
    .header  { background:linear-gradient(135deg,#1b2d27,#2d6a4f); padding:32px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:1.5rem; }
    .header p  { color:#b7e4c7; margin:8px 0 0; font-size:0.9rem; }
    .body { padding:32px; }
    .welcome-box { background:#f0faf4; border-left:5px solid #2d6a4f; border-radius:10px; padding:20px; margin:16px 0; }
    .feature { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }
    .feature:last-child { border-bottom:none; }
    .footer { background:#f8fffe; padding:16px; text-align:center; font-size:0.75rem; color:#aaa; border-top:1px solid #e8f5e9; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🩺 Welcome to GlucoSchedule!</h1>
    <p>Smart Diabetes Care & Daily Planning System</p>
  </div>
  <div class="body">
    <p style="font-size:1rem;color:#333">Hello <strong>${user.name}</strong>! 👋</p>
    <p style="color:#555;font-size:0.9rem;line-height:1.7">Your account has been successfully created. You are now part of GlucoSchedule — your personal diabetes management system.</p>
    <div class="welcome-box">
      <div style="font-weight:700;color:#1b2d27;margin-bottom:8px">📋 Your Account Details:</div>
      <div style="font-size:0.88rem;color:#555">📧 Email: <strong>${user.email}</strong></div>
      <div style="font-size:0.88rem;color:#555;margin-top:4px">🩺 Diabetes Type: <strong>${user.diabetesType || 'Not set'}</strong></div>
    </div>
    <p style="font-weight:700;color:#1b2d27;margin-bottom:12px">What you can do with GlucoSchedule:</p>
    <div class="feature"><span style="font-size:1.3rem">💉</span><div><strong>Blood Glucose Tracking</strong><br><span style="font-size:0.82rem;color:#777">Log and monitor your sugar levels daily</span></div></div>
    <div class="feature"><span style="font-size:1.3rem">💊</span><div><strong>Medication Reminders</strong><br><span style="font-size:0.82rem;color:#777">Never miss your medication again</span></div></div>
    <div class="feature"><span style="font-size:1.3rem">📋</span><div><strong>Daily Planner</strong><br><span style="font-size:0.82rem;color:#777">Structured schedule from 6AM to 10PM</span></div></div>
    <div class="feature"><span style="font-size:1.3rem">🤖</span><div><strong>AI Health Analysis</strong><br><span style="font-size:0.82rem;color:#777">Predict glucose levels and get diet recommendations</span></div></div>
    <div class="feature"><span style="font-size:1.3rem">🔔</span><div><strong>Email Notifications</strong><br><span style="font-size:0.82rem;color:#777">All reminders sent directly to this Gmail</span></div></div>
    <div style="margin-top:20px;padding:14px;background:#fff8e1;border-radius:8px;border:1px solid #ffe082;font-size:0.83rem;color:#7a5c00">
      💡 <strong>Tip:</strong> Go to the Notifications page and click "Send Daily Schedule" to receive your full daily diabetes management plan in this Gmail inbox!
    </div>
  </div>
  <div class="footer">
    GlucoSchedule — Smart Diabetes Care<br>
    This email was sent to ${user.email} upon registration.
  </div>
</div>
</body>
</html>`;

// ── @route POST /api/auth/register ───────────
const register = async (req, res) => {
  try {
    const { name, email, password, age, gender, diabetesType } = req.body;

    // Check if already registered
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'This email is already registered. Please login.' });
    }

    // Create user — email saved to MongoDB
    const user = await User.create({
      name, email: email.toLowerCase().trim(),
      password, age, gender, diabetesType,
    });

    // Send welcome email to user's own registered Gmail
    const emailSent = await sendEmail(
      user.email,
      '🎉 Welcome to GlucoSchedule — Your Account is Ready!',
      buildWelcomeEmail(user)
    );

    console.log(`✅ New user registered: ${user.email} | Welcome email sent: ${emailSent}`);

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
      message: emailSent
        ? `Account created! Welcome email sent to ${user.email}`
        : 'Account created successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route POST /api/auth/login ──────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      diabetesType:     user.diabetesType,
      targetGlucoseMin: user.targetGlucoseMin,
      targetGlucoseMax: user.targetGlucoseMax,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route GET /api/auth/profile ─────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── @route PUT /api/auth/profile ─────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fields = ['name', 'age', 'gender', 'diabetesType', 'diagnosedYear',
      'weight', 'height', 'doctor', 'phone', 'emergencyContact',
      'medicationDetails', 'targetGlucoseMin', 'targetGlucoseMax'];
    fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({
      message: 'Profile updated successfully',
      name:  updated.name,
      email: updated.email,
      age:   updated.age,
      gender: updated.gender,
      diabetesType:     updated.diabetesType,
      diagnosedYear:    updated.diagnosedYear,
      weight:           updated.weight,
      height:           updated.height,
      doctor:           updated.doctor,
      phone:            updated.phone,
      emergencyContact: updated.emergencyContact,
      targetGlucoseMin: updated.targetGlucoseMin,
      targetGlucoseMax: updated.targetGlucoseMax,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
