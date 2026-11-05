import React from 'react';
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
  Camera
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
  const classColors = ['#2563EB', '#8B5CF6', '#F43F5E', '#06B6D4'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Primary Executive KPI Cards */}
      <MetricCards analytics={analytics} inspectionTelemetry={inspectionTelemetry} />

      {/* 2. Middle Row: Live Preview & Defect Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live System Preview Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-squircle bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Live Inspection Monitor</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Synchronized video feeds & AI overlays</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('live')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/70 px-3.5 py-1.5 rounded-squircle flex items-center space-x-1.5 transition-colors"
              >
                <span>Full Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Camera Stream Thumbnail */}
              <div className="bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-squircle-lg overflow-hidden relative aspect-video flex items-center justify-center shadow-inner group">
                <img
                  src="/api/camera/stream"
                  alt="Live Stream"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-squircle-xs text-[10px] font-mono text-cyan-300 border border-white/10 flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  <span>CAM: {cameraStatus.toUpperCase()}</span>
                </div>
              </div>

              {/* Latest AI Annotated Result */}
              <div className="bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-squircle-lg overflow-hidden relative aspect-video flex items-center justify-center shadow-inner group">
                <img
                  src="/api/images/latest"
                  alt="Latest AI Annotated"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-squircle-xs text-[10px] font-mono text-emerald-300 border border-white/10 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>YOLO11n ANNOTATION</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isInspecting ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span className="font-medium text-slate-700 dark:text-slate-200">Pipeline: {isInspecting ? '1s Capture Active' : 'Standby / Idle'}</span>
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">Rolling 100-Second Local Buffer</span>
          </div>
        </div>

        {/* Defect Class Breakdown (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-squircle bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Severstal Classes</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Class 1 to Class 4 breakdown</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                Benchmark
              </span>
            </div>

            <div className="h-44 w-full">
              {defectDist && defectDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defectDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="class_name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', fontSize: '11px', color: '#FFFFFF' }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {defectDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={classColors[index % classColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No defect events registered yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            {defectDist?.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-squircle-sm border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{d.class_name}:</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Inspection Activity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl overflow-hidden shadow-sm transition-colors">
        <div className="h-14 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-squircle bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-sans block">Recent Inspection Cycles</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-normal">Real-time log stream from SQLite database</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/70 px-3.5 py-1.5 rounded-squircle flex items-center space-x-1.5 transition-colors"
          >
            <span>View Full Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6">Inspection Code</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Defects</th>
                <th className="py-3 px-6">Inference Latency</th>
                <th className="py-3 px-6">Disk Buffer</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {recentInspections && recentInspections.length > 0 ? (
                recentInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">{item.inspection_code}</td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-900 dark:text-white font-bold">{item.defect_count}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-slate-300">{item.inference_time_ms.toFixed(1)} ms</td>
                    <td className="py-3.5 px-6">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        item.processing_status === 'IMAGE_EXPIRED'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900'
                      }`}>
                        {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED (>100s)' : 'AVAILABLE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="px-3 py-1 rounded-squircle-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    No inspection records found. Start inspection to begin capturing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
