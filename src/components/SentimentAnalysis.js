import React from 'react';

const SentimentAnalysis = ({ portfolioNews }) => {
  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      default: return '#FF9800';
    }
  };

  return (
    <div className="sentiment-analysis">
      <h2>🤖 AI Sentiment Analysis</h2>
      <div className="analysis-summary">
        <h3>Portfolio Impact Summary</h3>
        {portfolioNews.length === 0 ? (
          <p>No news found for your portfolio stocks.</p>
        ) : (
          <div className="sentiment-grid">
            {portfolioNews.map(article => (
              <div key={article.id} className="sentiment-card">
                <h4>{article.title}</h4>
                <div className="symbol-tag">{article.symbol}</div>
                {article.sentiment && (
                  <div 
                    className="sentiment-result"
                    style={{ borderLeft: `4px solid ${getSentimentColor(article.sentiment.sentiment)}` }}
                  >
                    <div className="sentiment-label">
                      {article.sentiment.sentiment.toUpperCase()}
                    </div>
                    <div className="confidence">
                      Confidence: {article.sentiment.confidence}%
                    </div>
                    <div className="reasoning">
                      {article.sentiment.reasoning}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;