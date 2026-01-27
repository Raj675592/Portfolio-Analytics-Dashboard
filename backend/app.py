from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
import warnings

# Suppress pandas deprecation warnings from yfinance
warnings.filterwarnings('ignore', category=pd.errors.PerformanceWarning)
warnings.filterwarnings('ignore', message='.*Timestamp.utcnow.*')

app = Flask(__name__)
CORS(app)

# Portfolio tickers - equal weighted
TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'PLTR', 'AMD', 'INTC', 'IBM', 'ORCL', 'CSCO', 'ADBE', 'CRM', 'QCOM', 'TXN', 'AVGO', 'MU', 'LRCX', 'SNPS', 'NOW', 'UBER', 'LYFT', 'TWTR', 'SNAP', 'PINS', 'SPOT', 'NFLX', 'DIS', 'AMZN', 'SHOP', 'SQ', 'PYPL', 'V', 'MA', 'AXP', 'BAC', 'JPM', 'C', 'WFC', 'GS', 'MS', 'BLK', 'TROW', 'SCHW', 'VTI', 'VOO', 'IVV', 'QQQ', 'DIA', 'SPY', 'EEM', 'IWM']
PORTFOLIO_VALUE = 100000  # $100,000 initial investment
print(f"Portfolio initialized with {len(TICKERS)} tickers.")

def calculate_portfolio_metrics(data, tickers):
    """Calculate portfolio analytics for equal-weighted portfolio"""
    latest_prices = {}
    initial_prices = {}
    shares = {}
    
    # Equal weight allocation
    allocation_per_stock = PORTFOLIO_VALUE / len(tickers)
    
    for ticker in tickers:
        if ticker in data and not data[ticker].empty:
            latest_prices[ticker] = data[ticker]['close'].iloc[-1]
            initial_prices[ticker] = data[ticker]['close'].iloc[0]
            shares[ticker] = allocation_per_stock / initial_prices[ticker]
    
    # Calculate current values
    current_values = {ticker: shares[ticker] * latest_prices[ticker] for ticker in shares}
    total_value = sum(current_values.values())
    
    # Calculate returns
    initial_value = sum(shares[ticker] * initial_prices[ticker] for ticker in shares)
    total_return = ((total_value - initial_value) / initial_value) * 100
    
    # Calculate individual stock performance
    stock_returns = {}
    for ticker in tickers:
        if ticker in initial_prices and ticker in latest_prices:
            stock_returns[ticker] = ((latest_prices[ticker] - initial_prices[ticker]) / initial_prices[ticker]) * 100
    
    # Calculate volatility
    returns_data = []
    for ticker in tickers:
        if ticker in data and not data[ticker].empty:
            daily_returns = data[ticker]['close'].pct_change().dropna()
            returns_data.append(daily_returns)
    
    if returns_data:
        portfolio_returns = pd.concat(returns_data, axis=1).mean(axis=1)
        volatility = portfolio_returns.std() * np.sqrt(252) * 100  # Annualized
    else:
        volatility = 0
    
    # Sharpe ratio (assuming 4% risk-free rate)
    risk_free_rate = 4.0
    if volatility > 0:
        sharpe_ratio = (total_return - risk_free_rate) / volatility
    else:
        sharpe_ratio = 0
    
    return {
        'total_value': round(total_value, 2),
        'initial_value': round(initial_value, 2),
        'total_return': round(total_return, 2),
        'volatility': round(volatility, 2),
        'sharpe_ratio': round(sharpe_ratio, 2),
        'stock_returns': {k: round(v, 2) for k, v in stock_returns.items()},
        'asset_allocation': {
            ticker: {
                'value': round(current_values.get(ticker, 0), 2),
                'percentage': round((current_values.get(ticker, 0) / total_value) * 100, 2),
                'shares': round(shares.get(ticker, 0), 4),
                'current_price': round(latest_prices.get(ticker, 0), 2),
                'initial_price': round(initial_prices.get(ticker, 0), 2)
            }
            for ticker in tickers if ticker in current_values
        }
    }

