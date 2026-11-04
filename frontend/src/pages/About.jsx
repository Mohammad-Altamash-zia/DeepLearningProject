import React from 'react';
import { ShieldCheck, Layers, Smartphone, Cpu, Database, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl text-xs font-mono">
      {/* Intro Hero */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wider">
              InspectAI — Industrial Quality Inspection System
            </h1>
            <p className="text-industrial-400 mt-0.5">
              Automated Computer Vision Inspection using YOLO11n ONNX & Real-Time Mobile IP Cameras
            </p>
          </div>
        </div>

        <p className="text-industrial-300 leading-relaxed mt-4">
          InspectAI is an end-to-end industrial inspection workstation designed for manufacturing quality assurance.
          It interfaces directly with mobile phone IP cameras over local Wi-Fi, executing automated 1-frame-per-second captures,
          deep learning anomaly detection, PASS/FAIL gating decisions, and rolling 100-second local disk retention while
          permanently archiving historical telemetry in SQLite.
        </p>
      </div>

      {/* Severstal Defect Classes */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-industrial-800 pb-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Trained Severstal Steel Defect Classes
          </h2>
        </div>
        <p className="text-industrial-400">
          The embedded YOLO11n model was trained on the Kaggle Severstal Steel Defect Detection benchmark dataset:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
            <span className="text-amber-400 font-bold block mb-1">Class_1: Pitted Surface</span>
            <span className="text-industrial-400 text-[11px] block">
              Localized microscopic indentations, metallurgical inclusions, and small surface voids.
            </span>
          </div>
          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
            <span className="text-pink-400 font-bold block mb-1">Class_2: Inclusions & Cracks</span>
            <span className="text-industrial-400 text-[11px] block">
              Non-metallic embedded particles, microscopic hairline fissures, and surface seam defects.
            </span>
          </div>
          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
            <span className="text-red-400 font-bold block mb-1">Class_3: Scratches & Gouges</span>
            <span className="text-industrial-400 text-[11px] block">
              Linear abrasion marks, roller guide damage, and mechanical longitudinal scoring.
            </span>
          </div>
          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
            <span className="text-cyan-400 font-bold block mb-1">Class_4: Patches & Delamination</span>
            <span className="text-industrial-400 text-[11px] block">
              Large macroscopic area defects, oxide patches, severe rolling blemishes, and blister zones.
            </span>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-industrial-800 pb-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Processing Architecture & Gating Logic
          </h2>
        </div>
        <div className="space-y-2 text-industrial-300">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Decoupled Camera Reader:</strong> Dedicated background worker pulls frames into a thread-safe single-frame buffer, completely eliminating OpenCV buffer lag.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>1-Second Cadence & Bounded Queue:</strong> Capture scheduler initiates 1 inference every second with a bounded queue and frame-dropping policy to prevent backlog.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Rolling 100s Retention:</strong> Background daemon automatically deletes raw and annotated image files older than 100 seconds, while SQLite preserves all inspection metadata.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

