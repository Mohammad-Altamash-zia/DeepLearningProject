import React, { useState, useEffect } from 'react';
import { Sliders, Video, CheckCircle2, AlertCircle, Save, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function CameraSettings() {
  const [settings, setSettings] = useState({
    camera_url: '0',
    capture_interval: 1.0,
    confidence_threshold: 0.25,
    iou_threshold: 0.45,
    retention_period: 100,
  });

  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) {
        setSettings({
          camera_url: s.camera_url || '0',
          capture_interval: parseFloat(s.capture_interval || 1.0),
          confidence_threshold: parseFloat(s.confidence_threshold || 0.25),
          iou_threshold: parseFloat(s.iou_threshold || 0.45),
          retention_period: parseInt(s.retention_period || 100, 10),
        });
      }
    });
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testCameraConnection(settings.camera_url);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save settings: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-sans">
              Camera & Inspection Parameters
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure your laptop webcam device, frame scheduling, YOLO thresholds, and 100-second retention.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Laptop Camera Device */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                1. Hardware Camera Source
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Direct Hardware Access
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Webcam Device Index or Stream URL
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={settings.camera_url}
                onChange={(e) => setSettings({ ...settings, camera_url: e.target.value })}
                placeholder="0 (Built-in Laptop Camera) or 1 (External USB)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Camera</span>
              </button>
            </div>

            {/* Test result feedback banner */}
            {testResult && (
              <div className={`mt-3 p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2.5 ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Supported Video Sources:</span>
              </div>
              <p>• <strong>0</strong> — Built-in Laptop Webcam (/dev/video0)</p>
              <p>• <strong>1, 2</strong> — External USB Webcams</p>
              <p>• <strong>http://&lt;phone-ip&gt;:8080/video</strong> — Optional Mobile IP Camera (IP Webcam app on Android)</p>
            </div>
          </div>
        </div>

        {/* Section 2: 1-Second Capture Scheduler */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              2. Capture Cadence & Bounded Queue
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              1.0s Default
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Capture Interval (seconds)</span>
              <span className="font-mono font-bold text-blue-600">{settings.capture_interval}s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={settings.capture_interval}
              onChange={(e) => setSettings({ ...settings, capture_interval: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Controls how frequently frames are dispatched to the YOLO11n ONNX inference queue.
            </p>
          </div>
        </div>

        {/* Section 3: Model Thresholds */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              3. YOLO11n Inference Thresholds
            </h3>
            <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
              Severstal Gating
            </span>
          </div>

          {/* Confidence Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Confidence Threshold (Conf)</span>
              <span className="font-mono font-bold text-blue-600">{(settings.confidence_threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={settings.confidence_threshold}
              onChange={(e) => setSettings({ ...settings, confidence_threshold: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Predictions below this value are discarded. PASS decision requires 0 defects above threshold.
            </p>
          </div>

          {/* IoU Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Non-Maximum Suppression (IoU)</span>
              <span className="font-mono font-bold text-blue-600">{(settings.iou_threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={settings.iou_threshold}
              onChange={(e) => setSettings({ ...settings, iou_threshold: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Suppresses overlapping duplicate bounding boxes for the same surface anomaly.
            </p>
          </div>
        </div>

        {/* Section 4: 100-Second Retention */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              4. Local Disk Retention Buffer
            </h3>
            <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
              100s Rolling
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Retention Period (Seconds)</span>
              <span className="font-mono font-bold text-blue-600">{settings.retention_period} seconds</span>
            </div>
            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={settings.retention_period}
              onChange={(e) => setSettings({ ...settings, retention_period: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The automated cleanup service deletes raw captures and annotated files older than this window. SQLite logs remain permanent.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Settings updated and active!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings persist immediately across system restarts.</span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
