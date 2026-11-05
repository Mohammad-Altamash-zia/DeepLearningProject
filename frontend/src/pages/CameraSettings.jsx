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
      {/* Prominent Page Title with Organic Curvature */}
      <div className="modular-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="pill-badge px-3 py-1 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-semibold border border-warm-300/50">
              Configuration
            </span>
            <span className="pill-badge px-3 py-1 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse mr-1.5" />
              Real-Time Tuning
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            Camera & Inspection Parameters
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-darkwarm-text-muted mt-1 max-w-2xl">
            Configure your laptop webcam device, frame scheduling, YOLO thresholds, and 100-second retention.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="pill-btn flex items-center space-x-2 px-5 py-2.5 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile text-xs font-bold transition-all"
          >
            <Save className="w-3.5 h-3.5 text-neon-lime-accent dark:text-charcoal-900" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Laptop Camera Device */}
        <div className="modular-card p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-warm-100 dark:border-darkwarm-border pb-3">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-earth-olive" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans">
                1. Hardware Camera Source
              </h3>
            </div>
            <span className="pill-badge px-3 py-0.5 font-semibold text-charcoal-700 dark:text-warm-200 bg-warm-100 dark:bg-darkwarm-surface text-[11px] border border-warm-200 dark:border-darkwarm-border">
              Direct Hardware Access
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-warm-200 mb-1.5">
              Webcam Device Index or Stream URL
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={settings.camera_url}
                onChange={(e) => setSettings({ ...settings, camera_url: e.target.value })}
                placeholder="0 (Built-in Laptop Camera) or rtsp://..."
                className="flex-1 bg-warm-50 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border rounded-full px-4 py-2 text-xs text-charcoal-800 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:border-charcoal-900 dark:focus:border-warm-200 transition-all font-mono shadow-inner"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="pill-btn px-4 py-2 bg-warm-100 hover:bg-warm-200 dark:bg-darkwarm-surface dark:hover:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border text-charcoal-800 dark:text-warm-100 text-xs font-semibold transition-all shadow-sm flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Camera</span>
              </button>
            </div>
            <p className="text-[11px] text-charcoal-400 dark:text-darkwarm-text-muted mt-1.5">
              Default is <strong>0</strong> for the integrated laptop webcam. Pass 1, 2 for external USB cameras.
            </p>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2.5 border ${
              testResult.success 
                ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent border-neon-lime/30' 
                : 'bg-earth-terracotta-bg dark:bg-earth-terracotta/20 text-earth-terracotta border-earth-terracotta/30'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Section 2: Capture Cadence & YOLO Inference Gating */}
        <div className="modular-card p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-warm-100 dark:border-darkwarm-border pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-neon-lime-dark dark:text-neon-lime-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 font-sans">
                2. Automated Inference & Timing Parameters
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Capture Interval */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-charcoal-700 dark:text-warm-200">Capture Cadence Interval</label>
                <span className="font-mono font-bold text-charcoal-900 dark:text-warm-100">{settings.capture_interval}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={settings.capture_interval}
                onChange={(e) => setSettings({ ...settings, capture_interval: parseFloat(e.target.value) })}
                className="w-full accent-charcoal-900 dark:accent-neon-lime cursor-pointer"
              />
              <span className="text-[11px] text-charcoal-400 dark:text-darkwarm-text-muted block">
                Standard industrial cadence is 1 frame per second.
              </span>
            </div>

            {/* Confidence Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-charcoal-700 dark:text-warm-200">YOLO Confidence Threshold</label>
                <span className="font-mono font-bold text-charcoal-900 dark:text-warm-100">{(settings.confidence_threshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.confidence_threshold}
                onChange={(e) => setSettings({ ...settings, confidence_threshold: parseFloat(e.target.value) })}
                className="w-full accent-charcoal-900 dark:accent-neon-lime cursor-pointer"
              />
              <span className="text-[11px] text-charcoal-400 dark:text-darkwarm-text-muted block">
                Minimum probability to classify Severstal defect entity.
              </span>
            </div>

            {/* IoU NMS Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-charcoal-700 dark:text-warm-200">NMS IoU Suppression</label>
                <span className="font-mono font-bold text-charcoal-900 dark:text-warm-100">{(settings.iou_threshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={settings.iou_threshold}
                onChange={(e) => setSettings({ ...settings, iou_threshold: parseFloat(e.target.value) })}
                className="w-full accent-charcoal-900 dark:accent-neon-lime cursor-pointer"
              />
              <span className="text-[11px] text-charcoal-400 dark:text-darkwarm-text-muted block">
                Overlapping bounding box threshold for NMS filtering.
              </span>
            </div>

            {/* Disk Retention Period */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-charcoal-700 dark:text-warm-200">Rolling Local Disk Retention</label>
                <span className="font-mono font-bold text-charcoal-900 dark:text-warm-100">{settings.retention_period}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={settings.retention_period}
                onChange={(e) => setSettings({ ...settings, retention_period: parseInt(e.target.value, 10) })}
                className="w-full accent-charcoal-900 dark:accent-neon-lime cursor-pointer"
              />
              <span className="text-[11px] text-charcoal-400 dark:text-darkwarm-text-muted block">
                Physical captures deleted after retention window. SQLite metadata remains permanent.
              </span>
            </div>
          </div>
        </div>

        {/* Save Notification / Action Button */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center space-x-2 text-xs text-neon-lime-dark dark:text-neon-lime-accent font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Inspection parameters successfully persisted!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="pill-btn flex items-center space-x-2 px-6 py-2.5 bg-charcoal-900 hover:bg-black dark:bg-warm-100 dark:hover:bg-white text-white dark:text-charcoal-900 shadow-tactile text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Save className="w-3.5 h-3.5 text-neon-lime-accent dark:text-charcoal-900" />
            <span>{isSaving ? 'Saving...' : 'Apply & Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
