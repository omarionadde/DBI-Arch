import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Trash2,
  X,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllInvestments, registerInvestment, deleteInvestment } from '../services/investmentService';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InvestmentRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ACCOUNT_TYPES, INVESTMENT_STATUSES, SYSTEM_TYPES, PRODUCT_TYPES } from '../constants';
import { format } from 'date-fns';

export default function InvestmentList() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    serialNo: '',
    fullName: '',
    accountNo: '',
    accountType: ACCOUNT_TYPES[0],
    productType: PRODUCT_TYPES[0],
    systemType: SYSTEM_TYPES[0] as 'ORACLE' | 'MIZAN',
    date: new Date().toISOString().split('T')[0],
    status: 'Active' as const
  });

  useEffect(() => {
    loadInvestments();
  }, [statusFilter]);

  async function loadInvestments() {
    setLoading(true);
    try {
      const data = await getAllInvestments({
        status: statusFilter || undefined,
        search: search
      });
      setInvestments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvestments();
  };

  const handleOpenEdit = (item: InvestmentRecord) => {
    setEditingId(item.id);
    setFormData({
      serialNo: item.serialNo,
      fullName: item.fullName,
      accountNo: item.accountNo,
      accountType: item.accountType,
      productType: item.productType,
      systemType: item.systemType,
      date: item.date,
      status: item.status
    });
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'investments', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        showToast('Record updated successfully');
      } else {
        await registerInvestment(
          {
            ...formData,
            uploadedBy: profile.displayName || profile.email || 'Unknown',
            uploaderId: profile.uid,
          },
          profile.uid,
          profile.displayName || 'System'
        );
        showToast('Investment record saved');
      }
      
      setShowModal(false);
      setEditingId(null);
      loadInvestments();
      setFormData({
        serialNo: '',
        fullName: '',
        accountNo: '',
        accountType: ACCOUNT_TYPES[0],
        productType: PRODUCT_TYPES[0],
        systemType: SYSTEM_TYPES[0],
        date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
    } catch (e) {
      console.error(e);
      showToast('Error saving record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (record: InvestmentRecord) => {
    if (!confirm(`Confirm delete for "${record.fullName}"?`)) return;
    if (!profile) return;

    try {
      await deleteInvestment(record.id, profile.uid, profile.displayName || 'System', record.fullName);
      loadInvestments();
      showToast('Record deleted');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Investment List
          </motion.h1>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              TOTAL RECORDS: {investments.length}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              SYSTEM SECURE
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg font-bold text-sm shadow-blue-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filters (Clean Bar) */}
      <div className="px-4">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-xl transition-all text-sm outline-none"
            />
          </form>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-blue-500/30 rounded-xl text-xs font-bold uppercase tracking-wider outline-none transition-all cursor-pointer"
            >
              <option value="">Status: All</option>
              {INVESTMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-8 py-5">SN</th>
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Account Details</th>
                  <th className="px-8 py-5">System</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-8 py-10 animate-pulse bg-slate-50/10" /></tr>
                ))
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-display text-lg uppercase font-bold tracking-widest opacity-20">No records found</td>
                </tr>
              ) : (
                investments.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{item.serialNo}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight tracking-tight">{item.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{item.accountType}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{item.accountNo}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="w-fit text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                          {item.productType}
                        </span>
                        <span className={`w-fit text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.systemType === 'ORACLE' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {item.systemType}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{format(new Date(item.date), 'MMM dd, yyyy')}</p>
                        <span className={`w-fit mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          item.status === 'Active' ? 'text-emerald-500 border-emerald-500/30' : 'text-rose-500 border-rose-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleOpenEdit(item)} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-[10px] uppercase hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-md"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item)} 
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowModal(false); setEditingId(null); }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative w-full max-w-xl glass rounded-[3rem] p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] -mr-16 -mt-16" />
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingId ? 'Edit' : 'New'} <span className="text-blue-600">Investment</span>
                </h2>
                <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Serial Number</label>
                    <input required type="text" value={formData.serialNo} onChange={e => setFormData({...formData, serialNo: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-mono text-sm" placeholder="SN-001" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Type</label>
                    <select value={formData.systemType} onChange={e => setFormData({...formData, systemType: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-bold text-xs uppercase cursor-pointer">
                      {SYSTEM_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-bold uppercase" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                    <input required type="text" value={formData.accountNo} onChange={e => setFormData({...formData, accountNo: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-mono text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                    <select value={formData.accountType} onChange={e => setFormData({...formData, accountType: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-bold text-xs uppercase cursor-pointer">
                      {ACCOUNT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Type</label>
                    <select value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-bold text-xs uppercase cursor-pointer">
                      {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-mono text-sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500/30 rounded-xl outline-none font-bold text-xs uppercase cursor-pointer">
                    {INVESTMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-50 hover:bg-blue-700 transition-all">
                    {isSubmitting ? 'Saving...' : editingId ? 'Update Investment' : 'Save Investment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
