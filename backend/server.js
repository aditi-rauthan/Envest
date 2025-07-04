const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config(); 


const NEWS_API_KEY = process.env.NEWS_API_KEY;
const MARKETAUX_API_KEY = process.env.MARKETAUX_API_KEY; // Get from https://marketaux.com


const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000; // or any available port

app.use(cors());
app.use(express.json());

app.get('/live-news', async (req, res) => {
  try {
    const [newsApiResponse, marketauxResponse] = await Promise.all([
      axios.get(`https://newsapi.org/v2/top-headlines`, {
        params: {
          apiKey: NEWS_API_KEY,
          country: 'in',
          category: 'business',
          pageSize: 20
        }
      }),
      axios.get(`https://api.marketaux.com/v1/news/all`, {
        params: {
          api_token: MARKETAUX_API_KEY,
          symbols: 'INFY,TCS,RELIANCE,HDFCBANK,WIPRO,ICICIBANK,SBIN,ITC,LT,HINDUNILVR',
          filter_entities: true,
          language: 'en',
          limit: 10
        }
      })
    ]);

    const processedNewsAPI = newsApiResponse.data.articles.map((article, index) => ({
      id: `news_${Date.now()}_${index}`,
      title: article.title,
      description: article.description || article.content || '',
      url: article.url,
      symbol: extractStockSymbol(article.title + ' ' + (article.description || '')),
      date: new Date(article.publishedAt).toISOString().split('T')[0],
      source: article.source.name,
      sentiment: null,
      apiSource: 'newsapi'
    }));

    const processedMarketaux = marketauxResponse.data.data.map((article, index) => ({
      id: `market_${Date.now()}_${index}`,
      title: article.title,
      description: article.description || article.snippet || '',
      url: article.url,
      symbol: article.entities?.[0]?.symbol || 'UNKNOWN',
      date: new Date(article.published_at).toISOString().split('T')[0],
      source: article.source,
      sentiment: article.entities?.[0]?.sentiment ? {
        sentiment: article.entities[0].sentiment > 0 ? 'positive' : 
                  article.entities[0].sentiment < 0 ? 'negative' : 'neutral',
        confidence: Math.abs(article.entities[0].sentiment * 100),
        reasoning: `Market sentiment score: ${article.entities[0].sentiment}`
      } : null,
      apiSource: 'marketaux'
    }));

    const allNews = [...processedNewsAPI, ...processedMarketaux];

    res.json(allNews); // ✅ send real news

  } catch (error) {
    console.error('Live news fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch live news' });
  }
});

app.post('/analyze-sentiment', async (req, res) => {
  const { headline, description = '' } = req.body;
  const text = `${headline} ${description}`.trim();

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial sentiment analysis AI. For a given news headline and description, analyze the sentiment towards the stock and return: (1) sentiment as "positive", "neutral", or "negative", (2) a confidence score between 60 and 99, and (3) a short reasoning in 1 sentence.'
          },
          {
            role: 'user',
            content: `Headline: ${headline}\nDescription: ${description}`
          }
        ],
        temperature: 0.5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    const sentiment = assistantMessage.match(/Sentiment:\s*(.*)/i)?.[1]?.toLowerCase() || 'neutral';
    const confidence = parseInt(assistantMessage.match(/Confidence:\s*(\d+)/i)?.[1]) || 60;
    const reasoning = assistantMessage.match(/Reasoning:\s*(.*)/i)?.[1] || 'N/A';

    res.json({ sentiment, confidence, reasoning });

  } catch (error) {
    console.error('OpenAI sentiment analysis failed:', error.message);
    res.status(500).json({
      sentiment: 'neutral',
      confidence: 60,
      reasoning: 'Fallback: API call failed',
    });
  }
});


const DB_FILE = './db.json'; // path to your json file

// Utility: Load and save db
const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// === Portfolio Routes ===

// GET /portfolio
app.get('/portfolio', (req, res) => {
  try {
    const db = loadDB();
    res.json(db.portfolio || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load portfolio' });
  }
});

// POST /portfolio
app.post('/portfolio', (req, res) => {
  console.log("inside controller")
  try {
    const newStock = req.body;
    const db = loadDB();

    // Assign new ID
    const maxId = Math.max(0, ...db.portfolio.map(item => item.id || 0));
    newStock.id = maxId + 1;

    db.portfolio.push(newStock);
    saveDB(db);
    res.status(201).json(newStock);
  } catch (err) {
    console.error("Error in post protfolio:", err);  // add this!
    res.status(500).json({ error: 'Failed to add stock to portfolio' });
  }
});

// DELETE /portfolio/:id
app.delete('/portfolio/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = loadDB();
    const originalLength = db.portfolio.length;

    db.portfolio = db.portfolio.filter(item => item.id !== id);
    if (db.portfolio.length === originalLength) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    saveDB(db);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete stock from portfolio' });
  }
});

// === Update News Sentiment ===
// PUT /news/:id
app.put('/news/:id', (req, res) => {
  try {
    const id = req.params.id;
    const updatedNews = req.body;
    const db = loadDB();

    const index = db.news.findIndex(n => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'News article not found' });
    }

    db.news[index] = { ...db.news[index], ...updatedNews };
    saveDB(db);
    res.json(db.news[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

app.listen(PORT, () => {
  console.log(`Live news server running at http://localhost:${PORT}`);
});
