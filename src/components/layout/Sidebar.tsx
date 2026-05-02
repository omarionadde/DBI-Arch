import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Archive, 
  BarChart3, 
  ShieldAlert,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const { profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Investments', icon: FileText, path: '/investments' },
    { name: 'Archive', icon: Archive, path: '/archive' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    ...(profile?.role === 'admin' ? [
      { name: 'Audit Logs', icon: ShieldAlert, path: '/logs' },
    ] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out lg:relative",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isExpanded ? "w-64" : "w-64 lg:w-20"
        )}
      >
        <div className="flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-20">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText className="text-white w-5 h-5" />
              </div>
              <motion.span 
                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
                className="font-display font-bold text-xl text-slate-900 dark:text-white whitespace-nowrap"
              >
                IMS 2026
              </motion.span>
            </div>
            <button className="lg:hidden" onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center group relative h-12 rounded-xl transition-all duration-200",
                  "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "flex-shrink-0 w-14 flex items-center justify-center transition-colors",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                    )}>
                      <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
                    </div>
                    
                    <motion.span 
                      animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                      className={cn(
                        "font-medium whitespace-nowrap absolute left-14 transition-colors",
                        isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                      )}
                    >
                      {item.name}
                    </motion.span>

                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Section Info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className={cn(
              "flex items-center transition-all duration-300",
              isExpanded ? "space-x-3" : "justify-center"
            )}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-md bg-slate-200 dark:bg-slate-800">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                      {profile?.displayName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full shadow-sm" />
              </div>
              
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {profile?.displayName || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-semibold uppercase tracking-wider">
                    {profile?.role}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
