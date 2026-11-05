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
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">Live Inspection Monitor</h3>
                  <p className="text-xs text-slate-400">Synchronized video feeds & AI overlays</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('live')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <span>Full Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Camera Stream Thumbnail */}
              <div className="bg-slate-900 border border-slate-100 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center shadow-inner group">
                <img
                  src="/api/camera/stream"
                  alt="Live Stream"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono text-cyan-300 border border-white/10 flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  <span>CAM: {cameraStatus.toUpperCase()}</span>
                </div>
              </div>

              {/* Latest AI Annotated Result */}
              <div className="bg-slate-900 border border-slate-100 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center shadow-inner group">
                <img
                  src="/api/images/latest"
                  alt="Latest AI Annotated"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono text-emerald-300 border border-white/10 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>YOLO11n ANNOTATION</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isInspecting ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="font-medium text-slate-700">Pipeline: {isInspecting ? '1s Capture Active' : 'Standby / Idle'}</span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">Rolling 100-Second Local Buffer</span>
          </div>
        </div>

        {/* Defect Class Breakdown (1 col) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">Severstal Classes</h3>
                  <p className="text-xs text-slate-400">Class 1 to Class 4 breakdown</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
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
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', fontSize: '11px', color: '#1E293B' }}
                      cursor={{ fill: '#F1F5F9' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {defectDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={classColors[index % classColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No defect events registered yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            {defectDist?.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">{d.class_name}:</span>
                <span className="text-slate-900 font-bold font-mono">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Inspection Activity Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 font-sans block">Recent Inspection Cycles</span>
              <span className="text-xs text-slate-400 block font-normal">Real-time log stream from SQLite database</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <span>View Full Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
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
            <tbody className="divide-y divide-slate-100 font-sans">
              {recentInspections && recentInspections.length > 0 ? (
                recentInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600">{item.inspection_code}</td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-900 font-bold">{item.defect_count}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-600">{item.inference_time_ms.toFixed(1)} ms</td>
                    <td className="py-3.5 px-6">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        item.processing_status === 'IMAGE_EXPIRED'
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED (>100s)' : 'AVAILABLE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-medium transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
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
