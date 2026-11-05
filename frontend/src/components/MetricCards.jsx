import React from 'react';
import { CheckCircle2, AlertTriangle, Activity, Zap, Layers, Clock } from 'lucide-react';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inspections */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Inspections</span>
            <div className="w-9 h-9 rounded-squircle bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">{total.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">cycles</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Today: <strong className="text-slate-700 dark:text-slate-200">{analytics?.today_inspections || 0}</strong></span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-950/50 px-2 py-0.5 rounded-full text-[11px]">All-time</span>
          </div>
        </div>

        {/* PASS Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passed Yield</span>
            <div className="w-9 h-9 rounded-squircle bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">{passCount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              {total > 0 ? `${((passCount / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Threshold Met</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Clean Surface</span>
          </div>
        </div>

        {/* FAIL Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Defects Flagged</span>
            <div className="w-9 h-9 rounded-squircle bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-sans tracking-tight">{failCount.toLocaleString()}</span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
              {total > 0 ? `${((failCount / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Found: <strong className="text-slate-700 dark:text-slate-200">{analytics?.total_defects_found || 0} defects</strong></span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">Reject/Review</span>
          </div>
        </div>

        {/* Defect Detection Rate & Latency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inference Speed</span>
            <div className="w-9 h-9 rounded-squircle bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{latency.toFixed(1)}</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">ms / frame</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Defect Ratio: <strong className="text-slate-700 dark:text-slate-200">{defectRate}%</strong></span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px]">YOLO11n ONNX</span>
          </div>
        </div>
      </div>

      {/* Frame Scheduler Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl px-5 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs transition-colors">
        <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 dark:text-slate-500">Capture Interval:</span>
            <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-squircle-xs font-mono font-bold">
              {inspectionTelemetry?.capture_interval || 1.0}s
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 dark:text-slate-500">Captured:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">{captured}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 dark:text-slate-500">Processed:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{processed}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 dark:text-slate-500">Skipped:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{skipped}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Bounded Queue Active</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">100s Rolling Retention</span>
        </div>
      </div>
    </div>
  );
}
