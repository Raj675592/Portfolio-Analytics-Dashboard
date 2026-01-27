import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import './PerformanceChart.css';

const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatCurrency = (value) => {
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="performance-tooltip">
          <p className="tooltip-date">{new Date(data.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</p>
          <p className="tooltip-value">
            Portfolio Value: <strong>${data.value.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const initialValue = data[0]?.value || 0;
  const currentValue = data[data.length - 1]?.value || 0;
  const totalGain = currentValue - initialValue;
  const totalGainPercent = ((totalGain / initialValue) * 100).toFixed(2);

  return (
    <motion.div 
      className="performance-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="performance-header">
        <div>
          <h3 className="performance-title">Portfolio Performance</h3>
          <p className="performance-subtitle">5-Year Historical Value</p>
        </div>
        <div className="performance-stats">
          <div className="perf-stat">
            <span className="perf-label">Initial Value:</span>
            <span className="perf-value">${initialValue.toLocaleString()}</span>
          </div>
          <div className="perf-stat">
            <span className="perf-label">Current Value:</span>
            <span className="perf-value">${currentValue.toLocaleString()}</span>
          </div>
          <div className="perf-stat">
            <span className="perf-label">Total Gain:</span>
            <span className={`perf-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()} ({totalGain >= 0 ? '+' : ''}{totalGainPercent}%)
            </span>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" strokeOpacity={0.3} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#8b949e"
              tick={{ fontSize: 11 }}
              tickLine={false}
              interval="preserveStartEnd"
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
              dataKey="value" 
              stroke="#00d4ff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPerformance)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="performance-insights">
        <motion.div 
          className="insight-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="insight-icon">📈</span>
          <div>
            <p className="insight-label">Growth Trend</p>
            <p className="insight-value">{totalGain >= 0 ? 'Upward' : 'Downward'}</p>
          </div>
        </motion.div>

        <motion.div 
          className="insight-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="insight-icon">💰</span>
          <div>
            <p className="insight-label">Best Allocation</p>
            <p className="insight-value">Equal Weight</p>
          </div>
        </motion.div>

        <motion.div 
          className="insight-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="insight-icon">⏱</span>
          <div>
            <p className="insight-label">Time Horizon</p>
            <p className="insight-value">5 Years</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
