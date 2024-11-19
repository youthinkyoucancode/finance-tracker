// models/Goal.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  isAchieved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Goal', goalSchema);
