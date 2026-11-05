import React from 'react';
import { ShieldCheck, Layers, Smartphone, Cpu, Database, CheckCircle2, Video } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs">
      {/* Intro Hero */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3.5 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
              InspectAI — Industrial Quality Inspection Platform
            </h1>
            <p className="text-slate-400 mt-0.5 text-xs">
              Automated Computer Vision Inspection using YOLO11n ONNX & Real-Time Hardware Streams
            </p>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed mt-4 font-sans text-xs">
          InspectAI is an end-to-end industrial inspection workstation designed for manufacturing quality assurance.
          It interfaces directly with built-in laptop cameras or mobile IP cameras, executing automated 1-frame-per-second captures,
          deep learning anomaly detection, PASS/FAIL gating decisions, and rolling 100-second local disk retention while
          permanently archiving historical telemetry in SQLite.
        </p>
      </div>

      {/* Severstal Defect Classes */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Layers className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
            Trained Severstal Steel Defect Classes
          </h2>
        </div>
        <p className="text-slate-500 font-sans">
          The embedded YOLO11n model was trained on the Kaggle Severstal Steel Defect Detection benchmark dataset:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-blue-600 font-bold block mb-1">Class_1: Pitted Surface</span>
            <span className="text-slate-500 text-[11px] block font-sans">
              Localized microscopic indentations, metallurgical inclusions, and small surface voids.
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-purple-600 font-bold block mb-1">Class_2: Inclusions & Cracks</span>
            <span className="text-slate-500 text-[11px] block font-sans">
              Non-metallic embedded particles, microscopic hairline fissures, and surface seam defects.
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-rose-600 font-bold block mb-1">Class_3: Scratches & Gouges</span>
            <span className="text-slate-500 text-[11px] block font-sans">
              Linear abrasion marks, roller guide damage, and mechanical longitudinal scoring.
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-cyan-600 font-bold block mb-1">Class_4: Patches & Roll Marks</span>
            <span className="text-slate-500 text-[11px] block font-sans">
              Large superficial surface patches, mill scale residue, and rolling contact blemishes.
            </span>
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Cpu className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
            Core Architecture Specifications
          </h2>
        </div>
        <ul className="space-y-2 text-slate-600 font-sans">
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Model:</strong> Ultralytics YOLO11n exported to ONNX (models/inspectai_yolo11n.onnx)</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Inference Runtime:</strong> ONNX Runtime CPU with letterbox 640x640 preprocessing & NMS</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Capture Engine:</strong> 1-second capture cadence using OpenCV frame buffer thread</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>100s Retention Policy:</strong> Background daemon automatically deletes physical captures older than 100s</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Database:</strong> SQLite WAL mode storing complete permanent historical inspection logs</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
