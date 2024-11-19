const express = require('express');
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  exportTransactionsAsCSV, // Import the CSV export function
} = require('../controllers/transactionController');

const router = express.Router();

// GET all transactions
router.get('/', getTransactions);

// POST a new transaction
router.post('/', addTransaction);

// PUT endpoint for updating a transaction
router.put('/:id', updateTransaction);

// DELETE endpoint for deleting a transaction
router.delete('/:id', deleteTransaction);

// Export transactions to CSV
router.get('/export', exportTransactionsAsCSV);

module.exports = router;
