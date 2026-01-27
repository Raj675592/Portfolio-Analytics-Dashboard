import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./App.css";
import StockChart from "./components/StockChart";
import PortfolioMetrics from "./components/PortfolioMetrics";
import AssetAllocation from "./components/AssetAllocation";
import PerformanceChart from "./components/PerformanceChart";
import StockCard from "./components/StockCard";

const API_BASE_URL = "http://localhost:5000/api";

function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
    fetchPerformanceData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/portfolio-data`);
      if (response.data.success) {
        setPortfolioData(response.data);
        // Set first stock as selected by default
        if (response.data.tickers && response.data.tickers.length > 0) {
          setSelectedStock(response.data.tickers[0]);
        }
      } else {
        setError(response.data.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/portfolio-performance`);
      if (response.data.success) {
        setPerformanceData(response.data.performance);
      }
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
    }
  };

  if (loading) {
    return (
      <div className="app loading-state">
        <motion.div
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            FETCHING MARKET DATA...
          </motion.p>
          <motion.div
            className="loading-bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error-state">
        <motion.div
          className="error-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="error-icon">⚠</div>
          <h2>DATA RETRIEVAL FAILED</h2>
          <p className="error-message">{error}</p>
          <motion.button
            className="retry-button"
            onClick={fetchPortfolioData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            RETRY CONNECTION
          </motion.button>
          <p className="error-hint">Ensure backend is running on port 5000</p>
        </motion.div>
      </div>
    );
  }

  if (!portfolioData || !portfolioData.data) {
    return (
      <div className="app empty-state">
        <motion.div
          className="empty-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>NO DATA AVAILABLE</h2>
          <p>Unable to retrieve market information</p>
        </motion.div>
      </div>
    );
  }

  const { data, metrics, tickers } = portfolioData;

  return (
    <div className="app">
      {/* Header */}
      <motion.header
        className="app-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="header-content">
          <div className="logo-section">
            <motion.div
              className="logo-icon"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0, 255, 136, 0.3)",
                  "0 0 40px rgba(0, 255, 136, 0.6)",
                  "0 0 20px rgba(0, 255, 136, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ◈
            </motion.div>
            <div>
              <h1>MARKET TERMINAL</h1>
              <p className="tagline">Real-Time Portfolio Analytics</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">PORTFOLIO</span>
              <span className="stat-value">
                ${metrics.total_value.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">RETURN</span>
              <span
                className={`stat-value ${metrics.total_return >= 0 ? "positive" : "negative"}`}
              >
                {metrics.total_return >= 0 ? "+" : ""}
                {metrics.total_return}%
              </span>
            </div>
          </div>
        </div>
        <motion.div
          className="header-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </motion.header>

      {/* Main Content */}
      <main className="app-main">
        {/* Portfolio Metrics Section */}
        <motion.section
          className="metrics-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PortfolioMetrics metrics={metrics} />
        </motion.section>

        {/* Stock Cards Grid */}
        <motion.section
          className="stocks-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="section-title">PORTFOLIO HOLDINGS</h2>
          <div className="stocks-grid">
            {tickers.map((ticker, index) => (
              <motion.div
                key={ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <StockCard
                  ticker={ticker}
                  data={data[ticker]}
                  allocation={metrics.asset_allocation[ticker]}
                  isSelected={selectedStock === ticker}
                  onClick={() => setSelectedStock(ticker)}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Charts Section */}
        <div className="charts-container">
          {/* Selected Stock Chart */}
          <motion.section
            className="chart-section main-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <AnimatePresence mode="wait">
              {selectedStock && data[selectedStock] && (
                <StockChart
                  ticker={selectedStock}
                  data={data[selectedStock].history}
                  info={data[selectedStock].info}
                />
              )}
            </AnimatePresence>
          </motion.section>

          {/* Asset Allocation */}
          <motion.section
            className="chart-section allocation-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <AssetAllocation
              allocation={metrics.asset_allocation}
              tickers={tickers}
            />
          </motion.section>
        </div>

        {/* Portfolio Performance Chart */}
        {performanceData && (
          <motion.section
            className="chart-section performance-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <PerformanceChart data={performanceData} />
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        className="app-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="footer-content">
          <p>Data Source: Yahoo Finance • 5-Year Historical Analysis</p>
          <p className="disclaimer">
            Equal-weighted portfolio allocation • Past performance does not
            guarantee future results
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
