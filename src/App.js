

import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import NewsSection from './components/NewsSection';
import PortfolioSection from './components/PortfolioSection';
import SentimentAnalysis from './components/SentimentAnalysis';
import './App.css';

function App() {
  
  const [news, setNews] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    setLoading(true);

    const [newsResponse, portfolioResponse] = await Promise.all([
      api.getLiveNews(),           // ✅ Live news from your scraping server
      api.getPortfolio()           // ✅ Portfolio from JSON server
    ]);

    setNews(newsResponse.data);
    setPortfolio(portfolioResponse.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};



 const handleAnalyzeSentiment = async (article) => {
  try {
    console.log("Running sentiment analysis for:", article.title);
    
    const analysis = await api.analyzeSentiment(article.title, article.description);
    console.log("AI Response:", analysis);

    const updatedArticle = { ...article, sentiment: analysis };
    // await api.updateNews(article.id, updatedArticle);
    // console.log("Updated in DB");

    setNews(prev => prev.map(n => n.id === article.id ? updatedArticle : n));
    console.log("Updated in UI");

  } catch (error) {
    console.error("Sentiment error:", error);
  }
};



  const handleAddStock = async (stock) => {
    try {
      const response = await api.addToPortfolio(stock);
      fetchData();
      setPortfolio(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const handleRemoveStock = async (id) => {
    try {
      await api.removeFromPortfolio(id);
      fetchData();
      setPortfolio(prev => prev.filter(stock => stock.id !== id));
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  };

  const handleLinkBroker = async () => {
  try {
    const brokerStocks = await api.linkBrokerPortfolio();
    for (let stock of brokerStocks) {
      const response = await api.addToPortfolio(stock);
      setPortfolio(prev => [...prev, response.data]);
    }
  } catch (error) {
    console.error("Error linking broker portfolio:", error);
  }
};


  // Filter news based on portfolio
  const portfolioSymbols = portfolio.map(stock => stock.symbol);
 const portfolioNews = news.filter(article =>
  portfolioSymbols.some(symbol =>
    article.title?.toLowerCase().includes(symbol.toLowerCase()) ||
    article.description?.toLowerCase().includes(symbol.toLowerCase()) ||
    article.symbol?.toLowerCase() === symbol.toLowerCase()
  )
);


  if (loading) {
    return <div className="loading">Loading...</div>;
  }


  return (
    <div className="App">
      <header className="App-header">
        <h1>📈 Stock News Sentiment Analyzer</h1>
        <p>Track news sentiment for your portfolio stocks</p>
      </header>
 
      <main className="App-main">
        <button 
  onClick={handleLinkBroker} 
  style={{ 
    padding: '8px 12px',
    fontSize: '14px',
    marginTop: '20px',
    marginBottom: '10px',
    marginLeft:'270px',
    backgroundColor: 'rgb(40, 167, 69)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }}
>
  📥 Link Broker Portfolio
</button>

        <div className="container">

      

          <PortfolioSection
            portfolio={portfolio}
            
            onAddStock={handleAddStock}
            onRemoveStock={handleRemoveStock}
          />
          
          
 <NewsSection
  news={news}
  portfolio={portfolio}
  onAnalyze={handleAnalyzeSentiment}
/>

          <SentimentAnalysis
            portfolioNews={portfolioNews}
          />
        </div>
      </main>
    </div>
  );
}

export default App;