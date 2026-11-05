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
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ArrowRight
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
    setUploadSuccessMsg('');
    try {
      const res = await onUploadImage(file);
      if (res?.success) {
        const detCount = res.result?.defect_count || 0;
        setUploadSuccessMsg(
          `Image inspected: ${file.name} — Status: ${res.result?.status} (${detCount} defects detected)`
        );
      }
    } catch (err) {
      alert('Failed to inspect uploaded image: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const status = latestInspection?.status || 'PASS';
  const defectCount = latestInspection?.defect_count || 0;
  const detections = latestInspection?.detections || [];
  const latency = latestInspection?.inference_time_ms ? latestInspection.inference_time_ms.toFixed(1) : '0.0';
  const code = latestInspection?.inspection_code || 'INSP-STANDBY';
  const timestamp = latestInspection?.timestamp ? new Date(latestInspection.timestamp).toLocaleTimeString() : '—';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Hardware Stream & Control Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        {/* Left Side: Hardware Camera & Upload Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Webcam Device Selector */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-squircle border border-slate-200/80 dark:border-slate-700">
            <Camera className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {devices.map((dev) => (
                <option key={dev.index} value={String(dev.index)} className="dark:bg-slate-900">
                  {dev.label}
                </option>
              ))}
            </select>
          </div>

          {cameraStatus === 'Connected' ? (
            <button
              onClick={onDisconnectCamera}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-squircle bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-all text-xs font-semibold"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span>Turn Off Webcam</span>
            </button>
          ) : (
            <button
              onClick={() => onConnectCamera(selectedDevice)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-squircle bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all text-xs font-semibold"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Turn On Laptop Webcam</span>
            </button>
          )}

          <button
            onClick={() => api.enableFallbackCamera()}
            title="Use synthetic steel surface simulation if webcam is in use by another app"
            className="px-3 py-2 rounded-squircle bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-medium"
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
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-squircle bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100/80 transition-all text-xs font-semibold shadow-sm cursor-pointer"
            title="Upload an image from your PC to inspect for defects"
          >
            <Upload className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isUploading ? 'animate-bounce' : ''}`} />
            <span>{isUploading ? 'Inspecting...' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Right Side: Live Inspection Start/Stop & Manual Test Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 p-1 rounded-squircle border border-slate-200/80 dark:border-slate-700 space-x-1">
            <select
              value={testMode}
              onChange={(e) => setTestMode(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none px-2 py-1 cursor-pointer"
            >
              <option value="defect" className="dark:bg-slate-900">Sample Defect Strip</option>
              <option value="clean" className="dark:bg-slate-900">Sample Clean Strip</option>
            </select>
            <button
              onClick={handleTestFrame}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-squircle-xs bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm border border-slate-200/60 dark:border-slate-600 transition-all flex items-center space-x-1"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-500 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Frame</span>
            </button>
          </div>

          {isInspecting ? (
            <button
              onClick={onStopInspection}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-squircle bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 transition-all text-xs font-bold uppercase tracking-wider"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Inspection</span>
            </button>
          ) : (
            <button
              onClick={onStartInspection}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-squircle bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition-all text-xs font-bold uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start 1s Inspection</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadSuccessMsg && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-squircle-xl px-5 py-3 text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{uploadSuccessMsg} — Processed with YOLO11n ONNX</span>
          </div>
          <span className="text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full text-[10px]">
            INSPECTION COMPLETE
          </span>
        </div>
      )}

      {/* 2. Executive Inspection Status Banner */}
      <div className={`border rounded-squircle-xl p-5 shadow-sm transition-all flex flex-wrap items-center justify-between gap-4 ${
        status === 'PASS' 
          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100' 
          : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/40 text-rose-950 dark:text-rose-100'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-squircle-lg flex items-center justify-center font-black text-2xl tracking-widest text-white shadow-md ${
            status === 'PASS' 
              ? 'bg-emerald-500 shadow-emerald-500/25' 
              : 'bg-rose-600 shadow-rose-600/25 animate-pulse'
          }`}>
            {status}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {status === 'PASS' ? 'INSPECTION PASSED — NO CRITICAL DEFECTS' : `INSPECTION FAILED — ${defectCount} DEFECT(S) DETECTED`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Code: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{code}</span> | Timestamp: {timestamp} | Latency: <span className="font-mono text-slate-900 dark:text-white font-bold">{latency}ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div className="text-right">
            <div className="text-slate-400 dark:text-slate-500 font-medium">Severstal Classes Flagged</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {detections.length > 0 ? Array.from(new Set(detections.map(d => d.class_name))).join(', ') : 'None (Clean)'}
            </div>
          </div>
          <div className="text-right border-l border-slate-200/80 dark:border-slate-800 pl-6">
            <div className="text-slate-400 dark:text-slate-500 font-medium">Max Confidence</div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {detections.length > 0 ? `${(Math.max(...detections.map(d => d.confidence)) * 100).toFixed(1)}%` : '0.0%'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Feeds: Laptop Camera Stream & AI Annotated Frame Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Laptop Camera Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-squircle bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">Live Laptop Camera</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block font-normal">Real-time hardware video stream</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStreamKey(Date.now())}
                title="Refresh Camera Video Stream"
                className="px-2.5 py-1 rounded-squircle-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1 text-[11px] font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
              <div className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                cameraStatus === 'Connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'Connected' ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span>{cameraStatus.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-video bg-slate-950 rounded-squircle-lg overflow-hidden flex items-center justify-center shadow-inner">
            <img
              key={streamKey}
              src={`/api/camera/stream?t=${streamKey}`}
              alt="Live Camera Feed"
              className="w-full h-full object-contain"
            />
            {/* Fallback overlay when stream is disconnected */}
            {cameraStatus !== 'Connected' && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                <VideoOff className="w-9 h-9 text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Laptop Camera Offline</h4>
                <p className="text-xs text-slate-300 max-w-sm mt-1">
                  Click "Turn On Laptop Webcam" above to activate your computer's built-in camera.
                </p>
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur rounded-squircle-xs text-[10px] font-mono text-cyan-300 border border-white/10">
              BUILT-IN WEBCAM STREAM
            </div>
          </div>
        </div>

        {/* Latest AI Annotated Frame */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-squircle bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">Latest AI Annotated Inspection</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block font-normal">YOLO11n defect bounding box overlay</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                YOLO11n-ONNX
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {latency}ms
              </span>
            </div>
          </div>

          <div className="relative aspect-video bg-slate-950 rounded-squircle-lg overflow-hidden flex items-center justify-center shadow-inner">
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
              />
            )}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur rounded-squircle-xs text-[10px] font-mono text-emerald-300 border border-white/10">
              YOLO11n DEFECT OVERLAY
            </div>
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur rounded-squircle-xs text-[10px] font-mono text-slate-300 border border-white/10">
              100s Rolling Retention
            </div>
          </div>
        </div>
      </div>

      {/* 4. Structured Defect Detection Details Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl overflow-hidden shadow-sm transition-colors">
        <div className="h-14 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-squircle bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block font-sans">
                Defect Telemetry ({detections.length} Flagged)
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-normal">
                Inspection ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{latestInspection?.id || '—'}</strong>
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
            Severstal Standard Benchmark
          </span>
        </div>

        {detections.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Surface Clean — No Defects Detected</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              All defect predictions are below the configured confidence threshold. Production sample meets quality specifications.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">Defect Class</th>
                  <th className="py-3 px-6">Confidence</th>
                  <th className="py-3 px-6">Bounding Box (X1, Y1, X2, Y2)</th>
                  <th className="py-3 px-6">Dimensions</th>
                  <th className="py-3 px-6">Quality Gating Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {detections.map((det, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400 dark:text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                        {det.class_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {det.confidence_pct || `${(det.confidence * 100).toFixed(1)}%`}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-slate-300">
                      [{det.x1}, {det.y1}, {det.x2}, {det.y2}]
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500 dark:text-slate-400">
                      {det.width || (det.x2 - det.x1)} x {det.height || (det.y2 - det.y1)} px
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>REJECT / TRIM CORRECTION</span>
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
