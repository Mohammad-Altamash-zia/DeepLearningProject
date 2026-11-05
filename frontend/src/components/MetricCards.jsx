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
      {/* 4 Top Modular Floating Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inspections */}
        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
                Total Inspections
              </span>
              <div className="w-10 h-10 rounded-2xl bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border flex items-center justify-center text-charcoal-700 dark:text-warm-200 shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-charcoal-400 dark:text-darkwarm-text-muted">cycles</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
            <span>Today: <strong className="text-charcoal-800 dark:text-warm-200 font-semibold">{analytics?.today_inspections || 0}</strong></span>
            <span className="pill-badge px-2.5 py-0.5 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-[11px] font-semibold border border-warm-300/60 dark:border-darkwarm-border">
              All-time Archive
            </span>
          </div>
        </div>

        {/* Passed Yield (Neon Lime Highlight Node) */}
        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
                Passed Yield
              </span>
              <div className="w-10 h-10 rounded-2xl bg-neon-lime-bg dark:bg-neon-lime-dark/20 border border-neon-lime/40 dark:border-neon-lime/30 flex items-center justify-center text-neon-lime-dark dark:text-neon-lime-accent shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
                {passCount.toLocaleString()}
              </span>
              <span className="pill-badge px-2.5 py-0.5 bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
                {total > 0 ? `${((passCount / total) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse" />
              <span>Tolerance Met</span>
            </span>
            <span className="text-neon-lime-dark dark:text-neon-lime-accent font-semibold text-[11px]">Clean Surface</span>
          </div>
        </div>

        {/* Defects Flagged (Terracotta Muted Earth Tone) */}
        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
                Defects Flagged
              </span>
              <div className="w-10 h-10 rounded-2xl bg-earth-terracotta-bg dark:bg-earth-terracotta/20 border border-earth-terracotta/30 dark:border-earth-terracotta/40 flex items-center justify-center text-earth-terracotta shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-earth-terracotta font-sans tracking-tight">
                {failCount.toLocaleString()}
              </span>
              <span className="pill-badge px-2.5 py-0.5 bg-earth-terracotta-bg dark:bg-earth-terracotta/20 text-earth-terracotta text-xs font-bold border border-earth-terracotta/30">
                {total > 0 ? `${((failCount / total) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
            <span>Found: <strong className="text-charcoal-800 dark:text-warm-200 font-semibold">{analytics?.total_defects_found || 0} defects</strong></span>
            <span className="text-earth-terracotta font-semibold text-[11px]">Reject / Review</span>
          </div>
        </div>

        {/* Inference Latency & Model Performance */}
        <div className="modular-card modular-card-hover p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-charcoal-500 dark:text-darkwarm-text-muted uppercase tracking-wider">
                Inference Latency
              </span>
              <div className="w-10 h-10 rounded-2xl bg-earth-amber-bg dark:bg-earth-amber/20 border border-earth-amber/30 dark:border-earth-amber/40 flex items-center justify-center text-earth-amber shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl lg:text-4xl font-extrabold text-charcoal-900 dark:text-warm-100 font-mono tracking-tight">
                {latency.toFixed(1)}
              </span>
              <span className="pill-badge px-2 py-0.5 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-bold border border-warm-300/50">
                ms / frame
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
            <span>Defect Ratio: <strong className="text-charcoal-800 dark:text-warm-200 font-semibold">{defectRate}%</strong></span>
            <span className="text-charcoal-700 dark:text-warm-300 font-semibold text-[11px]">YOLO11n ONNX</span>
          </div>
        </div>
      </div>

      {/* Frame Scheduler Bar: Soft Modular Floating Card */}
      <div className="modular-card px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs transition-colors">
        <div className="flex items-center space-x-6 text-charcoal-600 dark:text-darkwarm-text-muted font-medium">
          <div className="flex items-center space-x-2">
            <span className="text-charcoal-400 dark:text-darkwarm-text-muted">Capture Interval:</span>
            <span className="pill-badge px-2.5 py-0.5 bg-warm-100 dark:bg-darkwarm-surface font-semibold text-charcoal-800 dark:text-warm-100 border border-warm-200 dark:border-darkwarm-border">
              1 Frame / Second
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-charcoal-400 dark:text-darkwarm-text-muted">Retention Policy:</span>
            <span className="pill-badge px-2.5 py-0.5 bg-warm-100 dark:bg-darkwarm-surface font-semibold text-charcoal-800 dark:text-warm-100 border border-warm-200 dark:border-darkwarm-border">
              Rolling 100-Second Ring
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <span className="text-charcoal-500 dark:text-darkwarm-text-muted">
            Processed: <strong className="text-charcoal-900 dark:text-warm-100 font-semibold font-mono">{processed}</strong>
          </span>
          <span className="text-charcoal-300 dark:text-darkwarm-border">•</span>
          <span className="text-charcoal-500 dark:text-darkwarm-text-muted">
            Captured: <strong className="text-charcoal-900 dark:text-warm-100 font-semibold font-mono">{captured}</strong>
          </span>
          <span className="text-charcoal-300 dark:text-darkwarm-border">•</span>
          <span className="flex items-center space-x-1.5 pill-badge px-2.5 py-0.5 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-[11px] font-bold border border-neon-lime/30">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse" />
            <span>SQLite WAL Active</span>
          </span>
        </div>
      </div>
    </div>
  );
}
