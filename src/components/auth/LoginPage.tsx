import React from 'react';
import { FileText, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { signIn, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-blue-500/20">
            <FileText className="text-white w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          DocuArch Management System
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Secure enterprise document archive and management.
        </p>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          <span>Sign in with Google</span>
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <div>Secure</div>
            <div>Audited</div>
            <div>Compliant</div>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-8 text-sm text-slate-400">
        © 2026 DocuArch Co. All rights reserved.
      </p>
    </div>
  );
}
