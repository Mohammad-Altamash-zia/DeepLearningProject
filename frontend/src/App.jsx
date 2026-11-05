import React, { useState, useEffect } from 'react';
import TopHeader from './components/TopHeader';
import DashboardOverview from './pages/DashboardOverview';
import LiveInspection from './pages/LiveInspection';
import InspectionHistory from './pages/InspectionHistory';
import Analytics from './pages/Analytics';
import CameraSettings from './pages/CameraSettings';
import SystemStatus from './pages/SystemStatus';
import About from './pages/About';
import { api, wsService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // Default to Live Inspection
  const [cameraStatus, setCameraStatus] = useState('Disconnected');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [latestInspection, setLatestInspection] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [defectDist, setDefectDist] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [inspectionTelemetry, setInspectionTelemetry] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('inspectai_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Synchronize dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('inspectai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('inspectai_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Initial Data Fetch
  const refreshAllData = async () => {
    try {
      const [health, model, cam, inspStatus, sum, defects, history] = await Promise.all([
        api.getHealth(),
        api.getModelStatus(),
        api.getCameraStatus(),
        api.getInspectionStatus(),
        api.getAnalyticsSummary(),
        api.getDefectDistribution(),
        api.getInspections(1, 10),
      ]);

      setSystemHealth(health);
      setModelLoaded(model?.is_loaded || false);
      setCameraStatus(cam?.status || 'Disconnected');
      setIsInspecting(inspStatus?.is_inspecting || false);
      setInspectionTelemetry(inspStatus);
      setAnalytics(sum);
      setDefectDist(defects || []);
      setRecentInspections(history?.items || []);
      if (inspStatus?.last_inspection) {
        setLatestInspection(inspStatus.last_inspection);
      }
    } catch (e) {
      console.error('Initial data loading failed:', e);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Connect WebSocket
    wsService.connect();

    const unsubscribe = wsService.subscribe((msg) => {
      if (msg.type === 'NEW_INSPECTION') {
        const item = msg.data;
        setLatestInspection(item);
        setRecentInspections((prev) => [item, ...prev.slice(0, 14)]);
      } else if (msg.type === 'STATISTICS_UPDATE') {
        setAnalytics(msg.data);
        api.getDefectDistribution().then((d) => setDefectDist(d || []));
      } else if (msg.type === 'INSPECTION_STATUS') {
        setIsInspecting(msg.data.is_inspecting);
        setInspectionTelemetry(msg.data);
      } else if (msg.type === 'CAMERA_STATUS') {
        setCameraStatus(msg.data.status);
      } else if (msg.type === 'INIT_STATE') {
        if (msg.data.camera) setCameraStatus(msg.data.camera.status);
        if (msg.data.inspection) {
          setIsInspecting(msg.data.inspection.is_inspecting);
          setInspectionTelemetry(msg.data.inspection);
        }
        if (msg.data.model_loaded !== undefined) setModelLoaded(msg.data.model_loaded);
      }
    });

    return () => unsubscribe();
  }, []);

  // Periodic Telemetry Poll (Every 4 seconds)
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const [cam, inspStatus, health] = await Promise.all([
          api.getCameraStatus(),
          api.getInspectionStatus(),
          api.getHealth(),
        ]);
        setCameraStatus(cam.status);
        setIsInspecting(inspStatus.is_inspecting);
        setInspectionTelemetry(inspStatus);
        setSystemHealth(health);
      } catch (e) {
        // Silent poll error
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Actions
  const handleStartInspection = async () => {
    try {
      await api.startInspection();
      setIsInspecting(true);
    } catch (e) {
      alert('Failed to start inspection: ' + e.message);
    }
  };

  const handleStopInspection = async () => {
    try {
      await api.stopInspection();
      setIsInspecting(false);
    } catch (e) {
      alert('Failed to stop inspection: ' + e.message);
    }
  };

  const handleConnectCamera = async (url) => {
    try {
      await api.connectCamera(url);
      setCameraStatus('Connecting');
    } catch (e) {
      alert('Failed to initiate camera connection: ' + e.message);
    }
  };

  const handleDisconnectCamera = async () => {
    try {
      await api.disconnectCamera();
      setCameraStatus('Disconnected');
    } catch (e) {
      alert('Failed to disconnect camera: ' + e.message);
    }
  };

  const handleTestSingle = async (useSample, sampleType) => {
    try {
      const res = await api.testSingleInspection(useSample, sampleType);
      if (res.result) {
        setLatestInspection(res.result);
        setRecentInspections((prev) => [res.result, ...prev.slice(0, 14)]);
      }
    } catch (e) {
      alert('Inspection test failed: ' + e.message);
    }
  };

  const handleUploadImage = async (file) => {
    const res = await api.uploadImage(file);
    if (res?.result) {
      setLatestInspection(res.result);
      setRecentInspections((prev) => [res.result, ...prev.slice(0, 14)]);
      return res;
    }
    return res;
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-100 dark:bg-darkwarm-bg font-sans text-charcoal-900 dark:text-darkwarm-text selection:bg-neon-lime/30 transition-colors duration-250">
      {/* Clean Top Navigation featuring Rounded Pill Buttons */}
      <TopHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cameraStatus={cameraStatus}
        modelLoaded={modelLoaded}
        isInspecting={isInspecting}
        onStartInspection={handleStartInspection}
        onStopInspection={handleStopInspection}
        systemHealth={systemHealth}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Spacious Canvas with Soft Warm Pattern */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-warm-pattern overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              analytics={analytics}
              inspectionTelemetry={inspectionTelemetry}
              defectDist={defectDist}
              recentInspections={recentInspections}
              cameraStatus={cameraStatus}
              isInspecting={isInspecting}
              onSelectInspection={(id) => {
                setSelectedInspectionId(id);
                setActiveTab('history');
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'live' && (
            <LiveInspection
              cameraStatus={cameraStatus}
              isInspecting={isInspecting}
              latestInspection={latestInspection}
              onStartInspection={handleStartInspection}
              onStopInspection={handleStopInspection}
              onConnectCamera={handleConnectCamera}
              onDisconnectCamera={handleDisconnectCamera}
              onTestSingle={handleTestSingle}
              onUploadImage={handleUploadImage}
            />
          )}

          {activeTab === 'history' && (
            <InspectionHistory
              selectedInspectionId={selectedInspectionId}
              onCloseModal={() => setSelectedInspectionId(null)}
            />
          )}

          {activeTab === 'analytics' && <Analytics />}

          {activeTab === 'settings' && <CameraSettings />}

          {activeTab === 'system' && <SystemStatus />}

          {activeTab === 'about' && <About />}
        </div>
      </main>
    </div>
  );
}