@app.route('/api/portfolio-data', methods=['GET'])
def get_portfolio_data():
    """Fetch 5 years of OHLC data for all tickers"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5*365)
        
        print(f"Fetching data from {start_date} to {end_date}")
        
        data = {}
        for ticker in TICKERS:
            try:
                print(f"Fetching {ticker}...")
                stock = yf.Ticker(ticker)
                hist = stock.history(start=start_date, end=end_date)
                
                if not hist.empty:
                    # Format data for frontend
                    hist_data = []
                    for date, row in hist.iterrows():
                        hist_data.append({
                            'date': date.strftime('%Y-%m-%d'),
                            'open': round(float(row['Open']), 2),
                            'high': round(float(row['High']), 2),
                            'low': round(float(row['Low']), 2),
                            'close': round(float(row['Close']), 2),
                            'volume': int(row['Volume'])
                        })
                    
                    # Try to get stock info, with fallback
                    try:
                        info = stock.info
                        stock_info = {
                            'name': info.get('longName', ticker),
                            'sector': info.get('sector', 'Technology'),
                            'industry': info.get('industry', 'N/A')
                        }
                    except:
                        stock_info = {
                            'name': ticker,
                            'sector': 'Technology',
                            'industry': 'N/A'
                        }
                    
                    data[ticker] = {
                        'history': hist_data,
                        'info': stock_info
                    }
                    print(f"✓ {ticker} fetched: {len(hist_data)} data points")
                else:
                    print(f"✗ {ticker} returned empty data")
            except Exception as e:
                print(f"✗ Error fetching {ticker}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data could be fetched from Yahoo Finance. Please check your internet connection.'
            }), 500
        
        # Calculate portfolio metrics
        hist_data_dict = {}
        for ticker in TICKERS:
            if ticker in data:
                df = pd.DataFrame(data[ticker]['history'])
                df['date'] = pd.to_datetime(df['date'])
                df.set_index('date', inplace=True)
                hist_data_dict[ticker] = df
        
        print("Calculating portfolio metrics...")
        metrics = calculate_portfolio_metrics(hist_data_dict, list(data.keys()))
        
        print(f"✓ Successfully returning data for {len(data)} stocks")
        
        return jsonify({
            'success': True,
            'data': data,
            'metrics': metrics,
            'tickers': list(data.keys()),
            'portfolio_value': PORTFOLIO_VALUE
        })
    
    except Exception as e:
        print(f"✗ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/portfolio-performance', methods=['GET'])
def get_portfolio_performance():
    """Calculate historical portfolio performance"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5*365)
        
        print('Fetching portfolio performance data...')
        
        # Fetch data for all tickers
        all_data = {}
        for ticker in TICKERS:
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(start=start_date, end=end_date)
                if not hist.empty:
                    all_data[ticker] = hist['Close']
                    print(f"✓ {ticker} performance data fetched")
            except Exception as e:
                print(f"✗ Error fetching {ticker} performance: {str(e)}")
        
        if not all_data:
            return jsonify({'success': False, 'error': 'No data available'}), 404
        
        # Create DataFrame with all stocks
        df = pd.DataFrame(all_data)
        
        # Equal weight allocation
        allocation = 1 / len(TICKERS)
        
        # Get initial prices
        initial_prices = {}
        for ticker in TICKERS:
            if ticker in df.columns:
                # Find first valid price
                first_valid = df[ticker].first_valid_index()
                if first_valid is not None:
                    initial_prices[ticker] = df.loc[first_valid, ticker]
        
        # Calculate portfolio value over time
        portfolio_values = []
        for date, row in df.iterrows():
            daily_value = 0
            valid_tickers = 0
            
            for ticker in TICKERS:
                if ticker in row and not pd.isna(row[ticker]) and ticker in initial_prices:
                    shares = (PORTFOLIO_VALUE * allocation) / initial_prices[ticker]
                    daily_value += shares * row[ticker]
                    valid_tickers += 1
            
            if valid_tickers > 0:
                portfolio_values.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'value': round(daily_value, 2)
                })
        
        print(f"✓ Portfolio performance calculated: {len(portfolio_values)} data points")
        
        return jsonify({
            'success': True,
            'performance': portfolio_values
        })
    
    except Exception as e:
        print(f"✗ Error in portfolio-performance: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')