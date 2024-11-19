const { Parser } = require('json2csv'); // Import json2csv library for CSV export
const Transaction = require('../models/Transaction');

// Add a new transaction
const addTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error adding transaction' });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transaction' });
  }
};

// Export transactions as CSV
const exportTransactionsAsCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find(); // Fetch all transactions
    const csvFields = ['_id', 'title', 'type', 'category', 'amount', 'date', 'isRecurring', 'frequency'];
    const csvParser = new Parser({ fields: csvFields });
    const csv = csvParser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting transactions to CSV:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
};

// Handle recurring transactions
const handleRecurringTransactions = async () => {
  try {
    const today = new Date();
    const recurringTransactions = await Transaction.find({ isRecurring: true });

    for (const transaction of recurringTransactions) {
      const lastTransactionDate = new Date(transaction.date);
      let addTransaction = false;

      switch (transaction.frequency) {
        case 'daily':
          addTransaction = today.getDate() !== lastTransactionDate.getDate();
          break;
        case 'weekly':
          addTransaction = (today - lastTransactionDate) / (1000 * 60 * 60 * 24) >= 7;
          break;
        case 'monthly':
          addTransaction = today.getMonth() !== lastTransactionDate.getMonth();
          break;
        case 'yearly':
          addTransaction = today.getFullYear() !== lastTransactionDate.getFullYear();
          break;
        default:
          break;
      }

      if (addTransaction) {
        const newTransaction = new Transaction({
          ...transaction.toObject(),
          date: today,
          _id: undefined,
          isRecurring: false, // Avoid infinitely recurring transactions
        });
        await newTransaction.save();
      }
    }
    console.log('Recurring transactions processed successfully.');
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  exportTransactionsAsCSV, // Updated export function
  handleRecurringTransactions, // Added for handling recurring transactions
};
