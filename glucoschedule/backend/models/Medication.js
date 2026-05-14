const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },       // e.g. "Metformin"
    dosage: { type: String },                      // e.g. "500mg"
    frequency: { type: String },                   // e.g. "Twice daily"
    times: [{ type: String }],                     // e.g. ["08:00", "20:00"]
    takenToday: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);
