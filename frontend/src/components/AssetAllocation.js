import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import './AssetAllocation.css';

const COLORS = ['#00ff88', '#00d4ff', '#ff4757', '#ffa502', '#7bed9f'];

const AssetAllocation = ({ allocation, tickers }) => {
  const chartData = tickers.map((ticker, index) => ({
    name: ticker,
    value: allocation[ticker]?.value || 0,
    percentage: allocation[ticker]?.percentage || 0,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="allocation-tooltip">
          <p className="tooltip-ticker">{data.name}</p>
          <p className="tooltip-value">${data.value.toLocaleString()}</p>
          <p className="tooltip-percentage">{data.percentage.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <motion.div 
      className="asset-allocation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="allocation-title">Asset Allocation</h3>
      
      <div className="allocation-chart" >
        <ResponsiveContainer >
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="allocation-list">
        {tickers.map((ticker, index) => {
          const data = allocation[ticker];
          if (!data) return null;

          return (
            <motion.div
              key={ticker}
              className="allocation-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="allocation-header">
                <div className="ticker-info">
                  <div 
                    className="color-indicator" 
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="ticker-name">{ticker}</span>
                </div>
                <span className="allocation-percentage">
                  {data.percentage.toFixed(2)}%
                </span>
              </div>
              
              <div className="allocation-details">
                <div className="detail-row">
                  <span className="detail-label">Value:</span>
                  <span className="detail-value">${data.value.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shares:</span>
                  <span className="detail-value">{data.shares.toFixed(4)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">${data.current_price.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Entry:</span>
                  <span className="detail-value">${data.initial_price.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AssetAllocation;