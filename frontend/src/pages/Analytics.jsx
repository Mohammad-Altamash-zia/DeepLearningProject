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
    { name: 'PASS (Clean)', value: passCount, color: '#84CC16' },
    { name: 'FAIL (Defects)', value: failCount, color: '#C25E3E' },
  ];

  // Earth-tone & Neon-Lime Palette
  const defectColors = ['#5F6F52', '#A77959', '#C25E3E', '#84CC16'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prominent Page Title with Organic Curvature */}
      <div className="modular-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="pill-badge px-3 py-1 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-semibold border border-warm-300/50">
              Intelligence
            </span>
            <span className="pill-badge px-3 py-1 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse mr-1.5" />
              Aggregated Quality Metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            Quality Analytics & Performance Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-darkwarm-text-muted mt-1 max-w-2xl">
            Statistical yield evaluation, defect frequency distribution, and throughput trends derived from SQLite records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="pill-btn flex items-center space-x-2 px-5 py-2.5 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Modular Floating Cards with Distinct Typographic Hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
              All-Time Cycles
            </span>
            <div className="w-10 h-10 rounded-2xl bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border flex items-center justify-center text-charcoal-700 dark:text-warm-200 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl lg:text-4xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            {summary?.total_inspections || 0}
          </span>
          <span className="text-xs text-charcoal-400 dark:text-darkwarm-text-muted mt-2 block font-medium">
            Validated by YOLO11n ONNX
          </span>
        </div>

        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
              Defect Rate
            </span>
            <div className="w-10 h-10 rounded-2xl bg-earth-terracotta-bg dark:bg-earth-terracotta/20 border border-earth-terracotta/30 flex items-center justify-center text-earth-terracotta shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl lg:text-4xl font-extrabold text-earth-terracotta font-sans tracking-tight">
            {summary?.defect_detection_rate || 0}%
          </span>
          <span className="text-xs text-charcoal-400 dark:text-darkwarm-text-muted mt-2 block font-medium">
            Failed / Total Inspection Ratio
          </span>
        </div>

        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
              Average Latency
            </span>
            <div className="w-10 h-10 rounded-2xl bg-earth-amber-bg dark:bg-earth-amber/20 border border-earth-amber/30 flex items-center justify-center text-earth-amber shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl lg:text-4xl font-extrabold text-charcoal-900 dark:text-warm-100 font-mono tracking-tight">
            {summary?.avg_inference_time_ms ? summary.avg_inference_time_ms.toFixed(1) : 0} ms
          </span>
          <span className="text-xs text-charcoal-400 dark:text-darkwarm-text-muted mt-2 block font-medium">
            CPU Inference Benchmarked
          </span>
        </div>

        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
              Defects Flagged
            </span>
            <div className="w-10 h-10 rounded-2xl bg-earth-olive-bg dark:bg-earth-olive/20 border border-earth-olive/30 flex items-center justify-center text-earth-olive shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl lg:text-4xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            {summary?.total_defects_found || 0}
          </span>
          <span className="text-xs text-charcoal-400 dark:text-darkwarm-text-muted mt-2 block font-medium">
            Across 4 Severstal Classes
          </span>
        </div>
      </div>

      {/* Middle Row Charts: Trend Line & Pass/Fail Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Trend Chart (2 cols) */}
        <div className="lg:col-span-2 modular-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
                Inspection Throughput & Timeline
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
                Captured and processed inspections over time
              </p>
            </div>
            <span className="pill-badge px-3 py-1 text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border">
              Hourly Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotalWarm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84CC16" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#84CC16" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#A8A29E" fontSize={11} tickLine={false} axisLine={false} />
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
                  />
                  <Area type="monotone" dataKey="total" stroke="#84CC16" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotalWarm)" name="Cycles" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400 dark:text-darkwarm-text-muted">
                Awaiting more inspection timeline points.
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Donut Chart: Pass vs Fail Ratio */}
        <div className="modular-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
                Pass / Fail Yield Ratio
              </h3>
              <PieIcon className="w-4 h-4 text-charcoal-400" />
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
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1C1917', 
                        borderColor: '#292524', 
                        borderRadius: '16px', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)', 
                        fontSize: '11px', 
                        color: '#F5F2EB' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-charcoal-400 dark:text-darkwarm-text-muted">No data available yet</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-warm-100 dark:border-darkwarm-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2 text-charcoal-600 dark:text-darkwarm-text-muted font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-lime" />
                <span>Passed Yield</span>
              </span>
              <strong className="text-charcoal-900 dark:text-warm-100 font-bold">{passCount} ({summary?.pass_rate || 0}%)</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2 text-charcoal-600 dark:text-darkwarm-text-muted font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-earth-terracotta" />
                <span>Failed Flawed</span>
              </span>
              <strong className="text-earth-terracotta font-bold">{failCount} ({summary?.defect_detection_rate || 0}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Class Breakdown Full Bar */}
      <div className="modular-card p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
              Severstal Steel Defect Class Distribution
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
              Categorical frequency across defect classes 1, 2, 3, and 4
            </p>
          </div>
          <span className="pill-badge px-3 py-1 text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border">
            Severstal Benchmark
          </span>
        </div>

        <div className="h-56 w-full">
          {defects && defects.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {defects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={defectColors[index % defectColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-charcoal-400 dark:text-darkwarm-text-muted">
              No defect data logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
