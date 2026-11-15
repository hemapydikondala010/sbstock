import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Newspaper,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchStart, fetchDashboardSuccess, fetchFailure } from '../store/slices/portfolioSlice.js';
import api from '../services/api.js';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.portfolio);

  const getDashboard = async () => {
    dispatch(fetchStart());
    try {
      const response = await api.get('/portfolio/dashboard');
      dispatch(fetchDashboardSuccess(response.data));
    } catch (err) {
      dispatch(fetchFailure(err.response?.data?.message || 'Failed to fetch dashboard.'));
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const {
    cashBalance = 100000,
    totalStockValue = 0,
    portfolioValue = 100000,
    totalProfitLoss = 0,
    totalProfitLossPercent = 0,
    todayProfitLoss = 0,
    todayProfitLossPercent = 0,
    holdings = [],
    history = [],
  } = data;

  const isProfit = totalProfitLoss >= 0;
  const isTodayProfit = todayProfitLoss >= 0;

  const chartData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Value: item.value,
  }));

  const mockNews = [
    {
      id: 1,
      headline: 'Tech sector surges as key inflation indexes cool off in Federal Reserve review',
      source: 'Market Watch',
      time: '1h ago',
    },
    {
      id: 2,
      headline: 'SB Stocks platform logs record paper trading volume with rising retail interest',
      source: 'Fintech Daily',
      time: '3h ago',
    },
    {
      id: 3,
      headline: 'US Treasury bond yields settle lower ahead of upcoming CPI data release next week',
      source: 'Bloomberg',
      time: '5h ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="text-xs text-[#8a9fc2] mt-1">Real-time overview of your virtual investment assets</p>
        </div>
        <button
          onClick={getDashboard}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-[#8a9fc2] hover:text-white px-3 py-2 rounded-lg bg-[#151a26] border border-[#222b3e] hover:bg-[#1c2333] transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#8a9fc2]">
              <span className="text-xs font-bold uppercase tracking-wider">Portfolio Value</span>
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-3">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold mt-4 ${isProfit ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
            {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            <span>
              ${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalProfitLossPercent.toFixed(2)}%)
            </span>
            <span className="text-[#8a9fc2] font-normal ml-1">all-time</span>
          </div>
        </motion.div>

        {/* Today's Profit/Loss */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#8a9fc2]">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Returns</span>
              {isTodayProfit ? <TrendingUp className="h-4 w-4 text-[#00c805]" /> : <TrendingDown className="h-4 w-4 text-[#ff3b30]" />}
            </div>
            <h2 className={`text-2xl font-extrabold mt-3 ${isTodayProfit ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
              {isTodayProfit ? '+' : '-'}
              ${Math.abs(todayProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold mt-4 ${isTodayProfit ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
            <span>{todayProfitLossPercent.toFixed(2)}%</span>
            <span className="text-[#8a9fc2] font-normal ml-1">since yesterday</span>
          </div>
        </motion.div>

        {/* Available Virtual Cash */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#8a9fc2]">
              <span className="text-xs font-bold uppercase tracking-wider">Available Cash</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-3">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="text-xs text-[#8a9fc2] mt-4 flex items-center gap-1">
            <span>Buying Power Reserve</span>
          </div>
        </motion.div>

        {/* Total Stock Investments */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#8a9fc2]">
              <span className="text-xs font-bold uppercase tracking-wider">Stocks Value</span>
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-3">
              ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="text-xs text-[#8a9fc2] mt-4 flex items-center gap-1">
            <span>Invested in {holdings.length} stocks</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Charts & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Line Chart */}
        <div className="lg:col-span-2 rounded-xl bg-[#151a26] border border-[#222b3e] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Portfolio Performance</h3>
            <span className="text-xs text-[#8a9fc2]">Last 30 Days</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c805" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00c805" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#8a9fc2"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8a9fc2"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151a26',
                    borderColor: '#222b3e',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#00c805' }}
                  formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="Value"
                  stroke="#00c805"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Market News */}
        <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-[#222b3e] pb-3 mb-4">
            <Newspaper className="h-4 w-4 text-[#00c805]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Market Headlines</h3>
          </div>

          <div className="space-y-4 flex-1">
            {mockNews.map((news) => (
              <div key={news.id} className="border-b border-[#222b3e]/40 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-white hover:text-[#00c805] transition-colors cursor-pointer line-clamp-2">
                  {news.headline}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[#8a9fc2]">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
