const express = require('express');
const { addGoal, getGoals, updateGoal, deleteGoal } = require('../controllers/goalController');

const router = express.Router();

// GET all goals
router.get('/', getGoals);

// POST a new goal
router.post('/', addGoal);

// PUT endpoint for updating a goal
router.put('/:id', updateGoal);

// DELETE endpoint for deleting a goal
router.delete('/:id', deleteGoal);

module.exports = router;
