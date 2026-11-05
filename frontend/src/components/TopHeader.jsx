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
  Moon,
  ShieldCheck,
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  Sliders,
  Info
} from 'lucide-react';

export default function TopHeader({ 
  activeTab,
  setActiveTab,
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Inspection', icon: Camera, badge: isInspecting ? 'LIVE' : null },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'system', label: 'Diagnostics', icon: Cpu },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-warm-100/95 dark:bg-darkwarm-bg/95 backdrop-blur-md border-b border-warm-200/80 dark:border-darkwarm-border transition-colors duration-200 px-4 lg:px-8 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand Identity & Smooth Header Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('live')}>
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 dark:bg-warm-100 text-white dark:text-charcoal-900 flex items-center justify-center shadow-tactile transition-transform hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-neon-lime-accent dark:text-charcoal-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-charcoal-900 dark:text-warm-100 tracking-tight text-base font-sans">
                  Inspect<span className="text-neon-lime-dark dark:text-neon-lime-accent">AI</span>
                </span>
                <span className="pill-badge px-2 py-0.5 bg-warm-200/80 dark:bg-darkwarm-card text-charcoal-700 dark:text-warm-300 text-[10px] font-bold border border-warm-300/60 dark:border-darkwarm-border">
                  v1.0
                </span>
                <span className="hidden sm:inline-flex pill-badge px-2 py-0.5 bg-warm-200/50 dark:bg-darkwarm-surface text-charcoal-500 dark:text-darkwarm-text-muted text-[10px] font-medium border border-warm-300/40 dark:border-darkwarm-border">
                  Quality OS
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 dark:text-darkwarm-text-muted font-medium">
                Industrial Vision Workstation
              </p>
            </div>
          </div>

          {/* Mobile Right Controls: Dark Mode & Inspection toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-white dark:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border text-charcoal-700 dark:text-amber-400 shadow-tactile"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isInspecting ? (
              <button
                onClick={onStopInspection}
                className="px-3 py-1.5 rounded-full bg-earth-terracotta text-white text-xs font-bold"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={onStartInspection}
                className="px-3 py-1.5 rounded-full bg-charcoal-900 text-white text-xs font-bold"
              >
                Start
              </button>
            )}
          </div>
        </div>

        {/* Center: Clean Top Navigation featuring Rounded Pill Buttons */}
        <nav className="flex items-center overflow-x-auto py-1 scrollbar-none">
          <div className="inline-flex items-center p-1.5 bg-warm-200/70 dark:bg-darkwarm-surface/90 border border-warm-300/60 dark:border-darkwarm-border rounded-full gap-1 shadow-inner backdrop-blur-sm mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`pill-btn relative flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-charcoal-900 text-white shadow-tactile dark:bg-warm-100 dark:text-charcoal-900'
                      : 'text-charcoal-600 dark:text-darkwarm-text-muted hover:text-charcoal-900 dark:hover:text-warm-100 hover:bg-white/60 dark:hover:bg-darkwarm-card'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neon-lime-accent dark:text-charcoal-900' : 'text-charcoal-400 dark:text-darkwarm-text-muted'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-lime"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right: Hardware Node Badges, Action Button, Dark Mode & User Profile */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* Hardware Stream Node Indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border shadow-tactile text-xs">
            <span className={`w-2 h-2 rounded-full ${
              cameraStatus === 'Connected' 
                ? 'bg-neon-lime ring-4 ring-neon-lime/20 animate-pulse' 
                : 'bg-warm-400 dark:bg-darkwarm-border'
            }`} />
            <span className="text-[11px] font-semibold text-charcoal-700 dark:text-warm-200">
              {cameraStatus === 'Connected' ? 'Webcam Live' : cameraStatus}
            </span>
          </div>

          {/* Model Status Pill */}
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white dark:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border shadow-tactile text-[11px] font-semibold text-charcoal-700 dark:text-warm-200">
            <Cpu className="w-3.5 h-3.5 text-earth-olive" />
            <span>YOLO11n</span>
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Warm Cream Mode' : 'Switch to Dark Charcoal Mode'}
            className="p-2 rounded-full bg-white dark:bg-darkwarm-card hover:bg-warm-50 dark:hover:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border text-charcoal-700 dark:text-amber-400 shadow-tactile transition-all"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-charcoal-600 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Primary Action Button (Start / Stop Inspection) */}
          {isInspecting ? (
            <button
              onClick={onStopInspection}
              className="pill-btn flex items-center space-x-2 px-4 py-2 bg-earth-terracotta hover:bg-red-700 text-white shadow-tactile hover:shadow-tactile-hover text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Inspection</span>
            </button>
          ) : (
            <button
              onClick={onStartInspection}
              className="pill-btn flex items-center space-x-2 px-5 py-2 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile hover:shadow-tactile-hover text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current text-neon-lime-accent dark:text-charcoal-900" />
              <span>Start 1s Cadence</span>
            </button>
          )}

          {/* User Profile Badge */}
          <div className="flex items-center space-x-2 pl-1 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-charcoal-900 to-charcoal-700 dark:from-warm-200 dark:to-warm-400 flex items-center justify-center text-white dark:text-charcoal-900 text-xs font-bold shadow-tactile border border-warm-300 dark:border-darkwarm-border">
              QA
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-bold text-charcoal-900 dark:text-warm-100 block leading-tight">
                Fardeen Lead
              </span>
              <span className="text-[10px] text-charcoal-500 dark:text-darkwarm-text-muted block leading-tight font-medium">
                Quality Assurance
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
