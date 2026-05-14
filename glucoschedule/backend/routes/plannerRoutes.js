const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const createCRUD = require('../controllers/crudFactory');
const { PlannerTask } = require('../models/HealthModels');
const router = express.Router();
const ctrl = createCRUD(PlannerTask);
router.route('/').get(protect, ctrl.getAll).post(protect, ctrl.add);
router.route('/:id').put(protect, ctrl.update).delete(protect, ctrl.remove);
module.exports = router;
