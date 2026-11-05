import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Video, 
  Zap, 
  Layers, 
  Clock,
  Eye,
  Camera,
  GitCommit,
  ListFilter
} from 'lucide-react';
import MetricCards from '../components/MetricCards';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardOverview({ 
  analytics, 
  inspectionTelemetry, 
  defectDist, 
  recentInspections, 
  cameraStatus, 
  isInspecting, 
  onSelectInspection, 
  onNavigate 
}) {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'
  // Earth-tone & Lime color palette for Severstal defect classes
  const classColors = ['#5F6F52', '#A77959', '#C25E3E', '#84CC16'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prominent Page Title with Organic Curvature */}
      <div className="modular-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="pill-badge px-3 py-1 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-semibold border border-warm-300/50">
              Overview
            </span>
            <span className="pill-badge px-3 py-1 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse mr-1.5" />
              Real-Time Inference
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            Quality Assurance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-darkwarm-text-muted mt-1 max-w-2xl">
            Live telemetry stream, automated 1s hardware gating decisions, and continuous Severstal steel defect classification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('live')}
            className="pill-btn flex items-center space-x-2 px-5 py-2.5 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile text-xs font-bold transition-all"
          >
            <Camera className="w-4 h-4 text-neon-lime-accent dark:text-charcoal-900" />
            <span>Open Live Console</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* 1. Primary Executive KPI Cards */}
      <MetricCards analytics={analytics} inspectionTelemetry={inspectionTelemetry} />

      {/* 2. Middle Row: Live Preview & Defect Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live System Preview Card (2 cols) */}
        <div className="lg:col-span-2 modular-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border flex items-center justify-center text-charcoal-700 dark:text-warm-200 shadow-sm">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
                    Live Optical Stream & AI Overlay
                  </h3>
                  <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
                    Synchronized hardware camera & ONNX defect overlay
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('live')}
                className="pill-btn px-4 py-1.5 text-xs font-semibold text-charcoal-800 dark:text-warm-200 bg-warm-100 hover:bg-warm-200/80 dark:bg-darkwarm-surface dark:hover:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border flex items-center space-x-1.5 transition-colors"
              >
                <span>Full Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Camera Stream Thumbnail */}
              <div className="bg-charcoal-950 rounded-2xl overflow-hidden relative aspect-video flex items-center justify-center shadow-inner border border-warm-200/40 dark:border-darkwarm-border group">
                <img
                  src="/api/camera/stream"
                  alt="Live Camera Stream"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-md rounded-full text-[10px] font-mono text-neon-lime-accent border border-white/10 flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-neon-lime animate-ping' : 'bg-charcoal-400'}`} />
                  <span>CAM: {cameraStatus.toUpperCase()}</span>
                </div>
              </div>

              {/* Latest AI Annotated Result */}
              <div className="bg-charcoal-950 rounded-2xl overflow-hidden relative aspect-video flex items-center justify-center shadow-inner border border-warm-200/40 dark:border-darkwarm-border group">
                <img
                  src="/api/images/latest"
                  alt="Latest AI Annotated"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-md rounded-full text-[10px] font-mono text-warm-100 border border-white/10 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-lime" />
                  <span>YOLO11n DETECTIONS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
            <span className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isInspecting ? 'bg-neon-lime animate-pulse' : 'bg-warm-300 dark:bg-darkwarm-border'}`} />
              <span className="font-medium text-charcoal-800 dark:text-warm-200">
                Pipeline: {isInspecting ? '1s Capture Active' : 'Standby / Idle'}
              </span>
            </span>
            <span className="text-charcoal-400 dark:text-darkwarm-text-muted text-[11px] font-mono">
              Rolling 100-Second Local Buffer
            </span>
          </div>
        </div>

        {/* Defect Class Breakdown (1 col) */}
        <div className="modular-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-earth-olive-bg dark:bg-earth-olive/20 border border-earth-olive/30 flex items-center justify-center text-earth-olive shadow-sm">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
                    Severstal Defect Classes
                  </h3>
                  <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
                    Class 1 to Class 4 distribution
                  </p>
                </div>
              </div>
              <span className="pill-badge px-2.5 py-0.5 font-semibold text-earth-olive dark:text-warm-200 bg-earth-olive-bg dark:bg-darkwarm-surface text-[11px] border border-earth-olive/20">
                Trained Weights
              </span>
            </div>

            <div className="h-44 w-full">
              {defectDist && defectDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defectDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="class_name" stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1C1917', 
                        borderColor: '#292524', 
                        borderRadius: '16px', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)', 
                        fontSize: '11px', 
                        color: '#F5F2EB' 
                      }}
                      cursor={{ fill: 'rgba(214, 206, 190, 0.15)' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {defectDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={classColors[index % classColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-charcoal-400 dark:text-darkwarm-text-muted">
                  No defect events registered yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-warm-100 dark:border-darkwarm-border grid grid-cols-2 gap-2 text-xs">
            {defectDist?.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-warm-50 dark:bg-darkwarm-surface px-3 py-2 rounded-xl border border-warm-200/70 dark:border-darkwarm-border">
                <span className="text-charcoal-600 dark:text-darkwarm-text-muted font-medium">{d.class_name}:</span>
                <span className="text-charcoal-900 dark:text-warm-100 font-bold font-mono">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Flowing Card-Based Timeline / Node Grid for Recent Inspections */}
      <div className="modular-card p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-warm-100 dark:border-darkwarm-border gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border flex items-center justify-center text-charcoal-700 dark:text-warm-200 shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
                Recent Inspection Activity Stream
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
                Flowing connected telemetry nodes from permanent SQLite storage
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher: Flowing Timeline vs Table */}
            <div className="inline-flex p-1 bg-warm-100 dark:bg-darkwarm-surface rounded-full border border-warm-200 dark:border-darkwarm-border text-xs">
              <button
                onClick={() => setViewMode('timeline')}
                className={`pill-btn px-3 py-1 font-semibold rounded-full ${
                  viewMode === 'timeline' 
                    ? 'bg-charcoal-900 text-white shadow-tactile dark:bg-warm-100 dark:text-charcoal-900' 
                    : 'text-charcoal-600 dark:text-darkwarm-text-muted hover:text-charcoal-900'
                }`}
              >
                Flowing Timeline
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`pill-btn px-3 py-1 font-semibold rounded-full ${
                  viewMode === 'table' 
                    ? 'bg-charcoal-900 text-white shadow-tactile dark:bg-warm-100 dark:text-charcoal-900' 
                    : 'text-charcoal-600 dark:text-darkwarm-text-muted hover:text-charcoal-900'
                }`}
              >
                Data Grid
              </button>
            </div>

            <button
              onClick={() => onNavigate('history')}
              className="pill-btn px-4 py-1.5 text-xs font-semibold text-charcoal-800 dark:text-warm-200 bg-warm-100 hover:bg-warm-200 dark:bg-darkwarm-surface dark:hover:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border flex items-center space-x-1.5 transition-colors"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline View: Connected nodes via subtle lines */}
        {viewMode === 'timeline' ? (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-warm-200 dark:before:bg-darkwarm-border">
            {recentInspections && recentInspections.length > 0 ? (
              recentInspections.slice(0, 7).map((item, idx) => {
                const isPass = item.status === 'PASS';
                return (
                  <div key={item.id} className="relative group">
                    {/* Glowing highlight node marker */}
                    <div className={`absolute -left-[23px] sm:-left-[27px] top-3.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-darkwarm-card transition-transform group-hover:scale-125 ${
                      isPass 
                        ? 'border-neon-lime ring-4 ring-neon-lime/20' 
                        : 'border-earth-terracotta ring-4 ring-earth-terracotta/20'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mx-auto my-0.5 ${isPass ? 'bg-neon-lime' : 'bg-earth-terracotta'}`} />
                    </div>

                    {/* Modular Flowing Card */}
                    <div className="bg-warm-50/70 dark:bg-darkwarm-surface/70 hover:bg-white dark:hover:bg-darkwarm-card p-4 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border shadow-tactile transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-xs text-charcoal-900 dark:text-warm-100">
                          {item.inspection_code}
                        </span>
                        
                        <span className={`pill-badge px-2.5 py-0.5 text-[11px] font-bold ${
                          isPass
                            ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent border border-neon-lime/30'
                            : 'bg-earth-terracotta-bg dark:bg-earth-terracotta/25 text-earth-terracotta border border-earth-terracotta/30'
                        }`}>
                          {item.status}
                        </span>

                        <span className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </span>

                        <span className="pill-badge px-2.5 py-0.5 bg-warm-200/60 dark:bg-darkwarm-card text-charcoal-700 dark:text-warm-200 text-xs font-semibold">
                          {item.defect_count} defect(s)
                        </span>

                        <span className="font-mono text-[11px] text-charcoal-500 dark:text-darkwarm-text-muted">
                          {item.inference_time_ms.toFixed(1)} ms
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`pill-badge px-2.5 py-0.5 text-[10px] font-mono font-medium ${
                          item.processing_status === 'IMAGE_EXPIRED'
                            ? 'bg-warm-200/40 text-charcoal-400 dark:text-darkwarm-text-muted'
                            : 'bg-warm-200 text-charcoal-800 dark:bg-darkwarm-card dark:text-warm-200 border border-warm-300/40'
                        }`}>
                          {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED (>100s)' : 'AVAILABLE'}
                        </span>

                        <button
                          onClick={() => onSelectInspection(item.id)}
                          className="pill-btn px-3.5 py-1 bg-white hover:bg-charcoal-900 hover:text-white dark:bg-darkwarm-card dark:hover:bg-warm-100 dark:hover:text-charcoal-900 text-charcoal-800 dark:text-warm-200 text-xs font-medium border border-warm-200 dark:border-darkwarm-border shadow-sm transition-all"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-charcoal-400 dark:text-darkwarm-text-muted">
                No inspection cycles recorded yet. Start 1s cadence or test a sample frame to see flowing timeline.
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50 dark:bg-darkwarm-surface text-charcoal-500 dark:text-darkwarm-text-muted font-semibold border-b border-warm-200 dark:border-darkwarm-border">
                <tr>
                  <th className="py-3 px-4">Inspection Code</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Defects</th>
                  <th className="py-3 px-4">Inference Latency</th>
                  <th className="py-3 px-4">Disk Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-darkwarm-border font-sans">
                {recentInspections && recentInspections.length > 0 ? (
                  recentInspections.map((item) => (
                    <tr key={item.id} className="hover:bg-warm-50/70 dark:hover:bg-darkwarm-surface/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-900 dark:text-warm-100">{item.inspection_code}</td>
                      <td className="py-3 px-4 text-charcoal-500 dark:text-darkwarm-text-muted">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`pill-badge px-2.5 py-0.5 text-[11px] font-bold ${
                          item.status === 'PASS'
                            ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent border border-neon-lime/30'
                            : 'bg-earth-terracotta-bg dark:bg-earth-terracotta/25 text-earth-terracotta border border-earth-terracotta/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal-900 dark:text-warm-100 font-bold">{item.defect_count}</td>
                      <td className="py-3 px-4 font-mono text-charcoal-600 dark:text-darkwarm-text-muted">{item.inference_time_ms.toFixed(1)} ms</td>
                      <td className="py-3 px-4">
                        <span className="pill-badge px-2 py-0.5 text-[10px] font-mono bg-warm-100 dark:bg-darkwarm-surface text-charcoal-600 dark:text-darkwarm-text-muted">
                          {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectInspection(item.id)}
                          className="pill-btn px-3 py-1 bg-warm-100 hover:bg-charcoal-900 hover:text-white dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs transition-all"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-charcoal-400 dark:text-darkwarm-text-muted">
                      No inspection cycles recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
