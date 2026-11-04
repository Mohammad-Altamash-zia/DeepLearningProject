import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Video, 
  VideoOff, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Crosshair,
  ExternalLink,
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveInspection({ 
  cameraStatus, 
  isInspecting, 
  latestInspection,
  onStartInspection, 
  onStopInspection,
  onConnectCamera,
  onDisconnectCamera,
  onTestSingle,
  onUploadImage
}) {
  const [selectedDevice, setSelectedDevice] = useState('0');
  const [devices, setDevices] = useState([{ index: 0, label: 'Built-in Laptop Camera (Device 0)' }]);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [annotatedKey, setAnnotatedKey] = useState(Date.now());
  const [isTesting, setIsTesting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [testMode, setTestMode] = useState('defect'); // 'defect' or 'clean'
  const fileInputRef = useRef(null);

  // Fetch available camera devices on mount
  useEffect(() => {
    api.getCameraDevices().then(devs => {
      if (Array.isArray(devs) && devs.length > 0) {
        setDevices(devs);
      }
    }).catch(() => {});

    api.getCameraStatus().then(st => {
      if (st?.stream_url) setSelectedDevice(String(st.stream_url));
    });
  }, []);

  // Refresh camera stream key whenever camera connects
  useEffect(() => {
    if (cameraStatus === 'Connected') {
      setStreamKey(Date.now());
    }
  }, [cameraStatus]);

  // Update annotated frame timestamp whenever a new inspection arrives
  useEffect(() => {
    if (latestInspection) {
      setAnnotatedKey(Date.now());
    }
  }, [latestInspection]);

  const handleTestFrame = async () => {
    setIsTesting(true);
    try {
      await onTestSingle(true, testMode);
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      if (onUploadImage) {
        await onUploadImage(file);
      } else {
        await api.uploadImage(file);
      }
      setUploadSuccessMsg(`Inspected: ${file.name}`);
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const status = latestInspection?.status || 'PASS';
  const defectCount = latestInspection?.defect_count || 0;
  const detections = latestInspection?.detections || [];
  const latency = latestInspection?.inference_time_ms || 0.0;
  const code = latestInspection?.inspection_code || 'STANDBY';
  const timestamp = latestInspection?.timestamp ? new Date(latestInspection.timestamp).toLocaleTimeString() : '--:--:--';

  return (
    <div className="space-y-6">
      {/* 1. Control Toolbar */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Laptop Webcam Selection and Connect/Disconnect */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[320px]">
          <div className="flex items-center space-x-2 bg-industrial-950 border border-industrial-700 rounded-lg px-3 py-2 flex-1 min-w-[240px]">
            <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedDevice}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDevice(val);
                if (cameraStatus === 'Connected') {
                  onConnectCamera(val);
                }
              }}
              className="bg-transparent text-xs font-mono text-white focus:outline-none w-full cursor-pointer"
            >
              {devices.map((d) => (
                <option key={d.index} value={String(d.index)} className="bg-industrial-900 text-white">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {cameraStatus === 'Connected' ? (
            <button
              onClick={onDisconnectCamera}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-xs font-medium"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span>Turn Off Webcam</span>
            </button>
          ) : (
            <button
              onClick={() => onConnectCamera(selectedDevice)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all text-xs font-semibold shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Turn On Laptop Webcam</span>
            </button>
          )}

          <button
            onClick={() => api.enableFallbackCamera()}
            title="Use synthetic steel surface simulation if webcam is in use by another app"
            className="px-3 py-2 rounded-lg bg-industrial-800 text-industrial-300 hover:text-white border border-industrial-700 transition-all text-xs font-mono"
          >
            Simulate Feed
          </button>

          {/* Upload Image for Defect Detection */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all text-xs font-mono font-medium shadow-sm cursor-pointer"
            title="Upload an image from your PC to inspect for defects"
          >
            <Upload className={`w-3.5 h-3.5 text-indigo-400 ${isUploading ? 'animate-bounce' : ''}`} />
            <span>{isUploading ? 'Inspecting...' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Live Inspection Start/Stop & Manual Test Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-industrial-950 p-1 rounded-lg border border-industrial-800 space-x-1">
            <select
              value={testMode}
              onChange={(e) => setTestMode(e.target.value)}
              className="bg-transparent text-xs font-mono text-industrial-400 focus:outline-none px-2 py-1"
            >
              <option value="defect" className="bg-industrial-900 text-white">Sample Defect Strip</option>
              <option value="clean" className="bg-industrial-900 text-white">Sample Clean Strip</option>
            </select>
            <button
              onClick={handleTestFrame}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-md bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono transition-all flex items-center space-x-1"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-400 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Frame</span>
            </button>
          </div>

          {isInspecting ? (
            <button
              onClick={onStopInspection}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/20"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Inspection</span>
            </button>
          ) : (
            <button
              onClick={onStartInspection}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 1s Inspection</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadSuccessMsg && (
        <div className="bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 rounded-xl px-4 py-2.5 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{uploadSuccessMsg} — Processed with YOLO11n ONNX</span>
          </div>
          <span className="text-indigo-400 font-bold">INSPECTION COMPLETE</span>
        </div>
      )}

      {/* 2. Executive Inspection Status Banner */}
      <div className={`border rounded-xl p-4 transition-all flex flex-wrap items-center justify-between gap-4 ${
        status === 'PASS' 
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
          : 'bg-red-950/25 border-red-500/40 text-red-300'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl tracking-widest border shadow-inner ${
            status === 'PASS' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
          }`}>
            {status}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white font-mono">
                {status === 'PASS' ? 'INSPECTION PASSED — NO CRITICAL DEFECTS' : `INSPECTION FAILED — ${defectCount} DEFECT(S) DETECTED`}
              </span>
            </div>
            <p className="text-xs text-industrial-400 font-mono mt-0.5">
              Code: <span className="text-cyan-400">{code}</span> | Timestamp: {timestamp} | Latency: <span className="text-white font-bold">{latency}ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-industrial-400">Severstal Classes Flagged</div>
            <div className="text-base font-bold text-white">
              {detections.length > 0 ? Array.from(new Set(detections.map(d => d.class_name))).join(', ') : 'None'}
            </div>
          </div>
          <div className="text-right border-l border-industrial-800 pl-6">
            <div className="text-industrial-400">Max Confidence</div>
            <div className="text-base font-bold text-amber-400">
              {detections.length > 0 ? `${(Math.max(...detections.map(d => d.confidence)) * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Feeds: Laptop Camera Stream & AI Annotated Frame Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Laptop Camera Stream */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-10 px-4 bg-industrial-850 border-b border-industrial-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-industrial-300">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider">Live Laptop Camera</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <button
                onClick={() => setStreamKey(Date.now())}
                title="Refresh Camera Video Stream"
                className="p-1 rounded hover:bg-industrial-800 text-industrial-400 hover:text-white transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="text-[10px]">Refresh</span>
              </button>
              <div className="flex items-center space-x-1.5 border-l border-industrial-800 pl-2">
                <span className={`w-2 h-2 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-400 animate-ping' : 'bg-industrial-600'}`} />
                <span className="text-industrial-400">{cameraStatus.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <img
              key={streamKey}
              src={`/api/camera/stream?t=${streamKey}`}
              alt="Live Camera Feed"
              className="w-full h-full object-contain"
            />
            {/* Fallback overlay when stream is disconnected */}
            {cameraStatus !== 'Connected' && (
              <div className="absolute inset-0 bg-industrial-950/80 flex flex-col items-center justify-center p-6 text-center">
                <VideoOff className="w-10 h-10 text-industrial-600 mb-3" />
                <h4 className="text-sm font-semibold text-industrial-300">Laptop Camera Offline</h4>
                <p className="text-xs text-industrial-500 max-w-sm mt-1">
                  Click "Turn On Laptop Webcam" above to activate your computer's built-in camera.
                </p>
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-cyan-400 border border-white/10">
              BUILT-IN WEBCAM STREAM
            </div>
          </div>
        </div>

        {/* Latest AI Annotated Frame */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-10 px-4 bg-industrial-850 border-b border-industrial-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-industrial-300">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold uppercase tracking-wider">Latest AI Annotated Inspection</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <span className="text-cyan-400">YOLO11n-ONNX</span>
              <span className="text-industrial-600">|</span>
              <span className="text-industrial-400">{latency}ms</span>
            </div>
          </div>

          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {latestInspection?.annotated_image_url ? (
              <img
                src={`${latestInspection.annotated_image_url}?t=${annotatedKey}`}
                alt="Latest Annotated Inspection"
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={`/api/images/latest?t=${annotatedKey}`}
                alt="Latest Annotated Inspection"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-emerald-400 border border-white/10">
              YOLO11n DEFECT OVERLAY
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-industrial-400 border border-white/10">
              100s Rolling Retention
            </div>
          </div>
        </div>
      </div>

      {/* 4. Structured Defect Detection Details Table */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-sm">
        <div className="h-12 px-5 bg-industrial-850 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-industrial-200">
              Defect Telemetry ({detections.length} Detected)
            </span>
          </div>
          <span className="text-xs font-mono text-industrial-500">
            Inspection ID: <span className="text-industrial-300 font-semibold">{latestInspection?.id || '—'}</span>
          </span>
        </div>

        {detections.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-industrial-300">Surface Clean — No Defects Detected</h4>
            <p className="text-xs text-industrial-500 mt-1">
              All defect predictions are below the configured confidence threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-industrial-950 text-industrial-400 border-b border-industrial-800">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Defect Class</th>
                  <th className="py-2.5 px-4">Confidence</th>
                  <th className="py-2.5 px-4">Bounding Box (X1, Y1, X2, Y2)</th>
                  <th className="py-2.5 px-4">Dimensions</th>
                  <th className="py-2.5 px-4">Severity / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800">
                {detections.map((det, idx) => (
                  <tr key={idx} className="hover:bg-industrial-850/50 transition-colors">
                    <td className="py-3 px-4 text-industrial-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {det.class_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">
                      {det.confidence_pct || `${(det.confidence * 100).toFixed(1)}%`}
                    </td>
                    <td className="py-3 px-4 text-industrial-300">
                      [{det.x1}, {det.y1}, {det.x2}, {det.y2}]
                    </td>
                    <td className="py-3 px-4 text-industrial-400">
                      {det.width || (det.x2 - det.x1)} x {det.height || (det.y2 - det.y1)} px
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-red-400 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span>REJECT / TRIM</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

