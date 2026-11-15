const STATIC_PRICES = {
  AAPL: 182.52,
  MSFT: 415.60,
  GOOGL: 151.77,
  AMZN: 178.15,
  TSLA: 171.05,
  NVDA: 875.12,
  META: 505.10,
  NFLX: 610.50,
  AMD: 160.20,
  BABA: 72.40,
};

export const getStockPrice = async (symbol) => {
  const cleanSymbol = symbol.toUpperCase();
  if (STATIC_PRICES[cleanSymbol]) {
    const wiggle = (Math.random() - 0.5) * 0.5;
    return parseFloat((STATIC_PRICES[cleanSymbol] + wiggle).toFixed(2));
  }
  
  let hash = 0;
  for (let i = 0; i < cleanSymbol.length; i++) {
    hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const basePrice = Math.abs(hash % 450) + 10;
  const wiggle = (Math.random() - 0.5) * 0.1 * basePrice;
  return parseFloat((basePrice + wiggle).toFixed(2));
};

export const getMultipleStockPrices = async (symbols) => {
  const prices = {};
  for (const symbol of symbols) {
    prices[symbol.toUpperCase()] = await getStockPrice(symbol);
  }
  return prices;
};
