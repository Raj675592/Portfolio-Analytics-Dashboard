import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, CandlestickChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import './StockChart.css';

const StockChart = ({ ticker, data, info }) => {
  const [chartType, setChartType] = useState('area'); // 'area', 'line', 'candlestick'
  const [timeRange, setTimeRange] = useState('all'); // '1M', '3M', '1Y', '5Y', 'all'

  const filterDataByRange = (data) => {
    if (timeRange === 'all' || !data) return data;

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '1M':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3M':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '1Y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case '5Y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = filterDataByRange(data);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formatDate(data.date)}</p>
          <div className="tooltip-data">
            {chartType === 'area' || chartType === 'line' ? (
              <>
                <p><span>Close:</span> {formatCurrency(data.close)}</p>
                <p><span>Volume:</span> {(data.volume / 1000000).toFixed(2)}M</p>
              </>
            ) : (
              <>
                <p><span>Open:</span> {formatCurrency(data.open)}</p>
                <p><span>High:</span> {formatCurrency(data.high)}</p>
                <p><span>Low:</span> {formatCurrency(data.low)}</p>
                <p><span>Close:</span> {formatCurrency(data.close)}</p>
                <p><span>Volume:</span> {(data.volume / 1000000).toFixed(2)}M</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate price change
  const firstPrice = filteredData?.[0]?.close || 0;
  const lastPrice = filteredData?.[filteredData.length - 1]?.close || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);

  return (
    <motion.div 
      className="stock-chart-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-header">
        <div className="chart-info">
          <h3 className="chart-ticker">{ticker}</h3>
          <p className="chart-name">{info?.name || ticker}</p>
          <div className="chart-stats">
            <span className="current-price">{formatCurrency(lastPrice)}</span>
            <span className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
              {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)} ({priceChange >= 0 ? '+' : ''}{priceChangePercent}%)
            </span>
          </div>
        </div>
        
        <div className="chart-controls">
          <div className="time-range-selector">
            {['1M', '3M', '1Y', '5Y', 'ALL'].map((range) => (
              <motion.button
                key={range}
                className={`range-btn ${timeRange === range.toLowerCase() ? 'active' : ''}`}
                onClick={() => setTimeRange(range.toLowerCase())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {range}
              </motion.button>
            ))}
          </div>
          
          <div className="chart-type-selector">
            {[
              { type: 'area', icon: '▲' },
              { type: 'line', icon: '⟍' },
              { type: 'candlestick', icon: '▌' }
            ].map(({ type, icon }) => (
              <motion.button
                key={type}
                className={`type-btn ${chartType === type ? 'active' : ''}`}
                onClick={() => setChartType(type)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
              >
                {icon}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'area' ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorPrice-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#00ff88" 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#colorPrice-${ticker})`}
                animationDuration={1000}
              />
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="price"
                tickFormatter={formatCurrency}
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="close" 
                stroke="#00ff88" 
                strokeWidth={2}
                dot={false}
                name="Close Price"
                animationDuration={1000}
              />
              <Line 
                yAxisId="volume"
                type="monotone" 
                dataKey="volume" 
                stroke="#00d4ff" 
                strokeWidth={1}
                dot={false}
                name="Volume"
                opacity={0.3}
                animationDuration={1000}
              />
            </LineChart>
          ) : (
            <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                stroke="#8b949e"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#00ff88" 
                strokeWidth={1}
                dot={false}
                name="High"
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#ff4757" 
                strokeWidth={1}
                dot={false}
                name="Low"
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#00d4ff" 
                strokeWidth={2}
                dot={false}
                name="Close"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {info && (
        <div className="chart-meta">
          <div className="meta-item">
            <span className="meta-label">SECTOR:</span>
            <span className="meta-value">{info.sector}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">INDUSTRY:</span>
            <span className="meta-value">{info.industry}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StockChart;
