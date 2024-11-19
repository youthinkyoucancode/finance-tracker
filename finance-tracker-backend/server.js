const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const cors = require('cors');
const { Parser } = require('json2csv'); // Import json2csv library for CSV export
const transactionRoutes = require('./routes/transactions'); // Import transactions routes
const budgetRoutes = require('./routes/budgets'); // Import budgets routes
const goalRoutes = require('./routes/goals'); // Import goals routes
const Transaction = require('./models/Transaction'); // Import the Transaction model

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes); // Use the transactions routes
app.use('/api/budgets', budgetRoutes); // Use the budgets routes
app.use('/api/goals', goalRoutes); // Use the goals routes

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err));

// Cron job for recurring transactions
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily recurrence check...');

  const today = new Date();

  try {
    // Find all recurring transactions
    const recurringTransactions = await Transaction.find({ isRecurring: true });

    for (const transaction of recurringTransactions) {
      let addTransaction = false;
      const lastTransactionDate = new Date(transaction.date);

      // Check if the transaction needs to recur based on its frequency
      switch (transaction.frequency) {
        case 'daily':
          addTransaction = (today - lastTransactionDate) / (1000 * 60 * 60 * 24) >= 1;
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
          console.warn(`Unknown frequency: ${transaction.frequency}`);
      }

      if (addTransaction) {
        try {
          // Create a new transaction instance for the recurring transaction
          const newTransaction = new Transaction({
            ...transaction.toObject(),
            date: today, // Set the date to today
            _id: mongoose.Types.ObjectId(), // Generate a new ObjectId for the new transaction
          });
          await newTransaction.save();
          console.log(`Recurring transaction added: ${transaction.title}`);
        } catch (error) {
          console.error(`Error saving recurring transaction: ${transaction.title}`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error handling recurring transactions:', error);
  }
});

// Route to update a transaction
app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { title, type, category, amount, date, isRecurring, frequency } = req.body;

  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { title, type, category, amount, date, isRecurring, frequency },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Route to delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully', deletedTransaction });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Route to export transactions as CSV
app.get('/api/transactions/export', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const fields = ['title', 'type', 'category', 'amount', 'date', 'isRecurring', 'frequency'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
