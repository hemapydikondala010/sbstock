import User from '../models/User.js';
import Holding from '../models/Holding.js';
import Transaction from '../models/Transaction.js';
import { getStockQuote, getStockProfile } from '../services/finnhubService.js';

export const executeTrade = async (req, res, next) => {
  const { symbol, type, shares } = req.body;

  if (!symbol || !type || !shares || shares <= 0) {
    return res.status(400).json({ message: 'Invalid trade parameters. Provide symbol, type (BUY/SELL), and positive share quantity.' });
  }

  const cleanSymbol = symbol.toUpperCase();
  const tradeType = type.toUpperCase();

  if (tradeType !== 'BUY' && tradeType !== 'SELL') {
    return res.status(400).json({ message: 'Trade type must be BUY or SELL.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const quote = await getStockQuote(cleanSymbol);
    const executionPrice = quote.c;
    const totalAmount = parseFloat((executionPrice * shares).toFixed(2));

    let holding = await Holding.findOne({ userId: user._id, symbol: cleanSymbol });

    if (tradeType === 'BUY') {
      if (user.balance < totalAmount) {
        return res.status(400).json({
          message: `Insufficient funds. Cost is $${totalAmount.toFixed(2)}, but you only have $${user.balance.toFixed(2)} in virtual cash.`,
        });
      }

      user.balance = parseFloat((user.balance - totalAmount).toFixed(2));

      if (holding) {
        const totalOldCost = holding.shares * holding.avgBuyPrice;
        const newTotalShares = holding.shares + shares;
        const newAvgBuyPrice = (totalOldCost + totalAmount) / newTotalShares;

        holding.shares = newTotalShares;
        holding.avgBuyPrice = parseFloat(newAvgBuyPrice.toFixed(2));
        await holding.save();
      } else {
        const profile = await getStockProfile(cleanSymbol);
        holding = await Holding.create({
          userId: user._id,
          symbol: cleanSymbol,
          companyName: profile.name || `${cleanSymbol} Corp`,
          shares,
          avgBuyPrice: executionPrice,
        });
      }
    } else if (tradeType === 'SELL') {
      if (!holding || holding.shares < shares) {
        const owned = holding ? holding.shares : 0;
        return res.status(400).json({
          message: `Insufficient shares. You tried to sell ${shares} shares, but you only own ${owned}.`,
        });
      }

      user.balance = parseFloat((user.balance + totalAmount).toFixed(2));
      holding.shares -= shares;

      if (holding.shares <= 0.0001) {
        await Holding.findByIdAndDelete(holding._id);
        holding = null;
      } else {
        await holding.save();
      }
    }

    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      symbol: cleanSymbol,
      type: tradeType,
      shares,
      price: executionPrice,
      totalAmount,
    });

    res.status(200).json({
      message: `${tradeType} order executed successfully for ${shares} shares of ${cleanSymbol}`,
      newBalance: user.balance,
      transaction: {
        id: transaction._id,
        symbol: transaction.symbol,
        type: transaction.type,
        shares: transaction.shares,
        price: transaction.price,
        totalAmount: transaction.totalAmount,
        date: transaction.createdAt,
      },
      holding: holding ? {
        shares: holding.shares,
        avgBuyPrice: holding.avgBuyPrice,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    if (req.query.symbol) {
      query.symbol = req.query.symbol.toUpperCase();
    }

    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      transactions,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};
