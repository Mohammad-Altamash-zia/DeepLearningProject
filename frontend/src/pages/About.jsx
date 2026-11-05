import React from 'react';
import { ShieldCheck, Layers, Cpu, CheckCircle2, Video, Database } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs transition-colors duration-200">
      {/* Prominent Page Title with Organic Curvature */}
      <div className="modular-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 dark:bg-warm-100 text-white dark:text-charcoal-900 flex items-center justify-center shadow-tactile shrink-0">
            <ShieldCheck className="w-6 h-6 text-neon-lime-accent dark:text-charcoal-900" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="pill-badge px-3 py-0.5 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-semibold border border-warm-300/50">
                System Dossier
              </span>
              <span className="pill-badge px-3 py-0.5 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
                Ultralytics YOLO11n
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 dark:text-warm-100 tracking-tight font-sans">
              InspectAI Industrial Vision Platform
            </h1>
            <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted mt-0.5">
              Automated Computer Vision Inspection using YOLO11n ONNX & Real-Time Hardware Streams
            </p>
          </div>
        </div>
      </div>

      {/* Intro Overview Card */}
      <div className="modular-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
          Workstation Overview
        </h3>
        <p className="text-charcoal-600 dark:text-darkwarm-text-muted leading-relaxed font-sans text-xs">
          InspectAI is an end-to-end industrial inspection workstation designed for manufacturing quality assurance.
          It interfaces directly with built-in laptop cameras or external hardware devices, executing automated 1-frame-per-second captures,
          deep learning anomaly detection, PASS/FAIL gating decisions, and rolling 100-second local disk retention while
          permanently archiving historical telemetry in SQLite WAL tables.
        </p>
      </div>

      {/* Severstal Defect Classes (Modular Grid with Muted Earth Tones & Neon Lime) */}
      <div className="modular-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-warm-100 dark:border-darkwarm-border pb-3">
          <Layers className="w-4 h-4 text-earth-olive" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans">
            Trained Severstal Steel Defect Classes
          </h2>
        </div>
        <p className="text-charcoal-500 dark:text-darkwarm-text-muted font-sans">
          The embedded YOLO11n model was trained on the Kaggle Severstal Steel Defect Detection benchmark dataset:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Class 1 */}
          <div className="bg-warm-50 dark:bg-darkwarm-surface p-4 rounded-2xl border border-warm-200/80 dark:border-darkwarm-border">
            <span className="text-earth-olive font-bold block mb-1">Class_1: Pitted Surface</span>
            <span className="text-charcoal-500 dark:text-darkwarm-text-muted text-[11px] block font-sans">
              Localized microscopic indentations, metallurgical inclusions, and small surface voids.
            </span>
          </div>

          {/* Class 2 */}
          <div className="bg-warm-50 dark:bg-darkwarm-surface p-4 rounded-2xl border border-warm-200/80 dark:border-darkwarm-border">
            <span className="text-earth-clay font-bold block mb-1">Class_2: Inclusions & Cracks</span>
            <span className="text-charcoal-500 dark:text-darkwarm-text-muted text-[11px] block font-sans">
              Non-metallic embedded particles, microscopic hairline fissures, and surface seam defects.
            </span>
          </div>

          {/* Class 3 */}
          <div className="bg-warm-50 dark:bg-darkwarm-surface p-4 rounded-2xl border border-warm-200/80 dark:border-darkwarm-border">
            <span className="text-earth-terracotta font-bold block mb-1">Class_3: Scratches & Gouges</span>
            <span className="text-charcoal-500 dark:text-darkwarm-text-muted text-[11px] block font-sans">
              Linear abrasion marks, roller guide damage, and mechanical longitudinal scoring.
            </span>
          </div>

          {/* Class 4 */}
          <div className="bg-warm-50 dark:bg-darkwarm-surface p-4 rounded-2xl border border-warm-200/80 dark:border-darkwarm-border">
            <span className="text-neon-lime-dark dark:text-neon-lime-accent font-bold block mb-1">Class_4: Patches & Roll Marks</span>
            <span className="text-charcoal-500 dark:text-darkwarm-text-muted text-[11px] block font-sans">
              Large superficial surface patches, mill scale residue, and rolling contact blemishes.
            </span>
          </div>
        </div>
      </div>

      {/* Architecture Highlights (Flowing Nodes) */}
      <div className="modular-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-warm-100 dark:border-darkwarm-border pb-3">
          <Cpu className="w-4 h-4 text-charcoal-900 dark:text-warm-100" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans">
            Core Architecture Specifications
          </h2>
        </div>
        <ul className="space-y-3 text-charcoal-600 dark:text-darkwarm-text-muted font-sans">
          <li className="flex items-center space-x-3 bg-warm-50/70 dark:bg-darkwarm-surface p-3 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border">
            <span className="w-2 h-2 rounded-full bg-neon-lime" />
            <span><strong>Model:</strong> Ultralytics YOLO11n exported to ONNX (<code className="font-mono text-charcoal-800 dark:text-warm-100">models/inspectai_yolo11n.onnx</code>)</span>
          </li>
          <li className="flex items-center space-x-3 bg-warm-50/70 dark:bg-darkwarm-surface p-3 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border">
            <span className="w-2 h-2 rounded-full bg-neon-lime" />
            <span><strong>Inference Runtime:</strong> ONNX Runtime CPU with letterbox 640x640 preprocessing & NMS</span>
          </li>
          <li className="flex items-center space-x-3 bg-warm-50/70 dark:bg-darkwarm-surface p-3 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border">
            <span className="w-2 h-2 rounded-full bg-neon-lime" />
            <span><strong>Capture Engine:</strong> 1-second capture cadence using OpenCV frame buffer thread</span>
          </li>
          <li className="flex items-center space-x-3 bg-warm-50/70 dark:bg-darkwarm-surface p-3 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border">
            <span className="w-2 h-2 rounded-full bg-earth-terracotta" />
            <span><strong>100s Retention Policy:</strong> Background daemon automatically deletes physical captures older than 100s</span>
          </li>
          <li className="flex items-center space-x-3 bg-warm-50/70 dark:bg-darkwarm-surface p-3 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border">
            <span className="w-2 h-2 rounded-full bg-earth-olive" />
            <span><strong>Database:</strong> SQLite WAL mode storing complete permanent historical inspection logs</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
