// ============================================
// Generic CRUD Controller Factory
// ============================================
// This creates standard add/get/update/delete
// controllers for any Mongoose model.
// Usage: const ctrl = createCRUD(MyModel);

const createCRUD = (Model) => ({

  // Add new record
  add: async (req, res) => {
    try {
      const record = await Model.create({ user: req.user._id, ...req.body });
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all records for logged-in user
  getAll: async (req, res) => {
    try {
      const records = await Model.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a record by ID
  update: async (req, res) => {
    try {
      const record = await Model.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true } // Return updated document
      );
      if (!record) return res.status(404).json({ message: 'Record not found' });
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a record by ID
  remove: async (req, res) => {
    try {
      const record = await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!record) return res.status(404).json({ message: 'Record not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
});

module.exports = createCRUD;
