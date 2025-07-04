// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3001';

// // For sentiment analysis, we'll use a free sentiment analysis service
// const SENTIMENT_API_URL = 'https://api.meaningcloud.com/sentiment-2.1';
// const SENTIMENT_API_KEY = 'your_meaningcloud_key'; // Get from https://meaningcloud.com
// const OPENAI_API_KEY=process.env.REACT_APP_OPENAI_API_KEY

// export const api = {
//   getLiveNews: () => axios.get('http://localhost:5000/live-news'), // ✅ fetch real news
//   getPortfolio: () => axios.get('http://localhost:3001/portfolio'), // from json-server
//   updateNews: (id, updatedArticle) => axios.put(`http://localhost:3001/news/${id}`, updatedArticle),
//   addToPortfolio: (stock) => axios.post('http://localhost:3001/portfolio', stock),
//   removeFromPortfolio: (id) => axios.delete(`http://localhost:3001/portfolio/${id}`),

//   // Real sentiment analysis using MeaningCloud API
//    analyzeSentiment: async (headline, description = '') => {
//     const text = `${headline} ${description}`.trim();

//     try {
//       const response = await axios.post(
//         'https://api.openai.com/v1/chat/completions',
//         {
//           model: 'gpt-3.5-turbo',
//           messages: [
//             {
//               role: 'system',
//               content:
//                 'You are a financial sentiment analysis AI. For a given news headline and description, analyze the sentiment towards the stock and return: (1) sentiment as "positive", "neutral", or "negative", (2) a confidence score between 60 and 99, and (3) a short reasoning in 1 sentence.'
//             },
//             {
//               role: 'user',
//               content: `Headline: ${headline}\nDescription: ${description}`
//             }
//           ],
//           temperature: 0.5,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${OPENAI_API_KEY}`,
//           },
//         }
//       );

//       const assistantMessage = response.data.choices[0].message.content;

//       // Expected response format:
//       // Sentiment: Positive
//       // Confidence: 85
//       // Reasoning: The article describes strong performance in quarterly earnings.

//       const sentiment = assistantMessage.match(/Sentiment:\s*(.*)/i)?.[1]?.toLowerCase() || 'neutral';
//       const confidence = parseInt(assistantMessage.match(/Confidence:\s*(\d+)/i)?.[1]) || 60;
//       const reasoning = assistantMessage.match(/Reasoning:\s*(.*)/i)?.[1] || 'N/A';

//       return {
//         sentiment,
//         confidence,
//         reasoning
//       };

//     } catch (error) {
//       console.error('OpenAI sentiment analysis failed:', error);
//       return api.fallbackSentimentAnalysis(headline, description);
//     }
//   },

//   // Fallback sentiment analysis using keyword matching
//   fallbackSentimentAnalysis: (headline, description = '') => {
//     const text = `${headline} ${description}`.toLowerCase();

//     const positiveWords = [
//       'growth', 'profit', 'gain', 'rise', 'increase', 'strong', 'better', 'good', 'positive',
//       'up', 'higher', 'surge', 'boost', 'success', 'win', 'beat', 'exceed', 'bullish'
//     ];

//     const negativeWords = [
//       'loss', 'decline', 'fall', 'drop', 'decrease', 'weak', 'poor', 'negative', 'down',
//       'lower', 'crash', 'plunge', 'fail', 'miss', 'bearish', 'concern', 'worry', 'risk'
//     ];

//     let positiveCount = 0;
//     let negativeCount = 0;

//     positiveWords.forEach(word => {
//       if (text.includes(word)) positiveCount++;
//     });

//     negativeWords.forEach(word => {
//       if (text.includes(word)) negativeCount++;
//     });

//     let sentiment = 'neutral';
//     let confidence = 60;

//     if (positiveCount > negativeCount) {
//       sentiment = 'positive';
//       confidence = Math.min(90, 60 + (positiveCount * 10));
//     } else if (negativeCount > positiveCount) {
//       sentiment = 'negative';
//       confidence = Math.min(90, 60 + (negativeCount * 10));
//     }

//     return {
//       sentiment: sentiment,
//       confidence: confidence,
//       reasoning: `Keyword analysis: ${positiveCount} positive, ${negativeCount} negative words found`
//     };
//   }
// };

import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
// const SENTIMENT_API_URL = "https://api.meaningcloud.com/sentiment-2.1";
// const SENTIMENT_API_KEY = "your_meaningcloud_key";
// const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const api = {
  getLiveNews: () => axios.get("http://localhost:5000/live-news"),
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
      const response = await axios.post("http://localhost:5000/analyze-sentiment", {
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
