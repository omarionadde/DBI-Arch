import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';
import { getRecentInvestments, getStats } from '../services/investmentService';
import { InvestmentRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0 });
  const [recentInvestments, setRecentInvestments] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [s, r] = await Promise.all([getStats(), getRecentInvestments(8)]);
        setStats(s);
        setRecentInvestments(r);
      } catch (error) {
        console.error("Dashboard load error", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="font-display font-medium text-slate-400 animate-pulse">Syncing Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Dashboard
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Welcome back, {profile?.displayName} • Monitoring {stats.total} total records.
          </p>
        </div>
        
        <Link 
          to="/investments" 
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg font-bold text-sm shadow-blue-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span>New Investment</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {[
          { title: 'Total Investments', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { title: 'Active Accounts', value: recentInvestments.filter(i => i.status === 'Active').length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { title: 'System Nodes', value: stats.total, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">{stat.title}</p>
            <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white">
              {stat.value.toString().padStart(2, '0')}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Recent Records
            </h2>
            <Link to="/archive" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-8 py-4">S/N</th>
                  <th className="px-8 py-4">Full Name</th>
                  <th className="px-8 py-4">Account</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentInvestments.slice(0, 8).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-4 font-mono text-xs text-slate-400">{inv.serialNo}</td>
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase truncate max-w-[200px]">{inv.fullName}</p>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 font-mono italic">{inv.accountNo}</td>
                    <td className="px-8 py-4 text-right">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                        inv.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
