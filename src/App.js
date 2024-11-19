import React, { useState, useMemo, useEffect } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import axios from 'axios';
import './App.css';

// Register Chart.js components for visualizations
ChartJS.register(ArcElement, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

// Custom plugin for displaying the total in the center of the Doughnut chart
const doughnutCenterTextPlugin = {
  id: 'doughnutCenterText',
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    const total = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);

    ctx.save();
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#4b3061';
    ctx.fillText(`€${total}`, width / 2, height / 2);
    ctx.restore();
  },
};

function App() {
  // State hooks for managing transactions, budgets, goals, and form input data
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState('income');
  const [editTransaction, setEditTransaction] = useState(null);
 
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');

  const [editingBudget, setEditingBudget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  const [showBudgetsTable, setShowBudgetsTable] = useState(false);
  const [showGoalsTable, setShowGoalsTable] = useState(false);

  // Available categories for transactions and budgets
  const categories = ['Food', 'Utilities', 'Salaries', 'Rent', 'Entertainment', 'Healthcare', 'Other'];

  // Fetch initial data for transactions, budgets, and goals from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionsResponse = await axios.get('/api/transactions');
        setTransactions(transactionsResponse.data);

        const budgetsResponse = await axios.get('/api/budgets');
        setBudgets(budgetsResponse.data);

        const goalsResponse = await axios.get('/api/goals');
        setGoals(goalsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);
  

  // Set the default base URL for Axios
  axios.defaults.baseURL = 'http://localhost:5000';

   /**
   * Handles adding or updating a transaction.
   */
  const handleAddTransaction = async (event) => {
    event.preventDefault();
    const form = event.target;

    const newTransaction = {
      type: transactionType,
      title: form.elements['title'].value,
      category: form.elements['category'].value,
      amount: parseFloat(form.elements['amount'].value),
      date: form.elements['date'].value,
      isRecurring,
      frequency: isRecurring ? frequency : null,
    };

    try {
      if (editTransaction) {
        // Update transaction
        await axios.put(`/api/transactions/${editTransaction._id}`, newTransaction);
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction._id === editTransaction._id ? { ...transaction, ...newTransaction } : transaction
          )
        );
        setEditTransaction(null);
      } else {
        // Add new transaction
        const response = await axios.post('/api/transactions', newTransaction);
        setTransactions((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error adding/updating transaction:', error);
    }
    form.reset();
  };

  /**
   * Handles editing a transaction by setting the state with the current transaction details.
   */
  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setTransactionType(transaction.type);
    setIsRecurring(transaction.isRecurring || false);
    setFrequency(transaction.frequency || 'monthly');
  };

  /**
   * Handles deleting a transaction by ID.
   */
  const handleDeleteTransaction = async (transactionId) => {
    try {
      await axios.delete(`/api/transactions/${transactionId}`);
      setTransactions((prev) => prev.filter((transaction) => transaction._id !== transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

   /**
   * Exports transaction data as a CSV file.
   */
  const handleExportCSV = async () => {
    try {
      const response = await axios.get('/api/transactions/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  /**
   * Calculates the progress for each budget (spent vs. remaining).
   */
  const calculateBudgetProgress = () => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter((transaction) => transaction.category === budget.category && transaction.type === 'expense')
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      return { ...budget, spent };
    });
  };

  /**
   * Calculates the progress for each goal (saved vs. target).
   */
  const calculateGoalProgress = () => {
    return goals.map((goal) => {
      const saved = transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      return { ...goal, saved };
    });
  };

   /**
   * Handles editing a budget by setting the current budget data in the form.
   */
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
  };

   /**
   * Handles deleting a budget by ID.
   */
  const handleDeleteBudget = async (id) => {
    try {
      await axios.delete(`/api/budgets/${id}`);
      setBudgets((prev) => prev.filter((budget) => budget._id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

   /**
   * Handles adding or updating a budget.
   */
  const handleSaveBudget = async (event) => {
    event.preventDefault();
    const form = event.target;
    const updatedBudget = {
      category: form.elements['budgetCategory'].value,
      amount: parseFloat(form.elements['budgetAmount'].value),
    };
    try {
      if (editingBudget) {
        // Update existing budget
        await axios.put(`/api/budgets/${editingBudget._id}`, updatedBudget);
        setBudgets((prev) =>
          prev.map((budget) =>
            budget._id === editingBudget._id ? { ...budget, ...updatedBudget } : budget
          )
        );
        setEditingBudget(null);
      } else {
        // Add new budget
        const response = await axios.post('/api/budgets', updatedBudget);
        setBudgets((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
    form.reset();
  };

  /**
   * Handles editing a goal by populating the form with its current details.
   */
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalAmount(goal.amount);
    setGoalTargetDate(goal.targetDate);
  };

  /**
   * Handles deleting a goal by ID.
   */
  const handleDeleteGoal = async (goalId) => {
    try {
      await axios.delete(`/api/goals/${goalId}`);
      setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  /**
   * Handles adding or updating a goal.
   */
  const handleSaveGoal = async (event) => {
    event.preventDefault();
    const form = event.target;
  
    // Get the date input value
    const targetDate = form.elements['goalTargetDate'].value; // Retrieve date in yyyy-MM-dd format
  
    const updatedGoal = {
      title: form.elements['goalTitle'].value,
      amount: parseFloat(form.elements['goalAmount'].value),
      targetDate: new Date(targetDate).toISOString(), // Format to ISO string for backend
    };
  
    try {
      if (editingGoal) {
        // Update goal
        await axios.put(`/api/goals/${editingGoal._id}`, updatedGoal);
        setGoals((prev) =>
          prev.map((goal) =>
            goal._id === editingGoal._id ? { ...goal, ...updatedGoal } : goal
          )
        );
        setEditingGoal(null);
      } else {
        // Add new goal
        const response = await axios.post('/api/goals', updatedGoal);
        setGoals((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
    form.reset();
  };
  
  /**
   * Memoized data for the budget overview bar chart.
   */
  const budgetData = useMemo(() => {
    const progress = calculateBudgetProgress();
    return {
      labels: progress.map((b) => b.category),
      datasets: [
        {
          label: 'Spent',
          data: progress.map((b) => b.spent),
          backgroundColor: '#FF4500',
        },
        {
          label: 'Remaining',
          data: progress.map((b) => Math.max(0, b.amount - b.spent)),
          backgroundColor: '#32CD32',
        },
      ],
    };
  }, [budgets, transactions]);

   /**
   * Memoized data for the goals progress line chart.
   */
  const goalLineData = useMemo(() => {
    const progress = calculateGoalProgress();
    return {
      labels: goals.map((goal) => goal.title),
      datasets: [
        {
          label: 'Target',
          data: goals.map((goal) => goal.amount),
          borderColor: '#FF4500',
          borderWidth: 2,
          pointStyle: 'rect',
        },
        {
          label: 'Saved',
          data: progress.map((goal) => goal.saved),
          borderColor: '#32CD32',
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  }, [goals, transactions]);

   /**
   * Memoized data for the expense category doughnut chart.
   */
  const categoryData = useMemo(() => {
    const categoryExpenses = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      }
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryExpenses),
      datasets: [
        {
          data: Object.values(categoryExpenses),
          backgroundColor: ['#FFA500', '#FF69B4', '#9370DB', '#48D1CC', '#FFD700'],
          borderWidth: 2,
          cutout: '85%',
        },
      ],
    };
  }, [transactions]);

  /**
   * Memoized data for the income vs. expense trend line chart.
   */
  const incomeExpenseTrendData = useMemo(() => {
    const monthlyIncome = [];
    const monthlyExpenses = [];
    const months = [
      ...new Set(
        transactions.map((transaction) =>
          new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' })
        )
      ),
    ];
    months.forEach((month) => {
      const monthlyIncomeTotal = transactions
        .filter(
          (transaction) =>
            transaction.type === 'income' &&
            new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' }) === month
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      const monthlyExpenseTotal = transactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' }) === month
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      monthlyIncome.push(monthlyIncomeTotal);
      monthlyExpenses.push(monthlyExpenseTotal);
    });
    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: monthlyIncome,
          borderColor: '#48D1CC',
          backgroundColor: 'rgba(72, 209, 204, 0.2)',
          fill: true,
        },
        {
          label: 'Expenses',
          data: monthlyExpenses,
          borderColor: '#FF4500',
          backgroundColor: 'rgba(255, 69, 0, 0.2)',
          fill: true,
        },
      ],
    };
  }, [transactions]);

  /**
   * Renders the application UI.
   */
  return (
    <div className="App">
      <header className="header">
        <h1>
          <i className="fas fa-wallet"></i> Personal Finance Tracker
        </h1>
        <p className="header-description">Track your monthly expenses and income easily.</p>
      </header>

      {/* Transactions Section */}
      <section className="transaction-entry">
        <h2>{editTransaction ? 'Edit Transaction' : 'Add a New Transaction'}</h2>
        <form onSubmit={handleAddTransaction} className="transaction-form">
          <div className="transaction-type">
            <label>
              <input
                type="radio"
                name="type"
                value="income"
                checked={transactionType === 'income'}
                onChange={() => setTransactionType('income')}
              />
              <span>
                <i className="fas fa-arrow-up"></i> Income
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={transactionType === 'expense'}
                onChange={() => setTransactionType('expense')}
              />
              <span>
                <i className="fas fa-arrow-down"></i> Expense
              </span>
            </label>
          </div>
          <label>
            <i className="fas fa-pen"></i> Title:
            <input type="text" name="title" defaultValue={editTransaction?.title || ''} required />
          </label>
          <label>
            <i className="fas fa-list"></i> Category:
            <select name="category" defaultValue={editTransaction?.category || ''} required>
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <i className="fas fa-dollar-sign"></i> Amount:
            <input type="number" name="amount" defaultValue={editTransaction?.amount || ''} required />
          </label>
          <label>
            <i className="fas fa-calendar-alt"></i> Date:
            <input
              type="date"
              name="date"
              defaultValue={editTransaction?.date ? editTransaction.date.slice(0, 10) : ''}
              required
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            Recurring Transaction
          </label>
          {isRecurring && (
            <label>
              Frequency:
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} required>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
          )}
          <button type="submit" className="add-button">
            {editTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
        <button onClick={handleExportCSV} className="export-button">
          Export Transactions to CSV
        </button>
      </section>

      {/* Transactions Table */}
      <section className="transaction-table">
        <h2>Transactions</h2>
        {transactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.category}</td>
                  <td>€{transaction.amount.toFixed(2)}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="actions-column">
                    <i
                      className="fas fa-edit action-icon edit-icon"
                      title="Edit"
                      onClick={() => handleEditTransaction(transaction)}
                    ></i>
                    <i
                      className="fas fa-trash action-icon delete-icon"
                      title="Delete"
                      onClick={() => handleDeleteTransaction(transaction._id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions found</p>
        )}
      </section>

      {/* Budgets Section */}
      <section className="budget-entry">
        <h2>Manage Budgets</h2>
        <form onSubmit={handleSaveBudget}>
          <label>
            <i className="fas fa-list"></i> Category:
            <select name="budgetCategory" defaultValue={editingBudget?.category || ''} required>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <i className="fas fa-dollar-sign"></i> Amount:
            <input
              type="number"
              name="budgetAmount"
              defaultValue={editingBudget?.amount || ''}
              required
            />
          </label>
          <button type="submit" className="add-button">
            {editingBudget ? 'Update Budget' : 'Add Budget'}
          </button>
        </form>
        <button
          className="toggle-button"
          onClick={() => setShowBudgetsTable(!showBudgetsTable)}
        >
          {showBudgetsTable ? 'Hide Budgets' : 'Show Budgets'}
        </button>
        {showBudgetsTable && (
          <div className="table-container">
            <h2>Budgets</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget._id}>
                    <td>{budget.category}</td>
                    <td>€{budget.amount.toFixed(2)}</td>
                    <td>€{calculateBudgetProgress().find(b => b.category === budget.category)?.spent || 0}</td>
                    <td className="actions-column">
                      <i
                        className="fas fa-edit action-icon edit-icon"
                        title="Edit"
                        onClick={() => handleEditBudget(budget)}
                      ></i>
                      <i
                        className="fas fa-trash action-icon delete-icon"
                        title="Delete"
                        onClick={() => handleDeleteBudget(budget._id)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Goals Section */}
      <section className="goals-section">
        <h2>Manage Goals</h2>
        <form onSubmit={handleSaveGoal}>
          <label>
            <i className="fas fa-bullseye"></i> Title:
            <input
              type="text"
              name="goalTitle"
              defaultValue={editingGoal?.title || ''}
              required
            />
          </label>
          <label>
            <i className="fas fa-dollar-sign"></i> Amount:
            <input
              type="number"
              name="goalAmount"
              defaultValue={
                editingGoal?.targetDate
                  ? new Date(editingGoal.targetDate).toISOString().split('T')[0] // yyyy-MM-dd format
                  : ''
              }
              required
            />
          </label>
          <label>
            <i className="fas fa-calendar-alt"></i> Target Date:
            <input
              type="date"
              name="goalTargetDate"
              defaultValue={editingGoal?.targetDate || ''}
              required
            />
          </label>
          <button type="submit" className="add-button">
            {editingGoal ? 'Update Goal' : 'Add Goal'}
          </button>
        </form>
        <button
          className="toggle-button"
          onClick={() => setShowGoalsTable(!showGoalsTable)}
        >
          {showGoalsTable ? 'Hide Goals' : 'Show Goals'}
        </button>
        {showGoalsTable && (
          <div className="table-container">
            <h2>Goals</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Target Amount</th>
                  <th>Saved</th>
                  <th>Target Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal) => (
                  <tr key={goal._id}>
                    <td>{goal.title}</td>
                    <td>€{goal.amount.toFixed(2)}</td>
                    <td>€{calculateGoalProgress().find(g => g.title === goal.title)?.saved || 0}</td>
                    <td>{new Date(goal.targetDate).toLocaleDateString()}</td>
                    <td className="actions-column">
                      <i
                        className="fas fa-edit action-icon edit-icon"
                        title="Edit"
                        onClick={() => handleEditGoal(goal)}
                      ></i>
                      <i
                        className="fas fa-trash action-icon delete-icon"
                        title="Delete"
                        onClick={() => handleDeleteGoal(goal._id)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Visualizations */}
      <section className="charts-container">
        {/* Stacked Bar Chart for Budgets */}
        <div className="budget-overview">
          <h2>Budgets Overview</h2>
          <Bar
            data={budgetData}
            options={{
              plugins: { legend: { display: true, position: 'bottom' } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        {/* Line Chart for Goals Progress */}
        <div className="goal-progress">
          <h2>Goals Progress</h2>
          <Line
            data={goalLineData}
            options={{
              plugins: { legend: { display: true, position: 'bottom' } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </section>

      {/* Combined Chart Section */}
      <section className="charts-container">
        <div className="category-spend">
          <h2>Spend by Category</h2>
          <Doughnut
            data={categoryData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    boxWidth: 8,
                    font: {
                      size: 9,
                    },
                  },
                },
              },
            }}
            plugins={[doughnutCenterTextPlugin]}
          />
        </div>
        <div className="income-expense-trend">
          <h2>Income vs. Expenses Trend</h2>
          <Line
            data={incomeExpenseTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Personal Finance Tracker</p>
      </footer>
    </div>
  );
}

export default App;
