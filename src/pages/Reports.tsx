import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getAllInvestments } from '../services/investmentService';
import { ACCOUNT_TYPES, SYSTEM_TYPES, INVESTMENT_STATUSES } from '../constants';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filters, setFilters] = useState({
    account: '',
    systemType: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const generateReport = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      let data = await getAllInvestments();

      if (filters.account) {
        data = data.filter(d => d.accountType === filters.account);
      }
      if (filters.systemType) {
        data = data.filter(d => d.systemType === filters.systemType);
      }
      if (filters.status) {
        data = data.filter(d => d.status === filters.status);
      }
      if (filters.startDate) {
        data = data.filter(d => d.date >= filters.startDate);
      }
      if (filters.endDate) {
        data = data.filter(d => d.date <= filters.endDate);
      }

      const excelData = data.map((d) => ({
        'S/N': d.serialNo,
        'Full Name': d.fullName,
        'Account No': d.accountNo,
        'Account Type': d.accountType,
        'Product Type': d.productType,
        'System Type': d.systemType,
        'Date': d.date,
        'Status': d.status,
        'Registered By': d.uploadedBy,
        'Created At': d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Investments');

      const fileName = `Invest_Archive_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 px-4">
      <div className="space-y-1">
        <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
          System Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          Generate and export comprehensive archive reports
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 lg:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Filter</label>
          <select 
            value={filters.account} 
            onChange={e => setFilters({...filters, account: e.target.value})}
            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-2xl outline-none font-bold text-sm uppercase tracking-wide cursor-pointer transition-all"
          >
            <option value="">All Account Archetypes</option>
            {ACCOUNT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Core</label>
            <select 
              value={filters.systemType} 
              onChange={e => setFilters({...filters, systemType: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-2xl outline-none font-bold text-xs uppercase cursor-pointer transition-all"
            >
              <option value="">All Architectures</option>
              {SYSTEM_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Operational State</label>
            <select 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-2xl outline-none font-bold text-xs uppercase cursor-pointer transition-all"
            >
              <option value="">All Execution States</option>
              {INVESTMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Temporal Start</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-2xl outline-none font-mono text-xs cursor-text transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Temporal End</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/30 rounded-2xl outline-none font-mono text-xs cursor-text transition-all" />
          </div>
        </div>

        <button 
          onClick={generateReport}
          disabled={loading}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : success ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Export Complete</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Download Excel Report</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
