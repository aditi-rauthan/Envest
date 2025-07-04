
import axios from "axios";

// const API_BASE_URL = "http://localhost:5000";
const API_BASE_URL = "https://envest-66gr.onrender.com";

// const SENTIMENT_API_URL = "https://api.meaningcloud.com/sentiment-2.1";
// const SENTIMENT_API_KEY = "your_meaningcloud_key";
// const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const api = {
  getLiveNews: () => axios.get(`${API_BASE_URL}/live-news`),
  getPortfolio: () => axios.get(`${API_BASE_URL}/portfolio`),
  updateNews: (id, updatedArticle) =>
    axios.put(`${API_BASE_URL}/news/${id}`, updatedArticle),
  addToPortfolio: (stock) => axios.post(`${API_BASE_URL}/portfolio`, stock),
  removeFromPortfolio: (id) => axios.delete(`${API_BASE_URL}/portfolio/${id}`),

  // NEW FUNCTION FOR BROKER IMPORT
  linkBrokerPortfolio: async () => {
    // Simulated broker stocks (you can replace this with real broker API call later)
    return [
      { symbol: "RELIANCE", name: "Reliance Industries", quantity: 100 },
      { symbol: "HDFCBANK", name: "HDFC Bank", quantity: 50 },
    ];
  },

  // Frontend: utils/api.js or inside your React component
  analyzeSentiment: async (headline, description = "") => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-sentiment`, {
        headline,
        description,
      });
      return response.data;
    } catch (error) {
      console.error("Backend sentiment analysis failed:", error);
      return {
        sentiment: "neutral",
        confidence: 60,
        reasoning: "Fallback used",
      };
    }
  },

  fallbackSentimentAnalysis: (headline, description = "") => {
    const text = `${headline} ${description}`.toLowerCase();
    const positiveWords = [
      "growth",
      "profit",
      "gain",
      "rise",
      "increase",
      "strong",
      "better",
      "good",
      "positive",
      "up",
      "higher",
      "surge",
      "boost",
      "success",
      "win",
      "beat",
      "exceed",
      "bullish",
    ];
    const negativeWords = [
      "loss",
      "decline",
      "fall",
      "drop",
      "decrease",
      "weak",
      "poor",
      "negative",
      "down",
      "lower",
      "crash",
      "plunge",
      "fail",
      "miss",
      "bearish",
      "concern",
      "worry",
      "risk",
    ];

    let positiveCount = 0,
      negativeCount = 0;
    positiveWords.forEach((word) => {
      if (text.includes(word)) positiveCount++;
    });
    negativeWords.forEach((word) => {
      if (text.includes(word)) negativeCount++;
    });

    let sentiment = "neutral";
    let confidence = 60;
    if (positiveCount > negativeCount) {
      sentiment = "positive";
      confidence = Math.min(90, 60 + positiveCount * 10);
    } else if (negativeCount > positiveCount) {
      sentiment = "negative";
      confidence = Math.min(90, 60 + negativeCount * 10);
    }

    return {
      sentiment,
      confidence,
      reasoning: `Keyword analysis: ${positiveCount} positive, ${negativeCount} negative words found`,
    };
  },
};
