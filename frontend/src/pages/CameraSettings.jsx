import React, { useState, useEffect } from 'react';
import { Sliders, Video, CheckCircle2, AlertCircle, Save, RefreshCw, Smartphone } from 'lucide-react';
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
          camera_url: s.camera_url || 'http://192.168.1.100:8080/video',
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
    <div className="max-w-4xl space-y-6">
      {/* Top Banner */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Camera & Inspection Parameters
            </h2>
            <p className="text-xs text-industrial-400 mt-0.5">
              Configure your laptop webcam device, frame scheduling, YOLO thresholds, and 100-second retention.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Laptop Camera Device */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                1. Laptop Camera Source
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">Direct Hardware Access</span>
          </div>

          <div>
            <label className="block text-xs font-mono text-industrial-300 mb-1.5">
              Webcam Device Index
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={settings.camera_url}
                onChange={(e) => setSettings({ ...settings, camera_url: e.target.value })}
                placeholder="0 (Built-in Laptop Camera) or 1 (External USB)"
                className="flex-1 bg-industrial-950 border border-industrial-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-industrial-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Camera</span>
              </button>
            </div>

            {/* Test result feedback banner */}
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg border text-xs font-mono flex items-center space-x-2 ${
                testResult.success 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="mt-3 p-3 bg-industrial-950 rounded-lg border border-industrial-800/80 text-[11px] font-mono text-industrial-400 space-y-1">
              <div className="flex items-center space-x-1.5 text-industrial-300 font-semibold mb-1">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Laptop Camera Hardware Mapping:</span>
              </div>
              <p>• Device <code className="text-cyan-400">0</code>: Laptop built-in integrated webcam (default).</p>
              <p>• Device <code className="text-cyan-400">1</code>: External USB plug-in webcam.</p>
              <p>• InspectAI accesses the hardware camera with zero network latency.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Automated Capture & AI Thresholds */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-sm space-y-6">
          <div className="border-b border-industrial-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              2. Capture & Inference Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capture Interval */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-industrial-300">Automated Capture Interval</span>
                <span className="text-cyan-400 font-bold">{settings.capture_interval} sec</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={settings.capture_interval}
                onChange={(e) => setSettings({ ...settings, capture_interval: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-industrial-500 mt-1 block">
                Standard industrial cadence: 1 frame/sec.
              </span>
            </div>

            {/* Image Retention Period */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-industrial-300">Rolling Image Retention Period</span>
                <span className="text-cyan-400 font-bold">{settings.retention_period} sec</span>
              </div>
              <input
                type="range"
                min="30"
                max="600"
                step="10"
                value={settings.retention_period}
                onChange={(e) => setSettings({ ...settings, retention_period: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-industrial-500 mt-1 block">
                Mandatory rolling buffer: default 100 seconds (removes expired files from disk).
              </span>
            </div>

            {/* YOLO Confidence Threshold */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-industrial-300">YOLO Confidence Threshold</span>
                <span className="text-amber-400 font-bold">{(settings.confidence_threshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={settings.confidence_threshold}
                onChange={(e) => setSettings({ ...settings, confidence_threshold: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-industrial-500 mt-1 block">
                Predictions below this cutoff are ignored (Default: 25%).
              </span>
            </div>

            {/* IoU NMS Threshold */}
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-industrial-300">NMS IoU Threshold</span>
                <span className="text-amber-400 font-bold">{settings.iou_threshold}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.iou_threshold}
                onChange={(e) => setSettings({ ...settings, iou_threshold: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-industrial-500 mt-1 block">
                Non-Maximum Suppression overlap threshold (Default: 0.45).
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Parameters saved to SQLite successfully!</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs font-mono tracking-wider transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

