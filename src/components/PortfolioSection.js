import React, { useState } from 'react';

const PortfolioSection = ({ portfolio, onAddStock, onRemoveStock }) => {
  const [newStock, setNewStock] = useState({ symbol: '', name: '', quantity: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newStock.symbol && newStock.name) {
      onAddStock(newStock);
      setNewStock({ symbol: '', name: '', quantity: 0 });
    }
  };

  return (
    <div className="portfolio-section">
      <h2>📊 Your Portfolio</h2>
      
      <form onSubmit={handleSubmit} className="add-stock-form">
        <input
          type="text"
          placeholder="Stock Symbol (e.g., INFY)"
          value={newStock.symbol}
          onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
        />
        <input
          type="text"
          placeholder="Company Name"
          value={newStock.name}
          onChange={(e) => setNewStock({...newStock, name: e.target.value})}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newStock.quantity}
          onChange={(e) => setNewStock({...newStock, quantity: parseInt(e.target.value) || 0})}
        />
        <button type="submit">Add Stock</button>
      </form>

      <div className="portfolio-list">
        {portfolio.map(stock => (
          <div key={stock.id} className="portfolio-item">
            <div>
              <strong>{stock.symbol}</strong> - {stock.name}
              <span className="quantity">Qty: {stock.quantity}</span>
            </div>
            <button 
              onClick={() => onRemoveStock(stock.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSection;