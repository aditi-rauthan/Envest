

import React from 'react';

const NewsSection = ({ news, portfolio, onAnalyze }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApiSourceBadge = (apiSource) => {
    const badges = {
      'newsapi': { label: 'NewsAPI', color: '#007bff' },
      'marketaux': { label: 'Marketaux', color: '#28a745' },
      'manual': { label: 'Manual', color: '#6c757d' }
    };

    const badge = badges[apiSource] || badges['manual'];

    return (
      <span
        className="api-source-badge"
        style={{ backgroundColor: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  // 🟡 Filter news: only include if news mentions a stock from user's portfolio
  const filteredNews = news.filter(article =>
    portfolio.some(stock =>
      article.title.toLowerCase().includes(stock.symbol.toLowerCase()) ||
      article.description.toLowerCase().includes(stock.symbol.toLowerCase()) ||
      article.symbol?.toLowerCase() === stock.symbol.toLowerCase()
    )
  );

  return (
    <div className="news-section">
      <h2>📌 Filtered News Based on Your Portfolio</h2>
      <p className="news-count">Showing {filteredNews.length} relevant articles</p>

      <div className="news-grid">
        {filteredNews.map(article => (
          <div key={article.id} className="news-card">
            <div className="news-header">
              <h3>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  {article.title}
                </a>
              </h3>
              {getApiSourceBadge(article.apiSource)}
            </div>

            <p className="news-description">{article.description}</p>

            <div className="news-meta">
              <span className="symbol">{article.symbol}</span>
              <span className="date">{formatDate(article.date)}</span>
              <span className="source">{article.source}</span>
            </div>

            {article.sentiment && (
              <div className={`sentiment ${article.sentiment.sentiment}`}>
                <div className="sentiment-label">
                  {article.sentiment.sentiment.toUpperCase()} ({article.sentiment.confidence}%)
                </div>
                <div className="sentiment-reasoning">
                  {article.sentiment.reasoning}
                </div>
              </div>
            )}

            <div className="news-actions">
              <button
                onClick={() => onAnalyze(article)}
                // disabled={!!article.sentiment}
                className="analyze-btn"
              >
                {article.sentiment ? 'Analyzed' : 'Analyze Sentiment'}
              </button>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more-btn"
              >
                Read Full Article
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
