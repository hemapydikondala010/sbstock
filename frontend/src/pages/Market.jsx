import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Star, BarChart3, RefreshCw } from 'lucide-react';
import api from '../services/api.js';

const Market = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [trendingQuotes, setTrendingQuotes] = useState([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

  const getMarketData = async () => {
    setLoadingQuotes(true);
    try {
      const wlRes = await api.get('/watchlist');
      setWatchlistSymbols(wlRes.data.symbols);

      const quotesData = await Promise.all(
        popularTickers.map(async (sym) => {
          try {
            const q = await api.get(`/stocks/quote/${sym}`);
            const p = await api.get(`/stocks/profile/${sym}`);
            return {
              symbol: sym,
              name: p.data.name || `${sym} Corp`,
              logo: p.data.logo || '',
              price: q.data.c,
              change: q.data.d,
              changePercent: q.data.dp,
            };
          } catch (err) {
            return null;
          }
        })
      );

      setTrendingQuotes(quotesData.filter(Boolean));
    } catch (err) {
      console.error('Failed to get market data:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    getMarketData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/stocks/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleWatchlistToggle = async (e, symbol) => {
    e.stopPropagation();
    try {
      if (watchlistSymbols.includes(symbol)) {
        await api.post('/watchlist/remove', { symbol });
        setWatchlistSymbols(watchlistSymbols.filter((s) => s !== symbol));
      } else {
        await api.post('/watchlist/add', { symbol });
        setWatchlistSymbols([...watchlistSymbols, symbol]);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Stock Market</h1>
        <p className="text-xs text-[#8a9fc2] mt-1">Explore real-time stock quotes, indices, and trading pairs</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-[#151a26] border border-[#222b3e] rounded-xl px-4 py-3 focus-within:border-[#00c805]/50 transition-colors">
          <Search className="h-5 w-5 text-[#8a9fc2]" />
          <input
            type="text"
            placeholder="Search US Stocks by symbol or company name (e.g. AAPL, Tesla)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white w-full outline-none placeholder:text-[#8a9fc2]"
          />
          {isSearching && (
            <div className="h-4 w-4 border-2 border-[#00c805] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Autocomplete Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 border border-[#222b3e] bg-[#151a26] rounded-xl shadow-2xl p-2 max-h-72 overflow-y-auto space-y-1 z-20">
            {searchResults.map((item) => (
              <div
                key={item.symbol}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#0b0e14] cursor-pointer group transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-[#00c805] transition-colors">
                    {item.symbol}
                  </p>
                  <p className="text-xs text-[#8a9fc2]">{item.description}</p>
                </div>
                <span className="text-[10px] bg-[#222b3e] px-2 py-0.5 rounded text-[#8a9fc2]">
                  Trade &rarr;
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Stocks Grid */}
      <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#222b3e]">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#00c805]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Popular Stocks</h2>
          </div>
          <button
            onClick={getMarketData}
            className="text-[#8a9fc2] hover:text-white p-1 rounded-lg cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loadingQuotes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 bg-[#0b0e14]/60 border border-[#222b3e]/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingQuotes.map((q) => {
              const isUp = q.change >= 0;
              const isWatched = watchlistSymbols.includes(q.symbol);
              return (
                <motion.div
                  key={q.symbol}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => navigate(`/stock/${q.symbol}`)}
                  className="p-4 rounded-xl border border-[#222b3e] bg-[#0b0e14]/40 hover:bg-[#1c2333] cursor-pointer flex justify-between items-center transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#222b3e] flex items-center justify-center font-bold text-[#00c805] text-xs overflow-hidden border border-[#222b3e]">
                      {q.logo ? (
                        <img
                          src={q.logo}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = q.symbol.slice(0, 2);
                          }}
                        />
                      ) : (
                        q.symbol.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white group-hover:text-[#00c805] transition-colors">{q.symbol}</p>
                        <button
                          onClick={(e) => handleWatchlistToggle(e, q.symbol)}
                          className={`p-0.5 rounded-full ${isWatched ? 'text-[#ffb800]' : 'text-[#8a9fc2] hover:text-white'}`}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8a9fc2] max-w-[100px] truncate">{q.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${q.price.toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
