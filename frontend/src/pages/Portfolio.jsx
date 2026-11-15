import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  PieChart as PieIcon,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../services/api.js';

const COLORS = ['#00c805', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const Portfolio = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHoldings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/portfolio/holdings');
      setData(response.data);
    } catch (err) {
      console.error('Failed to get holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHoldings();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-[75vh] items-center justify-center bg-[#0b0e14] text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#00c805] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#8a9fc2]">Calculating portfolio asset values...</p>
        </div>
      </div>
    );
  }

  const { cashBalance = 0, totalStockValue = 0, netWorth = 0, holdings = [] } = data;

  const pieData = [
    { name: 'Cash', value: cashBalance },
    ...holdings.map((h) => ({ name: h.symbol, value: h.currentValue })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Portfolio Holdings</h1>
          <p className="text-xs text-[#8a9fc2] mt-1">Breakdown of asset values, profit/loss margins, and capital allocation</p>
        </div>
        <button
          onClick={getHoldings}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#151a26] border border-[#222b3e] rounded-lg text-xs font-semibold text-[#8a9fc2] hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] space-y-2">
          <div className="flex items-center justify-between text-[#8a9fc2]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Net Asset Value</span>
            <Briefcase className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8a9fc2]">Aggregate cash balance + securities</p>
        </div>

        <div className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] space-y-2">
          <div className="flex items-center justify-between text-[#8a9fc2]">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Assets Value</span>
            <Layers className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8a9fc2]">Total valuation across {holdings.length} holdings</p>
        </div>

        <div className="p-5 rounded-xl bg-[#151a26] border border-[#222b3e] space-y-2">
          <div className="flex items-center justify-between text-[#8a9fc2]">
            <span className="text-xs font-bold uppercase tracking-wider">Cash Reserves</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white">
            ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#8a9fc2]">Available liquid trading capital</p>
        </div>
      </div>

      {/* Main Grid: Pie Chart & Holdings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Card */}
        <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#222b3e] pb-3">
            <PieIcon className="h-4 w-4 text-[#00c805]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Asset Allocation</h2>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#151a26', borderColor: '#222b3e', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8a9fc2' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Holdings Table */}
        <div className="lg:col-span-2 rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#222b3e] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Your Securities</h2>
            <span className="text-xs text-[#8a9fc2]">{holdings.length} Assets</span>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-16 text-[#8a9fc2] space-y-3">
              <p className="text-sm">You do not own any stocks yet.</p>
              <button
                onClick={() => navigate('/market')}
                className="bg-[#00c805] text-[#0b0e14] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#00c805]/90 transition-all cursor-pointer"
              >
                Go to Market
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#8a9fc2] border-b border-[#222b3e] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-bold">Asset</th>
                    <th className="pb-3 font-bold text-right">Shares</th>
                    <th className="pb-3 font-bold text-right">Avg Cost</th>
                    <th className="pb-3 font-bold text-right">Current Price</th>
                    <th className="pb-3 font-bold text-right">Total Value</th>
                    <th className="pb-3 font-bold text-right">Gain / Loss</th>
                    <th className="pb-3 font-bold text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222b3e]/40">
                  {holdings.map((h) => {
                    const isProfit = h.profitLoss >= 0;
                    return (
                      <tr
                        key={h.id}
                        onClick={() => navigate(`/stock/${h.symbol}`)}
                        className="hover:bg-[#0b0e14]/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5">
                          <span className="font-bold text-white group-hover:text-[#00c805] transition-colors">
                            {h.symbol}
                          </span>
                          <span className="block text-[10px] text-[#8a9fc2] max-w-[120px] truncate">
                            {h.companyName}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-medium text-white">{h.shares}</td>
                        <td className="py-3.5 text-right text-white">${h.avgBuyPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-right font-bold text-white">${h.currentPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-right font-bold text-white">${h.currentValue.toFixed(2)}</td>
                        <td className={`py-3.5 text-right font-bold ${isProfit ? 'text-[#00c805]' : 'text-[#ff3b30]'}`}>
                          {isProfit ? '+' : ''}${h.profitLoss.toFixed(2)} ({h.profitLossPercent.toFixed(2)}%)
                        </td>
                        <td className="py-3.5 text-right text-[#8a9fc2]">{h.allocationPercent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
