import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Trash2, ArrowRight } from 'lucide-react';
import api from '../services/api.js';

const Watchlist = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const getWatchlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/watchlist');
      setWatchlist(response.data.items || []);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWatchlist();
  }, []);

  const handleRemove = async (e, symbol) => {
    e.stopPropagation();
    try {
      await api.post('/watchlist/remove', { symbol });
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Your Watchlist</h1>
        <p className="text-xs text-[#8a9fc2] mt-1">Track stocks and monitor real-time price fluctuations</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#151a26] border border-[#222b3e] rounded-xl" />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#222b3e] rounded-xl bg-[#151a26]/40 max-w-lg mx-auto">
          <Star className="h-10 w-10 text-[#8a9fc2] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
          <p className="text-sm text-[#8a9fc2] mt-2 px-6">
            Search for stocks on the Market page and click the star icon to keep track of their price changes here.
          </p>
          <button
            onClick={() => navigate('/market')}
            className="mt-6 bg-[#00c805] text-[#0b0e14] font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#00c805]/90 transition-all shadow cursor-pointer"
          >
            Search Stocks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => {
            const isUp = item.change >= 0;
            return (
              <motion.div
                key={item.symbol}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/stock/${item.symbol}`)}
                className="p-5 rounded-xl border border-[#222b3e] bg-[#151a26] hover:bg-[#1c2333] hover:border-[#00c805]/20 cursor-pointer flex flex-col justify-between h-28 relative group transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#0b0e14] border border-[#222b3e] flex items-center justify-center font-bold text-[#00c805] text-xs overflow-hidden">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = item.symbol.slice(0, 2);
                          }}
                        />
                      ) : (
                        item.symbol.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00c805] transition-colors">
                        {item.symbol}
                      </h3>
                      <p className="text-[10px] text-[#8a9fc2] max-w-[120px] truncate">{item.companyName}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(e, item.symbol)}
                    className="opacity-0 group-hover:opacity-100 hover:text-[#ff3b30] text-[#8a9fc2] p-1.5 rounded transition-all cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex justify-between items-end border-t border-[#222b3e]/40 pt-2">
                  <span className="text-sm font-bold text-white">${item.price.toFixed(2)}</span>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
                    {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span>{isUp ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
