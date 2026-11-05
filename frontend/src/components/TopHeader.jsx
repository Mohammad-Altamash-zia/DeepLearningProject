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
  User
} from 'lucide-react';

export default function TopHeader({ 
  cameraStatus, 
  modelLoaded, 
  isInspecting, 
  onStartInspection, 
  onStopInspection,
  systemHealth
}) {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* Left: Rounded Search Bar & Filter Dropdown */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        {/* Search Input Bar */}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inspections, defect tags, batch ID..."
            className="w-full bg-slate-100/80 border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="appearance-none bg-slate-100/80 hover:bg-slate-200/60 text-slate-700 text-xs font-medium rounded-full pl-3 pr-7 py-1.5 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
          >
            <option value="all">All Severstal Classes</option>
            <option value="pass">Passed Yield</option>
            <option value="fail">Defect Flawed</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Camera & Model Health Quick Indicators */}
        <div className="hidden xl:flex items-center space-x-2 pl-2">
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            cameraStatus === 'Connected' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{cameraStatus === 'Connected' ? 'Webcam Live' : cameraStatus}</span>
          </div>

          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            modelLoaded 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <Cpu className="w-3 h-3" />
            <span>{modelLoaded ? 'YOLO11n Active' : 'Model Off'}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications, Clock, Prominent Primary Action Button & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Live Clock Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Notification Bell */}
        <button
          title="Inspection Alerts & Notifications"
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* Prominent Primary Action Button */}
        {isInspecting ? (
          <button
            onClick={onStopInspection}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Inspection</span>
          </button>
        ) : (
          <button
            onClick={onStartInspection}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-all text-xs font-bold uppercase tracking-wider active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Inspection</span>
          </button>
        )}

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Badge */}
        <div className="flex items-center space-x-2.5 pl-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            QA
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-800 block leading-tight group-hover:text-blue-600 transition-colors">
              Fardeen Lead
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight font-medium">
              Lead QA Engineer
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
