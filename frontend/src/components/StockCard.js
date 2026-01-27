import React from 'react';
import { motion } from 'framer-motion';
import './StockCard.css';

const StockCard = ({ ticker, data, allocation, isSelected, onClick }) => {
  if (!data || !allocation) return null;

  const currentPrice = allocation.current_price;
  const initialPrice = allocation.initial_price;
  const priceChange = currentPrice - initialPrice;
  const priceChangePercent = ((priceChange / initialPrice) * 100).toFixed(2);

  // Simple sparkline data - last 30 days
  const sparklineData = data.history.slice(-30).map(item => item.close);
  const minPrice = Math.min(...sparklineData);
  const maxPrice = Math.max(...sparklineData);
  
  const normalizeY = (price) => {
    return 100 - ((price - minPrice) / (maxPrice - minPrice)) * 100;
  };

  const sparklinePath = sparklineData
    .map((price, i) => {
      const x = (i / (sparklineData.length - 1)) * 100;
      const y = normalizeY(price);
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <motion.div
      className={`stock-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stock-card-header">
        <div className="stock-ticker-section">
          <h4 className="stock-ticker">{ticker}</h4>
          <p className="stock-name">{data.info?.name || ticker}</p>
        </div>
        {isSelected && (
          <motion.div 
            className="selected-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            ✓
          </motion.div>
        )}
      </div>

      <div className="sparkline-container">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sparkline">
          <defs>
            <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={priceChange >= 0 ? '#00ff88' : '#ff4757'} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={priceChange >= 0 ? '#00ff88' : '#ff4757'} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path
            d={`${sparklinePath} L 100,100 L 0,100 Z`}
            fill={`url(#gradient-${ticker})`}
          />
          <path
            d={sparklinePath}
            stroke={priceChange >= 0 ? '#00ff88' : '#ff4757'}
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      <div className="stock-card-stats">
        <div className="stat-row">
          <span className="stat-label">Current</span>
          <span className="stat-value">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Change</span>
          <span className={`stat-value ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChangePercent}%
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Value</span>
          <span className="stat-value">${allocation.value.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Weight</span>
          <span className="stat-value">{allocation.percentage.toFixed(1)}%</span>
        </div>
      </div>

      <div className="stock-card-footer">
        <div className="sector-tag">{data.info?.sector || 'N/A'}</div>
      </div>

      {isSelected && (
        <motion.div 
          className="selection-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default StockCard;
