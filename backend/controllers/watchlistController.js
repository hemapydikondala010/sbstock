import Watchlist from '../models/Watchlist.js';
import { getStockQuote, getStockProfile } from '../services/finnhubService.js';

export const getWatchlist = async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: req.user.id, symbols: ['AAPL', 'TSLA', 'MSFT', 'NVDA'] });
    }

    const items = [];
    for (const sym of watchlist.symbols) {
      try {
        const quote = await getStockQuote(sym);
        const profile = await getStockProfile(sym);
        items.push({
          symbol: sym,
          companyName: profile.name || `${sym} Corp`,
          logo: profile.logo || '',
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
        });
      } catch (err) {
        items.push({
          symbol: sym,
          companyName: `${sym} Corp`,
          logo: '',
          price: 100.0,
          change: 0.0,
          changePercent: 0.0,
        });
      }
    }

    res.status(200).json({
      symbols: watchlist.symbols,
      items,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req, res, next) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required' });
  }

  const cleanSymbol = symbol.toUpperCase().trim();

  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user.id, symbols: [] });
    }

    if (!watchlist.symbols.includes(cleanSymbol)) {
      watchlist.symbols.push(cleanSymbol);
      await watchlist.save();
    }

    res.status(200).json({
      message: `${cleanSymbol} added to watchlist`,
      symbols: watchlist.symbols,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  const { symbol } = req.body;
  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required' });
  }

  const cleanSymbol = symbol.toUpperCase().trim();

  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist) {
      return res.status(200).json({ symbols: [] });
    }

    watchlist.symbols = watchlist.symbols.filter((s) => s !== cleanSymbol);
    await watchlist.save();

    res.status(200).json({
      message: `${cleanSymbol} removed from watchlist`,
      symbols: watchlist.symbols,
    });
  } catch (error) {
    next(error);
  }
};
