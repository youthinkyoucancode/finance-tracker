# Test Cases for Personal Finance Tracker

## Test Case 1: Add a New Transaction
- **Action:** Click the "Add Transaction" button. Fill in the required fields (e.g., Title: "Groceries," Amount: "200," Category: "Food").
- **Expected Result:** The transaction is displayed in the Transactions table with correct details.

## Test Case 2: Delete a Transaction
- **Action:** Select a transaction from the list and click the "Delete" button which is displayed as small bin icon.
- **Expected Result:** The selected transaction is removed from the list and database.

## Test Case 3: Edit a Transaction
- **Action:** Click the "Edit" button on a transaction. Update the details (e.g., change Amount to "300"). Click "Update Transaction"
- **Expected Result:** The transaction is updated and displayed with the new details.

## Test Case 4: Set and View Budgets
- **Action:** Navigate to the "Budgets" section. Add a new budget (e.g., Category: "Food," Amount: "500"). Save the budget.
- **Expected Result:** The budget is displayed in the list and reflected in the bar chart.

## Test Case 5: Export Transactions to CSV
- **Action:** Click the "Export Transactions to CSV" button.
- **Expected Result:** A CSV file named `transactions.csv` is downloaded containing all transaction details.

## Test Case 6: View Financial Reports
- **Action:** Navigate to the "Reports" section.
- **Expected Result:** Charts and graphs are displayed accurately, reflecting current data.
