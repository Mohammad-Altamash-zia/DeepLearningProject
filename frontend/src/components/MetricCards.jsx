import React from 'react';
import { CheckCircle2, AlertTriangle, Activity, Zap, RefreshCw } from 'lucide-react';

export default function MetricCards({ analytics, inspectionTelemetry }) {
  const total = analytics?.total_inspections || 0;
  const passCount = analytics?.pass_count || 0;
  const failCount = analytics?.fail_count || 0;
  const defectRate = analytics?.defect_detection_rate || 0.0;
  const latency = inspectionTelemetry?.last_inference_time_ms || analytics?.avg_inference_time_ms || 0.0;
  
  const captured = inspectionTelemetry?.total_captured || 0;
  const processed = inspectionTelemetry?.total_processed || 0;
  const skipped = inspectionTelemetry?.total_skipped || 0;

  return (
    <div className="space-y-4">
      {/* 4 Top Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inspections */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-industrial-700 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Inspections</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">{total.toLocaleString()}</span>
            <span className="text-xs text-industrial-500 font-mono">cycles</span>
          </div>
          <div className="mt-2 text-[11px] text-industrial-500 flex justify-between items-center">
            <span>Today: {analytics?.today_inspections || 0}</span>
            <span className="text-cyan-400">All-time DB</span>
          </div>
        </div>

        {/* PASS Count */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-industrial-700 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Passed (Defect-Free)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">{passCount.toLocaleString()}</span>
            <span className="text-xs text-emerald-500/70 font-mono">
              {total > 0 ? `${((passCount / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-industrial-500 flex justify-between items-center">
            <span>Threshold Met</span>
            <span className="text-emerald-400">Yield OK</span>
          </div>
        </div>

        {/* FAIL Count */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-industrial-700 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Failed (Defects Detected)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-red-400">{failCount.toLocaleString()}</span>
            <span className="text-xs text-red-500/70 font-mono">
              {total > 0 ? `${((failCount / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-industrial-500 flex justify-between items-center">
            <span>Total defects found: {analytics?.total_defects_found || 0}</span>
            <span className="text-red-400">Flagged</span>
          </div>
        </div>

        {/* Defect Detection Rate */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-industrial-700 transition-all">
          <div className="flex items-center justify-between text-industrial-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Defect Detection Rate</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-amber-400">{defectRate}%</span>
            <span className="text-xs text-industrial-500 font-mono">ratio</span>
          </div>
          <div className="mt-2 text-[11px] text-industrial-500 flex justify-between items-center">
            <span>Inference Latency:</span>
            <span className="text-cyan-400 font-mono">{latency} ms</span>
          </div>
        </div>
      </div>

      {/* Frame Scheduler Bar */}
      <div className="bg-industrial-850/80 border border-industrial-800 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-6 text-industrial-400">
          <div className="flex items-center space-x-2">
            <span className="text-industrial-500">Scheduler Interval:</span>
            <span className="text-cyan-400 font-bold">{inspectionTelemetry?.capture_interval || 1.0}s</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-industrial-500">Captured:</span>
            <span className="text-white">{captured}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-industrial-500">Processed:</span>
            <span className="text-emerald-400">{processed}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-industrial-500">Dropped/Skipped:</span>
            <span className={skipped > 0 ? 'text-amber-400 font-bold' : 'text-industrial-400'}>{skipped}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-industrial-500">
          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Rolling 100s Retention Active</span>
        </div>
      </div>
    </div>
  );
}

