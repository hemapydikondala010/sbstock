
# SB Stocks - Production-Ready Paper Trading Platform

SB Stocks is a full-stack MERN (MongoDB, Express, React, Node.js) paper trading platform. It provides an educational, risk-free environment where users can practice US stock market trading with virtual cash ($100,000) using real-time quotes, news, and historical candlestick graphs.

---

## 🛠 Tech Stack

*   **Frontend**: React (Vite), Redux Toolkit (State Management), Tailwind CSS v4, Recharts (Composed Price/Volume & Allocation Pie Charts), Framer Motion, Lucide React.
*   **Backend**: Node.js, Express.js (REST APIs, security, cookies).
*   **Database**: MongoDB Atlas via Mongoose ODM.
*   **Authentication**: JWT Session Access Tokens & rotated Secure HTTP-Only Refresh Cookies.
*   **Security Features**: Helmet, CORS origin controls, Rate Limiting, Mongoose Schema sanitizations, and Password Hashing (bcryptjs).

---

## 📂 Folder Structure

```
new_sb_stock/
├── backend/
│   ├── config/             # DB connection (MongoDB Atlas)
│   ├── controllers/        # Express route business logic controllers
│   │   ├── authController.js       # Signup, login, refresh, profile, password
│   │   ├── portfolioController.js  # Holdings listings, statistics, 30-day history
│   │   ├── stockController.js      # Quote feeds, profiles, news, search, candles
│   │   ├── tradeController.js      # Virtual BUY/SELL execution and transaction log
│   │   └── watchlistController.js  # Add/remove watchlist tickers
│   ├── middleware/         # JWT protection middleware
│   ├── models/             # Mongoose schemas with indexing & TTL bounds
│   │   ├── User.js                 # User credentials and virtual balances
│   │   ├── Holding.js              # Quantities owned per stock symbol
│   │   ├── Transaction.js          # Chronological trade ledger details
│   │   ├── Watchlist.js            # Followed stock symbols array
│   │   ├── Portfolio.js            # Daily snapshot values for growth graphs
│   │   └── StockCache.js           # API response caches with TTL automatic deletion
│   ├── routes/             # Express routes mappings
│   ├── services/           # Finnhub service client with caching & mock fallback
│   ├── utils/              # Token helpers and stock price wiggler
│   ├── index.js            # Server entry point, security headers, health checks
│   └── .env                # Server environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable layout UI components
│   │   │   ├── Layout.jsx          # Protected layout grid (Navbar + Sidebar)
│   │   │   ├── Navbar.jsx          # Top bar with real-time balance and autocomplete search
│   │   │   ├── Sidebar.jsx         # Navigation bar with market hours indicator
│   │   │   ├── ProtectedRoute.jsx  # Auth guard loading wrapper
│   │   │   └── DashboardSkeleton.jsx # Pulse skeleton templates for loading states
│   │   ├── pages/          # View pages
│   │   │   ├── Login.jsx           # Animated credentials portal with validation
│   │   │   ├── Register.jsx        # Signup with $100,000 initial balance
│   │   │   ├── ForgotPassword.jsx  # Recovery layout
│   │   │   ├── Dashboard.jsx       # Aggregations, Recharts Area performance graph
│   │   │   ├── Market.jsx          # Popular stock tickers, debounced search
│   │   │   ├── StockDetails.jsx    # Dual-axis price/volume composed chart, BUY/SELL form
│   │   │   ├── Portfolio.jsx       # Detailed holdings, Recharts allocation Pie Chart
│   │   │   ├── Watchlist.jsx       # Followed symbols grid with removal actions
│   │   │   ├── Transactions.jsx    # Chronological ledger table with pagination
│   │   │   └── Profile.jsx         # Settings cards, avatar selection grid
│   │   ├── services/       # Axios API client interceptor with auto-refresh
│   │   ├── store/          # Redux Toolkit store slices (auth, portfolio)
│   │   ├── index.css       # Tailwind directives & CSS trading theme variables
│   │   ├── main.jsx        # Mount entry point with Redux Provider
│   │   └── App.jsx         # React Router layout and secure routes
│   ├── package.json
│   └── vite.config.js      # Vite compile configuration and proxy maps
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Backend Setup
Open a terminal and run:
```bash
cd backend
npm install
npm run dev
```
The backend server will run on `http://localhost:5000` and automatically connect to your MongoDB Atlas database.

### 2. Frontend Setup
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. Register an account and enjoy paper trading!

# SB-Stocks

