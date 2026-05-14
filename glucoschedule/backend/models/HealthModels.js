// ============================================
// Model: Meal
// ============================================
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foods: [{ type: String }],   // e.g. ["Brown rice", "Grilled chicken"]
  calories: { type: Number },
  scheduledTime: { type: String }, // e.g. "08:00"
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const Meal = mongoose.model('Meal', mealSchema);

// ============================================
// Model: Exercise
// ============================================
const exerciseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, enum: ['walking', 'yoga', 'workout', 'cycling', 'swimming', 'other'] },
  durationMinutes: { type: Number },
  scheduledTime: { type: String },
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

// ============================================
// Model: Meditation
// ============================================
const meditationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType: { type: String, enum: ['breathing', 'mindfulness', 'relaxation', 'other'] },
  durationMinutes: { type: Number },
  scheduledTime: { type: String },
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const Meditation = mongoose.model('Meditation', meditationSchema);

// ============================================
// Model: Appointment
// ============================================
const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  notes: { type: String },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// ============================================
// Model: PlannerTask
// ============================================
const plannerTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['medication', 'meal', 'exercise', 'meditation', 'appointment', 'other'],
  },
  scheduledTime: { type: String },
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const PlannerTask = mongoose.model('PlannerTask', plannerTaskSchema);

module.exports = { Meal, Exercise, Meditation, Appointment, PlannerTask };
