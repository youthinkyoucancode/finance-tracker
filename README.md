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
1. Clone the repository:
   ```bash
   git clone https://github.com/youthinkyoucancode/finance-tracker.git
   cd finance-tracker
   ```

### Install Dependencies
To install the required dependencies, use the following command:
```bash
npm install
```

### Set up the Environment Variables
1. Create a `.env` file in the root directory.
2. Add the following variables:
```plaintext
MONGO_URI=<your MongoDB connection string>
PORT=5000
```

### Start the Application
Run the following command to start the application:
```bash
npm start
```

### Access the Application
Once the application is running, open your browser and visit:
```plaintext
http://localhost:3000
```

## Usage Instructions

### Adding a Transaction
1. Go to the "Add Transaction" section.
2. Enter details such as Title, Category, Amount, and Date.
3. Click "Submit" to save the transaction.

### Viewing Financial Reports
1. Navigate to the "Reports" section.
2. Explore interactive charts showing your income, expenses, and spending trends.

### Exporting Transactions
1. Go to the "Transactions" section.
2. Click "Export to CSV" to download your transaction history in a CSV file.

## Limitations

- This application is designed for **desktop browsers only**.
- Mobile responsiveness is not implemented.
