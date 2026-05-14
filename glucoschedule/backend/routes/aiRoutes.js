// ============================================
// Routes: AI Health Analysis
// ============================================

const express = require('express');
const router  = express.Router();
const { analyzeHealth } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/ai/analyze — Run full AI health analysis
router.get('/analyze', protect, analyzeHealth);

module.exports = router;
