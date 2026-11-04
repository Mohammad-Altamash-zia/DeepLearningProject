import React, { useState, useEffect } from 'react';
import { Cpu, Server, Database, Video, HardDrive, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function SystemStatus() {
  const [health, setHealth] = useState(null);
  const [model, setModel] = useState(null);
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [hRes, mRes, cRes] = await Promise.all([
        api.getHealth(),
        api.getModelStatus(),
        api.getCameraStatus(),
      ]);
      setHealth(hRes);
      setModel(mRes);
      setCamera(cRes);
    } catch (e) {
      console.error('Failed to load system diagnostics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Title Bar */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              System Health & Diagnostics
            </h2>
            <p className="text-xs text-industrial-400 mt-0.5">
              Live operational telemetry verifying backend, ONNX runtime, database, and hardware streams.
            </p>
          </div>
        </div>
        <button
          onClick={loadStatus}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Card 1: YOLO11n ONNX Inference Engine */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white uppercase">YOLO11n ONNX Model</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              model?.is_loaded ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400'
            }`}>
              {model?.is_loaded ? 'ACTIVE & LOADED' : 'UNAVAILABLE'}
            </span>
          </div>

          <div className="space-y-2 text-industrial-300">
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Model File:</span>
              <span className="text-cyan-400 truncate max-w-xs">{model?.model_path || 'models/inspectai_yolo11n.onnx'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Input Resolution:</span>
              <span className="text-white">640 x 640 px (images)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Output Tensor:</span>
              <span className="text-white">output0 [1, 8, 8400]</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Execution Provider:</span>
              <span className="text-emerald-400">{model?.execution_providers?.join(', ') || 'CPUExecutionProvider'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-industrial-500">Severstal Classes:</span>
              <span className="text-white">Class_1, Class_2, Class_3, Class_4</span>
            </div>
          </div>
        </div>

        {/* Card 2: IP Camera Stream Receiver */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white uppercase">Camera Receiver</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              camera?.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-industrial-800 text-industrial-400'
            }`}>
              {camera?.status?.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-industrial-300">
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Target Stream URL:</span>
              <span className="text-cyan-400 truncate max-w-xs">{camera?.stream_url}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Stream Resolution:</span>
              <span className="text-white">{camera?.resolution}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Frame Rate:</span>
              <span className="text-white">{camera?.fps} FPS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Reader Thread:</span>
              <span className="text-emerald-400">Zero-latency non-blocking loop</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-industrial-500">Auto Reconnection:</span>
              <span className="text-white">Active (50 retries)</span>
            </div>
          </div>
        </div>

        {/* Card 3: SQLite Persistent Database */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white uppercase">SQLite Database</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              WAL MODE ENABLED
            </span>
          </div>

          <div className="space-y-2 text-industrial-300">
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Storage File:</span>
              <span className="text-cyan-400">database/inspectai.db</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Tables:</span>
              <span className="text-white">inspections, detections, settings</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Concurrency:</span>
              <span className="text-white">Thread-Safe Connection Pooling</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-industrial-500">Retention Independence:</span>
              <span className="text-emerald-400">Historical metadata permanently retained</span>
            </div>
          </div>
        </div>

        {/* Card 4: Local Storage & 100-Sec Retention Buffer */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white uppercase">Storage & Rolling Retention</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              100s ROLLING WINDOW
            </span>
          </div>

          <div className="space-y-2 text-industrial-300">
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Captures Directory:</span>
              <span className="text-cyan-400">storage/captures/</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Annotated Directory:</span>
              <span className="text-cyan-400">storage/annotated/</span>
            </div>
            <div className="flex justify-between py-1 border-b border-industrial-800/60">
              <span className="text-industrial-500">Retention Policy:</span>
              <span className="text-white">Auto-prune images older than 100s</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-industrial-500">Cleanup Frequency:</span>
              <span className="text-emerald-400">Daemon cycle every 3.0s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

