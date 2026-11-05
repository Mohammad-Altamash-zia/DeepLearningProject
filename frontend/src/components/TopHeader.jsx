import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Search, 
  Filter, 
  Bell, 
  Video, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  ChevronDown,
  User,
  Sun,
  Moon
} from 'lucide-react';

export default function TopHeader({ 
  cameraStatus, 
  modelLoaded, 
  isInspecting, 
  onStartInspection, 
  onStopInspection,
  systemHealth,
  isDarkMode,
  onToggleDarkMode
}) {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 select-none z-10 transition-colors duration-200">
      {/* Left: Rounded Search Bar & Filter Dropdown */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        {/* Search Input Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inspections, defect tags, batch ID..."
            className="w-full bg-slate-100/90 dark:bg-slate-800/90 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-850 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="appearance-none bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-full pl-3 pr-7 py-1.5 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
          >
            <option value="all">All Severstal Classes</option>
            <option value="pass">Passed Yield</option>
            <option value="fail">Defect Flawed</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Camera & Model Health Quick Indicators */}
        <div className="hidden xl:flex items-center space-x-2 pl-2">
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            cameraStatus === 'Connected' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{cameraStatus === 'Connected' ? 'Webcam Live' : cameraStatus}</span>
          </div>

          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            modelLoaded 
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50' 
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
          }`}>
            <Cpu className="w-3 h-3" />
            <span>{modelLoaded ? 'YOLO11n Active' : 'Model Off'}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Dark Mode Toggle, Notifications, Clock, Primary Button & Profile */}
      <div className="flex items-center space-x-3.5">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-squircle bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-amber-400 transition-all flex items-center justify-center border border-slate-200/60 dark:border-slate-700"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-200" />
          )}
        </button>

        {/* Live Clock Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="font-mono">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Notification Bell */}
        <button
          title="Inspection Alerts & Notifications"
          className="relative p-2 rounded-squircle hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* Prominent Primary Action Button */}
        {isInspecting ? (
          <button
            onClick={onStopInspection}
            className="flex items-center space-x-2 px-4 py-2 rounded-squircle bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Inspection</span>
          </button>
        ) : (
          <button
            onClick={onStartInspection}
            className="flex items-center space-x-2 px-5 py-2 rounded-squircle bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Inspection</span>
          </button>
        )}

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile Badge */}
        <div className="flex items-center space-x-2.5 pl-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-squircle bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            QA
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight group-hover:text-blue-500 transition-colors">
              Fardeen Lead
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight font-medium">
              Lead QA Engineer
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
