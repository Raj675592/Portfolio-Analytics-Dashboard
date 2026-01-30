# Portfolio Analytics Dashboard

A full-stack web application for visualizing and analyzing investment portfolios. This project provides interactive charts, metrics, and analytics to help users understand their portfolio performance, asset allocation, and individual stock data.

## Features

- **Portfolio Overview**: Visualize overall portfolio performance and key metrics.
- **Asset Allocation**: Pie charts and breakdowns of asset classes.
- **Performance Charts**: Interactive line/bar charts for historical performance.
- **Stock Analytics**: Individual stock cards and charts for detailed analysis.
- **Responsive UI**: Modern, mobile-friendly frontend built with React.
- **Backend API**: Python (Flask) backend serving portfolio and stock data.

## Tech Stack

- **Frontend**: React, CSS
- **Backend**: Python (Flask)
- **Build Tools**: Node.js, npm
- **Deployment**: Procfile for Heroku or similar PaaS

## Project Structure

```
Project_Features_and_TechStack.md
backend/
  app.py
  package.json
  Procfile
  requirements.txt
frontend/
  package.json
  README.md
  build/
    ...
  public/
    ...
  src/
    App.js
    components/
      AssetAllocation.js
      PerformanceChart.js
      PortfolioMetrics.js
      StockCard.js
      StockChart.js
```

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm
- Python 3.7+
- pip

### Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Raj675592/Portfolio-Analytics-Dashboard.git
cd Portfolio-Analytics-Dashboard
```

#### 2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

#### 4. Run the backend server
```bash
cd ../backend
python app.py
```

#### 5. Run the frontend development server
```bash
cd ../frontend
npm start
```

The frontend will typically run on [http://localhost:3000](http://localhost:3000) and the backend on [http://localhost:5000](http://localhost:5000).

## Deployment

- The project includes a `Procfile` for deployment on Heroku or similar platforms.
- Build the frontend for production:
  ```bash
  npm run build
  ```
- Ensure the backend serves the static files from the frontend build directory if deploying as a single app.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or improvements.

## License

This project is licensed under the MIT License.
