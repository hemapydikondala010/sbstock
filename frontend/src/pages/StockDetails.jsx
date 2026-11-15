import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Building,
  Globe,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Area, Bar } from 'recharts';
import { updateUserBalance } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);

  // Trading states
  const [tradeType, setTradeType] = useState('BUY');
  const [sharesInput, setSharesInput] = useState('1');
  const [ownedShares, setOwnedShares] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [tradeError, setTradeError] = useState(null);

  // Success Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [executedTradeDetails, setExecutedTradeDetails] = useState(null);

  // Timeframe and Chart states
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const getStockDetails = async () => {
    setLoading(true);
    setTradeError(null);
    try {
      const qRes = await api.get(`/stocks/quote/${symbol}`);
      const pRes = await api.get(`/stocks/profile/${symbol}`);

      setQuote(qRes.data);
      setProfile(pRes.data);

      const wlRes = await api.get('/watchlist');
      setIsWatched(wlRes.data.symbols.includes(symbol.toUpperCase()));

      const holdingsRes = await api.get('/portfolio/holdings');
      const thisHolding = holdingsRes.data.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      );
      setOwnedShares(thisHolding ? thisHolding.shares : 0);
    } catch (err) {
      console.error('Failed to get stock details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = async () => {
    setLoadingChart(true);
    const to = Math.floor(Date.now() / 1000);
    let from = to - (86400 * 30);
    let resolution = 'D';

    if (timeframe === '1W') {
      from = to - (86400 * 7);
      resolution = 'D';
    } else if (timeframe === '1M') {
      from = to - (86400 * 30);
      resolution = 'D';
    } else if (timeframe === '3M') {
      from = to - (86400 * 90);
      resolution = 'D';
    } else if (timeframe === '1Y') {
      from = to - (86400 * 365);
      resolution = 'W';
    }

    try {
      const response = await api.get(`/stocks/candles/${symbol}?resolution=${resolution}&from=${from}&to=${to}`);
      const data = response.data;

      if (data && data.t) {
        const formatted = data.t.map((timestamp, index) => ({
          date: new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          Price: data.c[index],
          Volume: data.v[index],
        }));
        setChartData(formatted);
      }
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    getStockDetails();
  }, [symbol]);

  useEffect(() => {
    getChartData();
  }, [symbol, timeframe]);

  const handleWatchlistToggle = async () => {
    try {
      if (isWatched) {
        await api.post('/watchlist/remove', { symbol });
        setIsWatched(false);
      } else {
        await api.post('/watchlist/add', { symbol });
        setIsWatched(true);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setTradeError(null);
    const sharesNum = parseFloat(sharesInput);

    if (isNaN(sharesNum) || sharesNum <= 0) {
      setTradeError('Please enter a valid positive number of shares.');
      return;
    }

    setIsExecuting(true);
    try {
      const response = await api.post('/trade/execute', {
        symbol: symbol.toUpperCase(),
        type: tradeType,
        shares: sharesNum,
      });

      dispatch(updateUserBalance(response.data.newBalance));
      setExecutedTradeDetails(response.data.transaction);
      setShowSuccessModal(true);
      setSharesInput('1');

      const holdingsRes = await api.get('/portfolio/holdings');
      const thisHolding = holdingsRes.data.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      );
      setOwnedShares(thisHolding ? thisHolding.shares : 0);
      getChartData();
    } catch (err) {
      setTradeError(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0b0e14] text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#00c805] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#8a9fc2]">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!quote || !profile) {
    return (
      <div className="text-center py-20 bg-[#0b0e14] text-white space-y-4">
        <p className="text-[#ff3b30]">Failed to load details for symbol {symbol}.</p>
        <button
          onClick={() => navigate('/market')}
          className="px-4 py-2 bg-[#151a26] border border-[#222b3e] rounded-lg cursor-pointer"
        >
          Back to Market
        </button>
      </div>
    );
  }

  const isUp = quote.d >= 0;
  const currentPrice = quote.c;
  const enteredShares = parseFloat(sharesInput) || 0;
  const estimatedCost = parseFloat((enteredShares * currentPrice).toFixed(2));

  const canBuy = user && user.balance >= estimatedCost;
  const canSell = ownedShares >= enteredShares;
  const isFormInvalid = enteredShares <= 0 || (tradeType === 'BUY' ? !canBuy : !canSell);

  const timeframes = ['1W', '1M', '3M', '1Y'];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/market')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8a9fc2] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Market</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWatchlistToggle}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all cursor-pointer ${
              isWatched
                ? 'bg-[#ffb800]/10 border-[#ffb800] text-[#ffb800]'
                : 'bg-[#151a26] border-[#222b3e] text-[#8a9fc2] hover:text-white hover:bg-[#1c2333]'
            }`}
          >
            <Star className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
            <span>{isWatched ? 'Watched' : 'Watchlist'}</span>
          </button>
          <button
            onClick={() => {
              getStockDetails();
              getChartData();
            }}
            className="p-2 rounded-lg bg-[#151a26] border border-[#222b3e] hover:bg-[#1c2333] text-[#8a9fc2] hover:text-white transition-colors cursor-pointer"
            title="Refresh Quote"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stock Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#151a26] border border-[#222b3e] rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#0b0e14] border border-[#222b3e] flex items-center justify-center overflow-hidden font-extrabold text-[#00c805] text-lg p-1 border-[#00c805]/20">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt=""
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = symbol.slice(0, 2);
                }}
              />
            ) : (
              symbol.slice(0, 2)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{symbol.toUpperCase()}</h1>
              <span className="text-xs bg-[#222b3e] text-[#8a9fc2] px-2 py-0.5 rounded font-semibold uppercase">
                {profile.finnhubIndustry || 'Stock'}
              </span>
            </div>
            <p className="text-sm text-[#8a9fc2] mt-0.5">{profile.name}</p>
          </div>
        </div>

        <div className="sm:text-right">
          <h2 className="text-3xl font-extrabold text-white">${quote.c.toFixed(2)}</h2>
          <div className={`inline-flex items-center gap-1 text-sm font-bold mt-1 ${isUp ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isUp ? '+' : ''}
              {quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
            </span>
            <span className="text-[#8a9fc2] font-normal ml-1">Today</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Chart & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#222b3e]/45 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Historical Performance</h3>
              <div className="flex bg-[#0b0e14] border border-[#222b3e] rounded-lg p-0.5 select-none text-[10px]">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-[#00c805]/10 text-[#00c805]'
                        : 'text-[#8a9fc2] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {loadingChart ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-[#00c805] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? '#00c805' : '#ff3b30'} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={isUp ? '#00c805' : '#ff3b30'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8a9fc2" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="price"
                      stroke="#8a9fc2"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <YAxis
                      yAxisId="volume"
                      orientation="right"
                      stroke="#8a9fc2"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      hide
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151a26', borderColor: '#222b3e', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="Price"
                      name="Stock Price"
                      stroke={isUp ? '#00c805' : '#ff3b30'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                    <Bar
                      yAxisId="volume"
                      dataKey="Volume"
                      name="Volume"
                      fill="#374151"
                      opacity={0.15}
                      barSize={12}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#222b3e] pb-2 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-[#00c805]" />
                <span>Day Range</span>
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8a9fc2]">Day High</span>
                  <span className="font-bold text-white">${quote.h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8a9fc2]">Day Low</span>
                  <span className="font-bold text-white">${quote.l.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8a9fc2]">Previous Close</span>
                  <span className="font-bold text-white">${quote.pc.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-[#222b3e] pb-2 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#00c805]" />
                <span>Company Info</span>
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-[#8a9fc2]">Ticker Symbol</span>
                  <span className="font-bold text-[#00c805] uppercase">{symbol}</span>
                </div>
                {profile.weburl && (
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-[#8a9fc2]">Corporate Website</span>
                    <a
                      href={profile.weburl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#00c805] hover:underline max-w-[140px] truncate"
                    >
                      {profile.weburl.replace('https://', '').replace('www.', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Execution Panel */}
        <div className="space-y-6">
          <div className="rounded-xl bg-[#151a26] border border-[#222b3e] overflow-hidden">
            <div className="grid grid-cols-2 text-center text-xs font-bold border-b border-[#222b3e] select-none">
              <button
                onClick={() => {
                  setTradeType('BUY');
                  setTradeError(null);
                }}
                className={`py-3.5 transition-all cursor-pointer ${
                  tradeType === 'BUY'
                    ? 'bg-[#00c805]/10 text-[#00c805] border-b-2 border-[#00c805] font-extrabold'
                    : 'text-[#8a9fc2] hover:text-white bg-[#1c2333]/20'
                }`}
              >
                BUY {symbol.toUpperCase()}
              </button>
              <button
                onClick={() => {
                  setTradeType('SELL');
                  setTradeError(null);
                }}
                className={`py-3.5 transition-all cursor-pointer ${
                  tradeType === 'SELL'
                    ? 'bg-[#ff3b30]/10 text-[#ff3b30] border-b-2 border-[#ff3b30] font-extrabold'
                    : 'text-[#8a9fc2] hover:text-white bg-[#1c2333]/20'
                }`}
              >
                SELL {symbol.toUpperCase()}
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8a9fc2] bg-[#0b0e14]/40 p-2.5 rounded border border-[#222b3e]/40">
                <span>Owned Shares:</span>
                <span className="font-bold text-white">{ownedShares} shares</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">Share Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter share count"
                  value={sharesInput}
                  onChange={(e) => {
                    setSharesInput(e.target.value);
                    setTradeError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0e14] border border-[#222b3e] text-sm text-white placeholder:text-[#8a9fc2] outline-none focus:border-[#00c805]/40"
                />
              </div>

              <div className="space-y-3 pt-2 text-xs border-t border-[#222b3e]/40">
                <div className="flex justify-between text-[#8a9fc2]">
                  <span>Execution Price:</span>
                  <span className="font-medium text-white">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#222b3e]/30 pt-2 text-sm text-white">
                  <span>Estimated {tradeType === 'BUY' ? 'Cost' : 'Proceeds'}:</span>
                  <span>${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {tradeType === 'BUY' && !canBuy && enteredShares > 0 && (
                <div className="flex gap-2 p-2.5 rounded bg-[#ff3b30]/10 border border-[#ff3b30]/25 text-[11px] text-[#ff3b30]">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Insufficient cash balance.</span>
                </div>
              )}
              {tradeType === 'SELL' && !canSell && enteredShares > 0 && (
                <div className="flex gap-2 p-2.5 rounded bg-[#ff3b30]/10 border border-[#ff3b30]/25 text-[11px] text-[#ff3b30]">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Insufficient owned shares to sell.</span>
                </div>
              )}
              {tradeError && (
                <div className="p-2.5 rounded bg-[#ff3b30]/10 border border-[#ff3b30]/25 text-[11px] text-[#ff3b30] text-center">
                  {tradeError}
                </div>
              )}

              <button
                type="submit"
                disabled={isExecuting || isFormInvalid}
                className={`w-full font-bold py-3 mt-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  tradeType === 'BUY'
                    ? 'bg-[#00c805] hover:bg-[#00c805]/90 text-[#0b0e14]'
                    : 'bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white'
                }`}
              >
                {isExecuting ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    <span>Execute {tradeType} Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-4 bg-[#151a26] border border-[#222b3e] rounded-xl flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-[#00c805] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Paper Trading Sandbox</p>
              <p className="text-[10px] text-[#8a9fc2] leading-relaxed">
                Orders are executed instantly using simulated virtual funds. No real capital is ever risked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Success Overlay Modal */}
      <AnimatePresence>
        {showSuccessModal && executedTradeDetails && (
          <div className="fixed inset-0 bg-[#0b0e14]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-[#222b3e] bg-[#151a26] p-6 shadow-2xl space-y-6 glow-bull"
            >
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-[#00c805]/10 flex items-center justify-center text-[#00c805] mx-auto mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Order Executed Successfully</h3>
                <p className="text-xs text-[#8a9fc2]">Paper trade ledger recorded</p>
              </div>

              <div className="bg-[#0b0e14]/60 border border-[#222b3e] p-4 rounded-xl space-y-3.5 text-xs text-white">
                <div className="flex justify-between">
                  <span className="text-[#8a9fc2]">Security:</span>
                  <span className="font-bold">{executedTradeDetails.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a9fc2]">Order Action:</span>
                  <span className={`font-bold uppercase ${executedTradeDetails.type === 'BUY' ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
                    {executedTradeDetails.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a9fc2]">Shares:</span>
                  <span className="font-semibold">{executedTradeDetails.shares} shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a9fc2]">Execution Price:</span>
                  <span className="font-semibold">${executedTradeDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[#222b3e]/40 pt-2 text-sm">
                  <span className="text-[#8a9fc2] font-normal">Total {executedTradeDetails.type === 'BUY' ? 'Cost' : 'Proceeds'}:</span>
                  <span className="font-bold text-[#00c805]">${executedTradeDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#00c805] text-[#0b0e14] font-bold py-2.5 rounded-lg hover:bg-[#00c805]/90 transition-all text-xs cursor-pointer"
              >
                Dismiss Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockDetails;
