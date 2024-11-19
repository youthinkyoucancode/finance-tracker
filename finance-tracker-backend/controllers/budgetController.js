const Budget = require('../models/Budget');

// Add a new budget
const addBudget = async (req, res) => {
  try {
    const newBudget = new Budget(req.body);
    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(500).json({ error: 'Error adding budget' });
  }
};

// Get all budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching budgets' });
  }
};

// Update a budget
const updateBudget = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBudget = await Budget.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(500).json({ error: 'Error updating budget' });
  }
};

// Delete a budget
const deleteBudget = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBudget = await Budget.findByIdAndDelete(id);
    if (!deletedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting budget' });
  }
};

module.exports = {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};
