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
  Activity,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, cameraStatus, isInspecting }) {
  const menuSections = [
    {
      title: 'MONITORING',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'live', label: 'Live Inspection', icon: Camera, badge: isInspecting ? 'LIVE' : null },
        { id: 'history', label: 'Inspection History', icon: History },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'settings', label: 'Camera Settings', icon: Sliders },
        { id: 'system', label: 'System Diagnostics', icon: Cpu },
        { id: 'about', label: 'About InspectAI', icon: Info },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">
                  Inspect<span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Quality Inspection OS</p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Sections */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase font-sans">
                {section.title}
              </h4>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold tracking-wider animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Telemetry Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Hardware Stream
            </span>
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              <span className={`text-[11px] font-semibold ${cameraStatus === 'Connected' ? 'text-emerald-600' : 'text-slate-500'}`}>
                {cameraStatus}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[9px]">ENGINE</span>
              <span className="font-bold text-slate-700">YOLO11n</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[9px]">BUFFER</span>
              <span className="font-bold text-slate-700">100s Disc</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
