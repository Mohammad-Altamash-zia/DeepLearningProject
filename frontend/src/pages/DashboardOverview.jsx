import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Video, 
  Zap, 
  Layers, 
  Clock 
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
  const classColors = ['#00A5FF', '#FF69B4', '#EE2222', '#00D7FF'];

  return (
    <div className="space-y-6">
      {/* 1. Primary Executive KPI Cards */}
      <MetricCards analytics={analytics} inspectionTelemetry={inspectionTelemetry} />

      {/* 2. Middle Row: Live Preview & Defect Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live System Preview Card (2 cols) */}
        <div className="lg:col-span-2 bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Inspection Monitor</h3>
            </div>
            <button
              onClick={() => onNavigate('live')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono transition-colors"
            >
              <span>Open Full Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Camera Stream Thumbnail */}
            <div className="bg-black border border-industrial-800 rounded-lg overflow-hidden relative aspect-video flex items-center justify-center">
              <img
                src="/api/camera/stream"
                alt="Live Stream"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] font-mono text-cyan-400 border border-white/10">
                CAM FEED: {cameraStatus}
              </div>
            </div>

            {/* Latest AI Annotated Result */}
            <div className="bg-black border border-industrial-800 rounded-lg overflow-hidden relative aspect-video flex items-center justify-center">
              <img
                src="/api/images/latest"
                alt="Latest AI Annotated"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] font-mono text-emerald-400 border border-white/10">
                YOLO11n ANNOTATION
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-industrial-800/80 flex items-center justify-between text-xs font-mono text-industrial-400">
            <span className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isInspecting ? 'bg-emerald-400 animate-pulse' : 'bg-industrial-600'}`} />
              <span>Pipeline: {isInspecting ? '1s Capture Active' : 'Standby / Idle'}</span>
            </span>
            <span className="text-industrial-500">100-Second Rolling Image Buffer</span>
          </div>
        </div>

        {/* Defect Class Breakdown (1 col) */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Severstal Classes</h3>
              </div>
              <span className="text-xs font-mono text-industrial-500">Classes 1–4</span>
            </div>

            <div className="h-44 w-full">
              {defectDist && defectDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defectDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="class_name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {defectDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={classColors[index % classColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-industrial-500">
                  No defect events registered yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] font-mono text-industrial-400 grid grid-cols-2 gap-2">
            {defectDist?.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-industrial-950 px-2 py-1 rounded border border-industrial-800">
                <span className="text-industrial-400">{d.class_name}:</span>
                <span className="text-white font-bold">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Inspection Activity Table */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-sm">
        <div className="h-12 px-5 bg-industrial-850 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Recent Inspection Cycles</span>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
          >
            <span>View Full Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-950 text-industrial-400 border-b border-industrial-800">
              <tr>
                <th className="py-2.5 px-4">Inspection Code</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Defect Count</th>
                <th className="py-2.5 px-4">Latency</th>
                <th className="py-2.5 px-4">Image Buffer</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800">
              {recentInspections && recentInspections.length > 0 ? (
                recentInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-industrial-850/50 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{item.inspection_code}</td>
                    <td className="py-3 px-4 text-industrial-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{item.defect_count}</td>
                    <td className="py-3 px-4 text-industrial-300">{item.inference_time_ms.toFixed(1)} ms</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.processing_status === 'IMAGE_EXPIRED'
                          ? 'bg-industrial-800 text-industrial-500'
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED (>100s)' : 'AVAILABLE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="px-2.5 py-1 rounded bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-industrial-500">
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

