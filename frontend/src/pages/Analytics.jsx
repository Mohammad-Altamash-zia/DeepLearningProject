import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Zap, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';
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
    { name: 'PASS (Clean)', value: passCount, color: '#10B981' },
    { name: 'FAIL (Defects)', value: failCount, color: '#F43F5E' },
  ];

  const defectColors = ['#2563EB', '#8B5CF6', '#F43F5E', '#06B6D4'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-sans">
            Historical Quality Analytics & Defect Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated metrics derived exclusively from persistent SQLite inspection records.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">All-Time Cycles</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            {summary?.total_inspections || 0}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Validated by YOLO11n ONNX</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Defect Rate</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-rose-600 font-sans tracking-tight">
            {summary?.defect_detection_rate || 0}%
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Failed / Total Inspection Ratio</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Average Latency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {summary?.avg_inference_time_ms ? summary.avg_inference_time_ms.toFixed(1) : 0} ms
          </span>
          <span className="text-xs text-slate-400 mt-1 block">CPU Inference Benchmarked</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Defects Flagged</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-purple-600 font-sans tracking-tight">
            {summary?.total_defects_found || 0}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Across 4 Severstal Classes</span>
        </div>
      </div>

      {/* Middle Row Charts: Trend Line & Pass/Fail Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Inspection Throughput & Timeline
              </h3>
              <p className="text-xs text-slate-400">Captured and processed inspections over time</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Live Hourly
            </span>
          </div>

          <div className="h-64 w-full">
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', fontSize: '11px', color: '#1E293B' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" name="Cycles" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Awaiting more inspection timeline points.
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Donut Chart: Pass vs Fail Ratio */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Pass / Fail Yield Ratio
              </h3>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              {passCount + failCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', fontSize: '11px', color: '#1E293B' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No data available yet</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Passed Yield</span>
              </span>
              <strong className="text-slate-900 font-bold">{passCount} ({summary?.pass_rate || 0}%)</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Failed Flawed</span>
              </span>
              <strong className="text-slate-900 font-bold">{failCount} ({summary?.defect_detection_rate || 0}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Class Breakdown Full Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Severstal Steel Defect Class Distribution
            </h3>
            <p className="text-xs text-slate-400">Categorical frequency across defect classes 1, 2, 3, and 4</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            Severstal Kaggle Benchmark
          </span>
        </div>

        <div className="h-56 w-full">
          {defects && defects.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="class_name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', fontSize: '11px', color: '#1E293B' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {defects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={defectColors[index % defectColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No defect data logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
