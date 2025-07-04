const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');


const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY; 
const MARKETAUX_API_KEY = process.env.REACT_APP_MARKETAUX_API_KEY; // Get from https://marketaux.com


// const scrapeNews = async () => {
//   try {
//     console.log('Fetching real news...');
    
//     // Fetch Indian business news from NewsAPI
//     const newsApiResponse = await axios.get(`https://newsapi.org/v2/top-headlines`, {
//       params: {
//         apiKey: NEWS_API_KEY,
//         country: 'in',
//         category: 'business',
//         pageSize: 20
//       }
//     });

//     console.log(newsApiResponse)

//     // Fetch stock market news from Marketaux
//     const marketauxResponse = await axios.get(`https://api.marketaux.com/v1/news/all`, {
//       params: {
//         api_token: MARKETAUX_API_KEY,
//         symbols: 'INFY,TCS,RELIANCE,HDFCBANK,WIPRO,ICICIBANK,SBIN,ITC,LT,HINDUNILVR',
//         filter_entities: true,
//         language: 'en',
//         limit: 10
//       }
//     });

//     // Process NewsAPI data
//     const processedNewsAPI = newsApiResponse.data.articles.map((article, index) => ({
//       id: `news_${Date.now()}_${index}`,
//       title: article.title,
//       description: article.description || article.content || '',
//       url: article.url,
//       symbol: extractStockSymbol(article.title + ' ' + (article.description || '')),
//       date: new Date(article.publishedAt).toISOString().split('T')[0],
//       source: article.source.name,
//       sentiment: null,
//       apiSource: 'newsapi'
//     }));

//     // Process Marketaux data (includes sentiment)
//     const processedMarketaux = marketauxResponse.data.data.map((article, index) => ({
//       id: `market_${Date.now()}_${index}`,
//       title: article.title,
//       description: article.description || article.snippet || '',
//       url: article.url,
//       symbol: article.entities?.[0]?.symbol || 'UNKNOWN',
//       date: new Date(article.published_at).toISOString().split('T')[0],
//       source: article.source,
//       sentiment: article.entities?.[0]?.sentiment ? {
//         sentiment: article.entities[0].sentiment > 0 ? 'positive' : 
//                   article.entities[0].sentiment < 0 ? 'negative' : 'neutral',
//         confidence: Math.abs(article.entities[0].sentiment * 100),
//         reasoning: `Market sentiment score: ${article.entities[0].sentiment}`
//       } : null,
//       apiSource: 'marketaux'
//     }));

//     // Read existing data
//     const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    
//     // Combine all news
//     const allNewNews = [...processedNewsAPI, ...processedMarketaux];
    
//     // Filter out duplicates by title
//     const existingTitles = data.news.map(n => n.title.toLowerCase());
//     const uniqueNewNews = allNewNews.filter(n => 
//       !existingTitles.includes(n.title.toLowerCase())
//     );

//     if (uniqueNewNews.length > 0) {
//       data.news = [...uniqueNewNews, ...data.news].slice(0, 50); // Keep latest 50 articles
//       fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
//       console.log(`Added ${uniqueNewNews.length} new articles`);
//     } else {
//       console.log('No new articles found');
//     }

//   } catch (error) {
//     console.error('Error fetching news:', error.message);
//   }
// };

// // Helper function to extract stock symbols from text
// const extractStockSymbol = (text) => {
//   const indianStocks = ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'WIPRO', 'ICICIBANK', 'SBIN', 'ITC', 'LT', 'HINDUNILVR'];
//   const upperText = text.toUpperCase();
  
//   // Check for company names
//   if (upperText.includes('INFOSYS')) return 'INFY';
//   if (upperText.includes('TCS') || upperText.includes('TATA CONSULTANCY')) return 'TCS';
//   if (upperText.includes('RELIANCE')) return 'RELIANCE';
//   if (upperText.includes('HDFC BANK') || upperText.includes('HDFCBANK')) return 'HDFCBANK';
//   if (upperText.includes('WIPRO')) return 'WIPRO';
//   if (upperText.includes('ICICI')) return 'ICICIBANK';
//   if (upperText.includes('SBI') || upperText.includes('STATE BANK')) return 'SBIN';
//   if (upperText.includes('ITC')) return 'ITC';
//   if (upperText.includes('L&T') || upperText.includes('LARSEN')) return 'LT';
//   if (upperText.includes('HINDUSTAN UNILEVER') || upperText.includes('HUL')) return 'HINDUNILVR';
  
//   // Check for direct symbol match
//   for (const symbol of indianStocks) {
//     if (upperText.includes(symbol)) return symbol;
//   }
  
//   return 'GENERAL';
// };

// // Schedule scraping every hour
// cron.schedule('0 * * * *', scrapeNews);

// // Run once immediately
// scrapeNews();

// console.log('Real news scraper started. Will fetch news every hour.');


const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000; // or any available port

app.use(cors());

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


app.listen(PORT, () => {
  console.log(`Live news server running at http://localhost:${PORT}`);
});
