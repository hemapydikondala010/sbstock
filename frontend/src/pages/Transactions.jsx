import React, { useState, useEffect } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../services/api.js';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const getTransactions = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/trade/transactions?page=${pageNumber}&limit=10`);
      setTransactions(response.data.transactions);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to get transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransactions(page);
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Ledger</h1>
          <p className="text-xs text-[#8a9fc2] mt-1">Chronological history of your paper trading executions</p>
        </div>
        <button
          onClick={() => getTransactions(page)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#151a26] border border-[#222b3e] rounded-lg text-xs font-semibold text-[#8a9fc2] hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-[#0b0e14]/60 border border-[#222b3e]/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-[#8a9fc2] space-y-3">
            <History className="h-10 w-10 mx-auto text-[#8a9fc2]/60" />
            <p className="text-sm">No transaction records found.</p>
            <p className="text-xs">Execute BUY or SELL orders on any stock to view trade history here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#8a9fc2] border-b border-[#222b3e] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Type</th>
                  <th className="pb-3 font-bold">Symbol</th>
                  <th className="pb-3 font-bold text-right">Shares</th>
                  <th className="pb-3 font-bold text-right">Execution Price</th>
                  <th className="pb-3 font-bold text-right">Total Value</th>
                  <th className="pb-3 font-bold text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222b3e]/40">
                {transactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <tr key={tx._id} className="hover:bg-[#0b0e14]/50 transition-colors">
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isBuy ? 'bg-[#00c805]/10 text-[#00c805]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                          }`}
                        >
                          {isBuy ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-white">{tx.symbol}</td>
                      <td className="py-3.5 text-right font-medium text-white">{tx.shares}</td>
                      <td className="py-3.5 text-right text-white">${tx.price.toFixed(2)}</td>
                      <td className="py-3.5 text-right font-bold text-white">${tx.totalAmount.toFixed(2)}</td>
                      <td className="py-3.5 text-right text-[#8a9fc2]">
                        {new Date(tx.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#222b3e] pt-4">
            <span className="text-xs text-[#8a9fc2]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-[#0b0e14] border border-[#222b3e] hover:bg-[#1c2333] disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-[#0b0e14] border border-[#222b3e] hover:bg-[#1c2333] disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
