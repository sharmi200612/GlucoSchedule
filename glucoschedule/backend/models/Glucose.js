// ============================================
// Model: GlucoseReading
// ============================================

const mongoose = require('mongoose');

const glucoseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, required: true }, // mg/dL
    type: {
      type: String,
      enum: ['fasting', 'post-meal', 'random'],
      required: true,
    },
    notes: { type: String },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GlucoseReading', glucoseSchema);
