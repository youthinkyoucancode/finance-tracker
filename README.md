# Personal Finance Tracker

## Project Description

The Personal Finance Tracker is a web application designed to help users manage their finances efficiently by tracking income, expenses, budgets, and goals. It features an intuitive interface, insightful visual reports, and functionality for recurring transactions. This application is optimized for use on desktop browsers.

## Features

- Add, edit, and delete income or expense transactions.
- Set budgets for specific categories and track progress.
- Create and monitor financial goals.
- Export transaction history as a CSV file.
- View spending trends through interactive charts and graphs.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Charts**: Chart.js
- **HTTP Client**: Axios

## Installation Instructions

### Prerequisites
- Node.js (v14 or above)
- MongoDB (v4.4 or above)
- npm (Node Package Manager)

### Steps to Install and Run
#### 1. Clone the repository:
   ```bash
   git clone https://github.com/youthinkyoucancode/finance-tracker.git
   cd finance-tracker
   ```

#### 2. Set Up the Backend
1. Navigate to the `finance-tracker-backend` folder:
   ```bash
   cd finance-tracker-backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `personal-finance-backend` folder with the following content (or replace if existing):
   ```plaintext
   MONGO_URI=<your MongoDB connection string>
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

#### 3. Set Up the Frontend
1. Navigate back to the `finance-tracker` folder:
   ```bash
   cd finance-tracker
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
5. Create a `.env` file in the `finance-tracker` folder with the following content (if not existing):
   ```plaintext
   REACT_APP_API_URL=http://localhost:5000
   ```
7. Add the following `proxy` entry to the `package.json` file in the `finance-tracker` folder (if not existing):
   ```json
   "proxy": "http://localhost:5000"
   ```
9. Start the frontend development server:
   ```bash
   npm start
   ```

#### 4. Access the Application:
Once both the backend and frontend servers are running:
- Open your browser and navigate to:
  ```plaintext
  http://localhost:3000
  ```

## Usage Instructions

### Adding a Transaction
1. Go to the "Add a New Transaction" section.
2. Enter details such as Title, Category, Amount, and Date.
3. Click "Add Transaction" to save the transaction.

### Viewing Financial Reports
1. Navigate to the "Reports" section.
2. Explore interactive charts showing your income, expenses, and spending trends.

### Exporting Transactions
1. Go to the "Transactions" section.
2. Click "Export Transactions to CSV" to download your transaction history in a CSV file.

## Limitations

- This application is designed for **desktop browsers only**.
- Mobile responsiveness is not implemented.
