import {
  getStockQuote,
  getStockProfile,
  searchStocks,
  getMarketNews,
  getStockCandles
} from '../services/finnhubService.js';

export const getQuote = async (req, res, next) => {
  const { symbol } = req.params;
  try {
    const data = await getStockQuote(symbol);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  const { symbol } = req.params;
  try {
    const data = await getStockProfile(symbol);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  const { q } = req.query;
  try {
    const data = await searchStocks(q);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getNews = async (req, res, next) => {
  try {
    const data = await getMarketNews();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getCandles = async (req, res, next) => {
  const { symbol } = req.params;
  const resolution = req.query.resolution || 'D';
  const to = parseInt(req.query.to) || Math.floor(Date.now() / 1000);
  const from = parseInt(req.query.from) || to - (86400 * 30);

  try {
    const data = await getStockCandles(symbol, resolution, from, to);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
