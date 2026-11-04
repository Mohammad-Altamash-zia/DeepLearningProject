import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  History, 
  BarChart3, 
  Sliders, 
  Cpu, 
  Info,
  ShieldCheck,
  Radio
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, cameraStatus, isInspecting }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Inspection', icon: Camera, badge: isInspecting ? 'LIVE' : null },
    { id: 'history', label: 'Inspection History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Camera Settings', icon: Sliders },
    { id: 'system', label: 'System Status', icon: Cpu },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-64 bg-industrial-900 border-r border-industrial-800 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-white tracking-wider text-base">INSPECT<span className="text-cyan-400">AI</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-industrial-800 text-cyan-300 font-medium border border-industrial-700">v1.0</span>
              </div>
              <p className="text-[11px] text-industrial-500 font-medium">Quality Inspection</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-industrial-400 hover:text-industrial-200 hover:bg-industrial-850 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-industrial-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-crimson-500/20 text-red-400 border border-red-500/40 font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-4 border-t border-industrial-800 bg-industrial-950/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-industrial-500 font-medium">System Telemetry</span>
          <span className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-industrial-400 font-mono text-[11px]">{cameraStatus}</span>
          </span>
        </div>
        <div className="bg-industrial-900 border border-industrial-800 rounded p-2 text-[11px] font-mono text-industrial-400 space-y-1">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="text-cyan-400">YOLO11n-ONNX</span>
          </div>
          <div className="flex justify-between">
            <span>Engine:</span>
            <span className="text-industrial-300">ORT-CPU</span>
          </div>
          <div className="flex justify-between">
            <span>Buffer:</span>
            <span className="text-industrial-300">100s Rolling</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

