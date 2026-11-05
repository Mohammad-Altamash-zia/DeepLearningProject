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
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inspections</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">{total.toLocaleString()}</span>
            <span className="text-xs font-semibold text-slate-400">cycles</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Today: <strong className="text-slate-700">{analytics?.today_inspections || 0}</strong></span>
            <span className="text-blue-600 font-semibold bg-blue-50/70 px-2 py-0.5 rounded-full text-[11px]">All-time</span>
          </div>
        </div>

        {/* PASS Count */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passed Yield</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-sans tracking-tight">{passCount.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {total > 0 ? `${((passCount / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Threshold Met</span>
            <span className="text-emerald-600 font-semibold text-[11px]">Clean Surface</span>
          </div>
        </div>

        {/* FAIL Count */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Defects Flagged</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-600 font-sans tracking-tight">{failCount.toLocaleString()}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              {total > 0 ? `${((failCount / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Found: <strong className="text-slate-700">{analytics?.total_defects_found || 0} defects</strong></span>
            <span className="text-rose-600 font-semibold text-[11px]">Reject/Review</span>
          </div>
        </div>

        {/* Defect Detection Rate & Latency */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inference Speed</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{latency.toFixed(1)}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">ms / frame</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Defect Ratio: <strong className="text-slate-700">{defectRate}%</strong></span>
            <span className="text-blue-600 font-semibold text-[11px]">YOLO11n ONNX</span>
          </div>
        </div>
      </div>

      {/* Frame Scheduler Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-6 text-slate-600 font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Capture Interval:</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-mono font-bold">
              {inspectionTelemetry?.capture_interval || 1.0}s
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Captured:</span>
            <span className="font-bold text-slate-800 font-mono">{captured}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Processed:</span>
            <span className="font-bold text-emerald-600 font-mono">{processed}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Skipped:</span>
            <span className="font-bold text-amber-600 font-mono">{skipped}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">Bounded Queue Buffer Active</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-[11px] text-slate-400">100s Rolling Retention</span>
        </div>
      </div>
    </div>
  );
}
