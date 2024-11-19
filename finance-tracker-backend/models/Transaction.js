const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false }, // Correct field name
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: false },
});

module.exports = mongoose.model('Transaction', transactionSchema);
