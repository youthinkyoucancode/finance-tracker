const express = require('express');
const { addBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');

const router = express.Router();

// GET all budgets
router.get('/', getBudgets);

// POST a new budget
router.post('/', addBudget);

// PUT endpoint for updating a budget
router.put('/:id', updateBudget);

// DELETE endpoint for deleting a budget
router.delete('/:id', deleteBudget);

module.exports = router;
