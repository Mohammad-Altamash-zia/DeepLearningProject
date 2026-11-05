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
  ArrowRight,
  ShieldCheck,
  Clock
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
          `Image analyzed: ${file.name} — Status: ${res.result?.status} (${detCount} defects detected)`
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
      {/* Prominent Page Title with Organic Curvature */}
      <div className="modular-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="pill-badge px-3 py-1 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-semibold border border-warm-300/50">
              Live Station
            </span>
            <span className="pill-badge px-3 py-1 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse mr-1.5" />
              Direct Hardware Capture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            Live Quality Vision Station
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-darkwarm-text-muted mt-1 max-w-2xl">
            Automated optical steel inspection, continuous 1 FPS defect inference, and real-time PASS/FAIL gating decisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick Upload Action */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="pill-btn flex items-center space-x-2 px-4 py-2.5 bg-warm-100 hover:bg-warm-200/80 dark:bg-darkwarm-surface dark:hover:bg-darkwarm-card text-charcoal-800 dark:text-warm-100 text-xs font-bold border border-warm-200 dark:border-darkwarm-border shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 text-earth-olive" />
            <span>Upload Image File</span>
          </button>
        </div>
      </div>

      {/* 1. Hardware Stream & Control Action Bar (Modular Floating Card with Pill Buttons) */}
      <div className="modular-card p-5 flex flex-wrap items-center justify-between gap-4 transition-colors">
        {/* Left Side: Hardware Camera & Upload Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Webcam Device Selector */}
          <div className="flex items-center space-x-2 bg-warm-50 dark:bg-darkwarm-surface px-3.5 py-2 rounded-full border border-warm-200 dark:border-darkwarm-border text-xs">
            <Camera className="w-4 h-4 text-charcoal-500 dark:text-darkwarm-text-muted" />
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-transparent text-xs font-semibold text-charcoal-800 dark:text-warm-200 focus:outline-none cursor-pointer"
            >
              {devices.map((dev) => (
                <option key={dev.index} value={String(dev.index)} className="dark:bg-darkwarm-card">
                  {dev.label}
                </option>
              ))}
            </select>
          </div>

          {cameraStatus === 'Connected' ? (
            <button
              onClick={onDisconnectCamera}
              className="pill-btn flex items-center space-x-1.5 px-4 py-2 bg-earth-terracotta-bg dark:bg-earth-terracotta/20 text-earth-terracotta border border-earth-terracotta/30 hover:bg-earth-terracotta hover:text-white transition-all text-xs font-semibold"
            >
              <VideoOff className="w-3.5 h-3.5" />
              <span>Turn Off Webcam</span>
            </button>
          ) : (
            <button
              onClick={() => onConnectCamera(selectedDevice)}
              className="pill-btn flex items-center space-x-1.5 px-4 py-2 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile transition-all text-xs font-semibold"
            >
              <Video className="w-3.5 h-3.5 text-neon-lime-accent dark:text-charcoal-900" />
              <span>Turn On Laptop Webcam</span>
            </button>
          )}

          <button
            onClick={() => api.enableFallbackCamera()}
            title="Use synthetic steel surface simulation if webcam is in use by another app"
            className="pill-btn px-4 py-2 bg-warm-100 hover:bg-warm-200 dark:bg-darkwarm-surface dark:hover:bg-darkwarm-card text-charcoal-700 dark:text-warm-200 border border-warm-200 dark:border-darkwarm-border transition-all text-xs font-semibold"
          >
            Simulate Synthetic Feed
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
            className="pill-btn flex items-center space-x-1.5 px-4 py-2 bg-earth-olive-bg dark:bg-earth-olive/20 text-earth-olive border border-earth-olive/30 hover:bg-earth-olive hover:text-white transition-all text-xs font-semibold shadow-sm cursor-pointer"
            title="Upload an image from your PC to inspect for defects"
          >
            <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
            <span>{isUploading ? 'Inspecting...' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Right Side: Manual Test Strip & Start/Stop Inspection */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-warm-50 dark:bg-darkwarm-surface p-1 rounded-full border border-warm-200 dark:border-darkwarm-border space-x-1">
            <select
              value={testMode}
              onChange={(e) => setTestMode(e.target.value)}
              className="bg-transparent text-xs font-semibold text-charcoal-700 dark:text-warm-200 focus:outline-none px-3 py-1 cursor-pointer"
            >
              <option value="defect" className="dark:bg-darkwarm-card">Sample Defect Strip</option>
              <option value="clean" className="dark:bg-darkwarm-card">Sample Clean Strip</option>
            </select>
            <button
              onClick={handleTestFrame}
              disabled={isTesting}
              className="pill-btn px-3.5 py-1.5 bg-white dark:bg-darkwarm-card hover:bg-warm-100 text-charcoal-800 dark:text-warm-100 text-xs font-bold shadow-tactile border border-warm-200 dark:border-darkwarm-border transition-all flex items-center space-x-1.5"
            >
              <Zap className={`w-3.5 h-3.5 text-earth-amber ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Frame</span>
            </button>
          </div>

          {isInspecting ? (
            <button
              onClick={onStopInspection}
              className="pill-btn flex items-center space-x-2 px-5 py-2.5 bg-earth-terracotta hover:bg-red-700 text-white shadow-tactile text-xs font-bold uppercase tracking-wider"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Inspection</span>
            </button>
          ) : (
            <button
              onClick={onStartInspection}
              className="pill-btn flex items-center space-x-2 px-5 py-2.5 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile text-xs font-bold uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-current text-neon-lime-accent dark:text-charcoal-900" />
              <span>Start 1s Cadence</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadSuccessMsg && (
        <div className="bg-warm-50 dark:bg-darkwarm-surface border border-warm-300 dark:border-darkwarm-border text-charcoal-800 dark:text-warm-200 rounded-2xl px-5 py-3 text-xs font-medium flex items-center justify-between shadow-tactile">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-neon-lime-dark dark:text-neon-lime-accent" />
            <span>{uploadSuccessMsg} — Processed with YOLO11n ONNX</span>
          </div>
          <span className="pill-badge px-2.5 py-0.5 bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent font-bold text-[10px] border border-neon-lime/30">
            INSPECTION COMPLETE
          </span>
        </div>
      )}

      {/* 2. Executive Inspection Status Banner (Tactile Floating Card) */}
      <div className={`modular-card p-6 flex flex-wrap items-center justify-between gap-4 transition-all ${
        status === 'PASS' 
          ? 'border-neon-lime/40 dark:border-neon-lime/30' 
          : 'border-earth-terracotta/40 dark:border-earth-terracotta/30'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl tracking-widest text-white shadow-tactile ${
            status === 'PASS' 
              ? 'bg-neon-lime-dark shadow-glow-lime' 
              : 'bg-earth-terracotta animate-pulse'
          }`}>
            {status}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-charcoal-900 dark:text-warm-100">
                {status === 'PASS' ? 'INSPECTION PASSED — NO CRITICAL SURFACE DEFECTS' : `INSPECTION FAILED — ${defectCount} DEFECT(S) FLAGGED`}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted font-medium mt-1">
              Code: <span className="font-mono text-charcoal-800 dark:text-warm-200 font-bold">{code}</span> | Timestamp: {timestamp} | Latency: <span className="font-mono text-charcoal-900 dark:text-warm-100 font-bold">{latency}ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-charcoal-400 dark:text-darkwarm-text-muted uppercase tracking-wider block">
              Confidence Gating
            </span>
            <span className="text-xs font-bold text-charcoal-800 dark:text-warm-200">
              0.25 Threshold Applied
            </span>
          </div>
          <div className="w-px h-8 bg-warm-200 dark:bg-darkwarm-border" />
          <div className="text-right">
            <span className="text-[11px] font-semibold text-charcoal-400 dark:text-darkwarm-text-muted uppercase tracking-wider block">
              Retention
            </span>
            <span className="text-xs font-bold text-charcoal-800 dark:text-warm-200">
              100s Rolling Purge
            </span>
          </div>
        </div>
      </div>

      {/* 3. Video Displays Grid (Dual Modular Floating Viewports) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw Hardware Camera Stream */}
        <div className="modular-card overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-warm-100 dark:border-darkwarm-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border flex items-center justify-center text-charcoal-700 dark:text-warm-200">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans">
                  Raw Optical Feed
                </h3>
                <span className="text-[10px] text-charcoal-400 dark:text-darkwarm-text-muted font-mono">
                  Input Stream: {cameraStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStreamKey(Date.now())}
                title="Refresh Stream Connection"
                className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-darkwarm-surface text-charcoal-500 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <span className={`pill-badge px-2.5 py-0.5 text-[10px] font-bold ${
                cameraStatus === 'Connected' 
                  ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent border border-neon-lime/30' 
                  : 'bg-warm-200 text-charcoal-500'
              }`}>
                {cameraStatus === 'Connected' ? 'STREAM LIVE' : 'NO SIGNAL'}
              </span>
            </div>
          </div>

          <div className="bg-charcoal-950 aspect-video relative flex items-center justify-center overflow-hidden">
            <img
              key={`stream-${streamKey}`}
              src={`/api/camera/stream?t=${streamKey}`}
              alt="Raw Live Camera"
              className="w-full h-full object-contain"
            />
            {cameraStatus !== 'Connected' && (
              <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-warm-200">
                <VideoOff className="w-10 h-10 mb-3 text-warm-400" />
                <p className="text-xs font-bold text-warm-100">Webcam Not Connected</p>
                <p className="text-[11px] text-warm-400 mt-1 max-w-xs">
                  Click 'Turn On Laptop Webcam' above or select 'Simulate Synthetic Feed' to begin.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-warm-50 dark:bg-darkwarm-surface border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-[11px] text-charcoal-500 dark:text-darkwarm-text-muted font-mono">
            <span>DEVICE: LAPTOP_INTEGRATED_HD</span>
            <span>FPS: 30.0</span>
          </div>
        </div>

        {/* Right: AI Inferred & Annotated Frame */}
        <div className="modular-card overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-warm-100 dark:border-darkwarm-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-neon-lime-bg dark:bg-neon-lime-dark/20 border border-neon-lime/30 flex items-center justify-center text-neon-lime-dark dark:text-neon-lime-accent">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans">
                  YOLO11n AI Annotated Result
                </h3>
                <span className="text-[10px] text-charcoal-400 dark:text-darkwarm-text-muted font-mono">
                  Code: {code}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAnnotatedKey(Date.now())}
                title="Reload Latest Annotated Frame"
                className="p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-darkwarm-surface text-charcoal-500 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <span className={`pill-badge px-2.5 py-0.5 text-[10px] font-bold ${
                status === 'PASS' 
                  ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent border border-neon-lime/30' 
                  : 'bg-earth-terracotta-bg dark:bg-earth-terracotta/25 text-earth-terracotta border border-earth-terracotta/30'
              }`}>
                {status} ({defectCount} DEFECTS)
              </span>
            </div>
          </div>

          <div className="bg-charcoal-950 aspect-video relative flex items-center justify-center overflow-hidden">
            <img
              key={`annotated-${annotatedKey}`}
              src={`/api/images/latest?t=${annotatedKey}`}
              alt="Latest Annotated Frame"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-3 bg-warm-50 dark:bg-darkwarm-surface border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between text-[11px] text-charcoal-500 dark:text-darkwarm-text-muted font-mono">
            <span>MODEL: YOLO11n ONNX</span>
            <span>INFERENCE: {latency} ms</span>
          </div>
        </div>
      </div>

      {/* 4. Live Defect Detections Table (Modular Floating Card) */}
      <div className="modular-card overflow-hidden transition-colors">
        <div className="h-14 px-6 border-b border-warm-100 dark:border-darkwarm-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border flex items-center justify-center text-charcoal-700 dark:text-warm-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans block">
                Detected Defect Entities in Current Frame
              </span>
              <span className="text-[11px] text-charcoal-400 dark:text-darkwarm-text-muted block font-normal">
                Class, Confidence, and Bounding Coordinates
              </span>
            </div>
          </div>
          <span className="pill-badge px-3 py-1 bg-warm-100 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 font-semibold text-xs border border-warm-200 dark:border-darkwarm-border">
            {detections.length} Entities Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-warm-50 dark:bg-darkwarm-surface text-charcoal-500 dark:text-darkwarm-text-muted font-semibold border-b border-warm-100 dark:border-darkwarm-border">
              <tr>
                <th className="py-3 px-6">Entity #</th>
                <th className="py-3 px-6">Defect Class</th>
                <th className="py-3 px-6">Confidence Score</th>
                <th className="py-3 px-6">Bounding Box (X1, Y1, X2, Y2)</th>
                <th className="py-3 px-6">Severity Gating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 dark:divide-darkwarm-border font-sans">
              {detections && detections.length > 0 ? (
                detections.map((det, idx) => (
                  <tr key={idx} className="hover:bg-warm-50/70 dark:hover:bg-darkwarm-surface/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-charcoal-400 dark:text-darkwarm-text-muted font-semibold">#{idx + 1}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-earth-terracotta bg-earth-terracotta-bg dark:bg-earth-terracotta/20 px-2.5 py-0.5 rounded-full border border-earth-terracotta/30 text-[11px]">
                        {det.class_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-charcoal-800 dark:text-warm-200 font-bold">
                      {(det.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-6 font-mono text-charcoal-500 dark:text-darkwarm-text-muted text-[11px]">
                      [{det.bbox.map(b => Math.round(b)).join(', ')}]
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="pill-badge px-2.5 py-0.5 bg-earth-terracotta text-white font-bold text-[10px] uppercase">
                        Defect Rejection
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-charcoal-400 dark:text-darkwarm-text-muted">
                    No defect entities detected in current frame. Surface meets quality tolerance (PASS).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
