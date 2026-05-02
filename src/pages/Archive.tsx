import React, { useEffect, useState } from 'react';
import { Folder, ChevronRight, Users, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { ACCOUNT_TYPES } from '../constants';
import { getAllInvestments } from '../services/investmentService';
import { InvestmentRecord } from '../types';

export default function Archive() {
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAllInvestments();
        let filtered = data;
        if (activeAccount) {
          filtered = data.filter(i => i.accountType === activeAccount);
        }
        setInvestments(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeAccount]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="space-y-1 px-4">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Archive
        </motion.h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          Historical records by account category
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className="lg:col-span-3 space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categories</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-2 space-y-1">
            <button 
              onClick={() => setActiveAccount(null)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-tight ${
                activeAccount === null 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>All Records</span>
              </div>
            </button>

            {ACCOUNT_TYPES.map((acc) => (
              <button 
                key={acc}
                onClick={() => setActiveAccount(acc)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-tight ${
                  activeAccount === acc 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <CreditCard className="w-4 h-4" />
                  <span className="truncate">{acc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-baseline justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeAccount || 'Global View'}
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{investments.length} Entries</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-4">SN</th>
                    <th className="px-8 py-4">Full Name</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={3} className="px-8 py-8 animate-pulse bg-slate-50/10" /></tr>
                    ))
                  ) : investments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-32 text-center text-slate-500 font-display font-medium text-xl uppercase tracking-widest opacity-20">Zero records detected</td>
                    </tr>
                  ) : (
                    investments.map(inv => (
                      <tr key={inv.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="px-8 py-6">
                           <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{inv.serialNo}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{inv.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">{inv.accountNo}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={`text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest ${
                            inv.status === 'Active' 
                              ? 'text-emerald-500 bg-emerald-50' 
                              : 'text-rose-500 bg-rose-50'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
