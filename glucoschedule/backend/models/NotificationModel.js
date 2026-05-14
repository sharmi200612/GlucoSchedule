const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  type:          { type: String, default: 'reminder' },
  scheduledTime: { type: String, default: '' },
  scheduledHour: { type: Number, default: -1 },
  scheduledMin:  { type: Number, default: -1 },
  emailScheduled:{ type: Boolean, default: false },
  emailSent:     { type: Boolean, default: false },
  emailSentAt:   { type: Date },
  isDailySchedule:{ type: Boolean, default: false }, // ← NEW
  isRead:        { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
