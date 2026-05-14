const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },

  // Patient Profile
  age:               { type: Number },
  gender:            { type: String }, // no enum restriction
  diabetesType:      { type: String }, // no enum restriction — accepts Type 1, Type 2, etc.
  diagnosedYear:     { type: String },
  weight:            { type: String },
  height:            { type: String },
  doctor:            { type: String },
  phone:             { type: String },
  emergencyContact:  { type: String },
  medicationDetails: { type: String },
  targetGlucoseMin:  { type: Number, default: 70  },
  targetGlucoseMax:  { type: Number, default: 180 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
