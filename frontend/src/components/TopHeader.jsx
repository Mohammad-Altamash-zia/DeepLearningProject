import React, { useState, useEffect } from 'react';
import { Play, Square, Video, Cpu, Server, Clock } from 'lucide-react';

export default function TopHeader({ 
  cameraStatus, 
  modelLoaded, 
  isInspecting, 
  onStartInspection, 
  onStopInspection,
  systemHealth
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCameraBadge = (status) => {
    switch (status) {
      case 'Connected':
        return { text: 'CAM ONLINE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'Connecting':
      case 'Reconnecting':
        return { text: status.toUpperCase(), color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' };
      case 'Error':
        return { text: 'CAM ERROR', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
      default:
        return { text: 'CAM OFFLINE', color: 'bg-industrial-800 text-industrial-400 border-industrial-700' };
    }
  };

  const camBadge = formatCameraBadge(cameraStatus);

  return (
    <header className="h-16 bg-industrial-900 border-b border-industrial-800 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Quick Status Badges */}
      <div className="flex items-center space-x-3">
        {/* Camera Status Badge */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${camBadge.color}`}>
          <Video className="w-3.5 h-3.5" />
          <span>{camBadge.text}</span>
        </div>

        {/* Model Status Badge */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
          modelLoaded 
            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          <Cpu className="w-3.5 h-3.5" />
          <span>{modelLoaded ? 'YOLO11n READY' : 'MODEL ERROR'}</span>
        </div>

        {/* Server Diagnostic */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-industrial-850 text-industrial-300 border border-industrial-700">
          <Server className="w-3.5 h-3.5 text-industrial-400" />
          <span>{systemHealth?.memory_mb ? `${systemHealth.memory_mb} MB RAM` : 'FASTAPI WAL'}</span>
        </div>
      </div>

      {/* Right: Inspection Controls & Live Clock */}
      <div className="flex items-center space-x-4">
        {/* Live Clock */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-industrial-400 bg-industrial-950 px-3 py-1.5 rounded border border-industrial-800">
          <Clock className="w-3.5 h-3.5 text-industrial-500" />
          <span>{time.toLocaleTimeString()}</span>
          <span className="text-industrial-600">|</span>
          <span>{time.toLocaleDateString()}</span>
        </div>

        {/* Start / Stop Inspection Button */}
        {isInspecting ? (
          <button
            onClick={onStopInspection}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Inspection</span>
          </button>
        ) : (
          <button
            onClick={onStartInspection}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Inspection</span>
          </button>
        )}
      </div>
    </header>
  );
}

