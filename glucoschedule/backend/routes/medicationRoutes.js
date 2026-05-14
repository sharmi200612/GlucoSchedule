// ============================================
// Routes: Medication
// ============================================
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const createCRUD = require('../controllers/crudFactory');
const Medication = require('../models/Medication');

const router = express.Router();
const ctrl = createCRUD(Medication);

router.route('/').get(protect, ctrl.getAll).post(protect, ctrl.add);
router.route('/:id').put(protect, ctrl.update).delete(protect, ctrl.remove);

module.exports = router;
