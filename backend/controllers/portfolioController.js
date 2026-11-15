import User from '../models/User.js';
import Holding from '../models/Holding.js';
import Watchlist from '../models/Watchlist.js';
import Portfolio from '../models/Portfolio.js';
import { getStockQuote } from '../services/finnhubService.js';

const checkAndGenerateHistory = async (userId, currentTotalValue) => {
  let portfolio = await Portfolio.findOne({ userId });
  
  if (!portfolio) {
    portfolio = new Portfolio({ userId, totalInvested: 0, history: [] });
  }

  if (portfolio.history.length === 0) {
    const historyData = [];
    const baseValue = 100000.00;
    const now = new Date();
    
    for (let i = 30; i >= 1; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const multiplier = 1 + (Math.sin(i / 5) * 0.02) + (Math.random() - 0.5) * 0.01;
      const simulatedValue = baseValue * multiplier;
      
      historyData.push({
        date,
        value: parseFloat(simulatedValue.toFixed(2)),
      });
    }
    
    historyData.push({
      date: now,
      value: parseFloat(currentTotalValue.toFixed(2)),
    });
    
    portfolio.history = historyData;
    await portfolio.save();
  } else {
    const lastEntry = portfolio.history[portfolio.history.length - 1];
    const today = new Date().toDateString();
    const lastEntryDate = new Date(lastEntry.date).toDateString();
    
    if (today !== lastEntryDate) {
      portfolio.history.push({
        date: new Date(),
        value: parseFloat(currentTotalValue.toFixed(2)),
      });
      if (portfolio.history.length > 90) {
        portfolio.history.shift();
      }
      await portfolio.save();
    } else {
      lastEntry.value = parseFloat(currentTotalValue.toFixed(2));
      await portfolio.save();
    }
  }
  
  return portfolio.history;
};

export const getDashboardData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const holdings = await Holding.find({ userId: req.user.id });
    
    let totalStockValue = 0;
    let totalInvestedValue = 0;
    const formattedHoldings = [];

    for (const holding of holdings) {
      const quote = await getStockQuote(holding.symbol);
      const currentPrice = quote.c;
      const currentValue = holding.shares * currentPrice;
      const totalCost = holding.shares * holding.avgBuyPrice;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      totalStockValue += currentValue;
      totalInvestedValue += totalCost;

      formattedHoldings.push({
        id: holding._id,
        symbol: holding.symbol,
        companyName: holding.companyName,
        shares: holding.shares,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      });
    }

    const portfolioValue = user.balance + totalStockValue;
    const totalProfitLoss = portfolioValue - 100000.00;
    const totalProfitLossPercent = (totalProfitLoss / 100000.00) * 100;

    const watchlist = await Watchlist.findOne({ userId: req.user.id });
    const watchlistSymbols = watchlist ? watchlist.symbols : [];

    const history = await checkAndGenerateHistory(req.user.id, portfolioValue);

    const todayChangePercent = (Math.random() - 0.45) * 2;
    const todayProfitLoss = (totalStockValue * (todayChangePercent / 100));

    res.status(200).json({
      cashBalance: user.balance,
      totalStockValue: parseFloat(totalStockValue.toFixed(2)),
      portfolioValue: parseFloat(portfolioValue.toFixed(2)),
      totalInvested: parseFloat(totalInvestedValue.toFixed(2)),
      totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
      todayProfitLoss: parseFloat(todayProfitLoss.toFixed(2)),
      todayProfitLossPercent: parseFloat(todayChangePercent.toFixed(2)),
      holdings: formattedHoldings.slice(0, 5),
      watchlistSymbols,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const getHoldingsData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const holdings = await Holding.find({ userId: req.user.id });
    let totalStockValue = 0;
    const formattedHoldings = [];

    for (const holding of holdings) {
      const quote = await getStockQuote(holding.symbol);
      const currentPrice = quote.c;
      const currentValue = holding.shares * currentPrice;
      const totalCost = holding.shares * holding.avgBuyPrice;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      totalStockValue += currentValue;

      formattedHoldings.push({
        id: holding._id,
        symbol: holding.symbol,
        companyName: holding.companyName,
        shares: holding.shares,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      });
    }

    const netWorth = user.balance + totalStockValue;

    const holdingsWithAllocations = formattedHoldings.map((h) => ({
      ...h,
      allocationPercent: netWorth > 0 ? parseFloat(((h.currentValue / netWorth) * 100).toFixed(2)) : 0,
    }));

    res.status(200).json({
      cashBalance: user.balance,
      totalStockValue: parseFloat(totalStockValue.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
      holdings: holdingsWithAllocations,
    });
  } catch (error) {
    next(error);
  }
};
