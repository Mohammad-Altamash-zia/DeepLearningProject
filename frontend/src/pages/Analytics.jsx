import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Zap, Layers, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [defects, setDefects] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, defRes, timeRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getDefectDistribution(),
        api.getTimeline(),
      ]);
      setSummary(sumRes);
      setDefects(defRes);
      setTimeline(timeRes);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const passCount = summary?.pass_count || 0;
  const failCount = summary?.fail_count || 0;
  const pieData = [
    { name: 'PASS', value: passCount, color: '#10B981' },
    { name: 'FAIL', value: failCount, color: '#EF4444' },
  ];

  const defectColors = ['#00A5FF', '#FF69B4', '#EE2222', '#00D7FF'];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Historical Inspection Analytics
          </h2>
          <p className="text-xs text-industrial-400 mt-0.5">
            Aggregated metrics derived exclusively from persistent SQLite inspection records.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4">
          <span className="text-xs text-industrial-400 block uppercase">All-Time Cycles</span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {summary?.total_inspections || 0}
          </span>
          <span className="text-[11px] text-industrial-500 mt-1 block">Validated by YOLO11n</span>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4">
          <span className="text-xs text-industrial-400 block uppercase">Defect Rate</span>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">
            {summary?.defect_detection_rate || 0}%
          </span>
          <span className="text-[11px] text-industrial-500 mt-1 block">Failed / Total Ratio</span>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4">
          <span className="text-xs text-industrial-400 block uppercase">Avg Latency</span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block">
            {summary?.avg_inference_time_ms || 0} ms
          </span>
          <span className="text-[11px] text-industrial-500 mt-1 block">ONNX Runtime CPU</span>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4">
          <span className="text-xs text-industrial-400 block uppercase">Total Defects Found</span>
          <span className="text-2xl font-bold text-red-400 mt-1 block">
            {summary?.total_defects_found || 0}
          </span>
          <span className="text-[11px] text-industrial-500 mt-1 block">Across Class 1–4</span>
        </div>
      </div>

      {/* Chart Row 1: PASS vs FAIL & Defect Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PASS vs FAIL Donut */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              PASS vs FAIL Distribution
            </h3>
          </div>

          <div className="h-64 flex items-center justify-center">
            {summary?.total_inspections > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend 
                    formatter={(val) => <span className="text-xs font-mono text-industrial-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-mono text-industrial-500">
                No inspection data available for distribution.
              </div>
            )}
          </div>
        </div>

        {/* Defect Class Breakdown */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Severstal Steel Defect Classes
            </h3>
          </div>

          <div className="h-64 flex items-center justify-center">
            {defects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defects} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <XAxis dataKey="class_name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {defects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={defectColors[index % defectColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-mono text-industrial-500">
                No defect incidents recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Row 2: Inspection Activity Over Time */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Inspection Timeline & Throughput
          </h3>
        </div>

        <div className="h-64 w-full">
          {timeline && timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time_slot" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                />
                <Legend 
                  formatter={(val) => <span className="text-xs font-mono text-industrial-300">{val}</span>}
                />
                <Area type="monotone" dataKey="pass_count" name="Passed" stroke="#10B981" fillOpacity={1} fill="url(#passGrad)" />
                <Area type="monotone" dataKey="fail_count" name="Failed" stroke="#EF4444" fillOpacity={1} fill="url(#failGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-industrial-500">
              No historical timeline activity yet. Active inspection runs will populate this graph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

