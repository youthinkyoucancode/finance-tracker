const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now } // Optional, for tracking month-wise budgets
});

module.exports = mongoose.model('Budget', BudgetSchema);
