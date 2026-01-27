import React from 'react';
import { motion } from 'framer-motion';
import './PortfolioMetrics.css';

const PortfolioMetrics = ({ metrics }) => {
  const metricsData = [
    {
      label: 'Total Value',
      value: `$${metrics.total_value.toLocaleString()}`,
      subValue: `Initial: $${metrics.initial_value.toLocaleString()}`,
      icon: '◆',
      color: 'accent'
    },
    {
      label: 'Total Return',
      value: `${metrics.total_return >= 0 ? '+' : ''}${metrics.total_return}%`,
      subValue: `${metrics.total_return >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(metrics.total_value - metrics.initial_value).toLocaleString()}`,
      icon: metrics.total_return >= 0 ? '▲' : '▼',
      color: metrics.total_return >= 0 ? 'positive' : 'negative'
    },
    {
      label: 'Volatility',
      value: `${metrics.volatility}%`,
      subValue: 'Annualized Standard Deviation',
      icon: '〰',
      color: 'neutral'
    },
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpe_ratio.toFixed(2),
      subValue: 'Risk-Adjusted Return',
      icon: '⟡',
      color: metrics.sharpe_ratio > 1 ? 'positive' : 'neutral'
    }
  ];

  return (
    <div className="portfolio-metrics">
      <div className="metrics-grid">
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.label}
            className={`metric-card ${metric.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 30px rgba(0, 255, 136, 0.2)'
            }}
          >
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <p className="metric-label">{metric.label}</p>
              <motion.h3 
                className="metric-value"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                {metric.value}
              </motion.h3>
              <p className="metric-subvalue">{metric.subValue}</p>
            </div>
            <div className="metric-decoration" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="performance-summary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h4>Individual Stock Performance</h4>
        <div className="stocks-performance">
          {Object.entries(metrics.stock_returns).map(([ticker, returns], index) => (
            <motion.div
              key={ticker}
              className="stock-performance-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            >
              <span className="stock-ticker">{ticker}</span>
              <div className="performance-bar-container">
                <motion.div 
                  className={`performance-bar ${returns >= 0 ? 'positive' : 'negative'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(returns), 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.05 }}
                />
              </div>
              <span className={`stock-return ${returns >= 0 ? 'positive' : 'negative'}`}>
                {returns >= 0 ? '+' : ''}{returns}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioMetrics;
