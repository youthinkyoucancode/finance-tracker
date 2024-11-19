const Goal = require('../models/Goal'); // Ensure you import your Goal model

// Get all goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

// Add a new goal
const addGoal = async (req, res) => {
  console.log('Incoming goal data:', req.body); // Debugging line
  const { title, amount, targetDate } = req.body;
  try {
    const newGoal = new Goal({ title, amount, targetDate });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error saving goal:', error); // Debugging line
    res.status(500).json({ error: 'Failed to add goal' });
  }
};


// Update a goal
const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, amount, targetDate } = req.body;

  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      id,
      { title, amount, targetDate },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGoal = await Goal.findByIdAndDelete(id);

    if (!deletedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully', deletedGoal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

module.exports = {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
};
