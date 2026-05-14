// ============================================
// Controller: Blood Glucose
// ============================================

const GlucoseReading = require('../models/Glucose');

// @route  POST /api/glucose
// @desc   Add a new glucose reading
const addReading = async (req, res) => {
  try {
    const { level, type, notes, recordedAt } = req.body;
    const reading = await GlucoseReading.create({
      user: req.user._id, level, type, notes, recordedAt,
    });
    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/glucose
// @desc   Get all glucose readings for logged-in user
const getReadings = async (req, res) => {
  try {
    const readings = await GlucoseReading
      .find({ user: req.user._id })
      .sort({ recordedAt: -1 }); // newest first
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/glucose/:id
// @desc   Delete a glucose reading
const deleteReading = async (req, res) => {
  try {
    const reading = await GlucoseReading.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!reading) return res.status(404).json({ message: 'Reading not found' });
    res.json({ message: 'Reading deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReading, getReadings, deleteReading };
