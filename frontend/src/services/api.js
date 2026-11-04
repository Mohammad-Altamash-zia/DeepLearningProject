// API Client & WebSocket Service for InspectAI

const API_BASE = '/api';

export const api = {
  // Health & System
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
  getModelStatus: async () => {
    const res = await fetch(`${API_BASE}/model/status`);
    return res.json();
  },
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },
  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Camera
  getCameraStatus: async () => {
    const res = await fetch(`${API_BASE}/camera/status`);
    return res.json();
  },
  getCameraDevices: async () => {
    const res = await fetch(`${API_BASE}/camera/devices`);
    return res.json();
  },
  connectCamera: async (url) => {
    const res = await fetch(`${API_BASE}/camera/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },
  disconnectCamera: async () => {
    const res = await fetch(`${API_BASE}/camera/disconnect`, {
      method: 'POST',
    });
    return res.json();
  },
  testCameraConnection: async (url) => {
    const res = await fetch(`${API_BASE}/camera/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },
  enableFallbackCamera: async () => {
    const res = await fetch(`${API_BASE}/camera/fallback`, {
      method: 'POST',
    });
    return res.json();
  },

  // Inspection
  startInspection: async () => {
    const res = await fetch(`${API_BASE}/inspection/start`, {
      method: 'POST',
    });
    return res.json();
  },
  stopInspection: async () => {
    const res = await fetch(`${API_BASE}/inspection/stop`, {
      method: 'POST',
    });
    return res.json();
  },
  getInspectionStatus: async () => {
    const res = await fetch(`${API_BASE}/inspection/status`);
    return res.json();
  },
  testSingleInspection: async (useSample = false, sampleType = 'defect') => {
    const res = await fetch(`${API_BASE}/inspection/test-single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ use_sample: useSample, sample_type: sampleType }),
    });
    return res.json();
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/inspection/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // History & Records
  getInspections: async (page = 1, limit = 20, status = '', search = '') => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/inspections?${params.toString()}`);
    return res.json();
  },
  getInspectionById: async (id) => {
    const res = await fetch(`${API_BASE}/inspections/${id}`);
    return res.json();
  },

  // Analytics
  getAnalyticsSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return res.json();
  },
  getDefectDistribution: async () => {
    const res = await fetch(`${API_BASE}/analytics/defects`);
    return res.json();
  },
  getTimeline: async () => {
    const res = await fetch(`${API_BASE}/analytics/timeline`);
    return res.json();
  },
};

// Real-Time WebSocket Manager
class WSManager {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notify({ type: 'WS_CONNECTED' });
        // Start heartbeat ping
        this.pingTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send('ping');
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const msg = JSON.parse(event.data);
          this.notify(msg);
        } catch (e) {
          console.debug('Non-JSON WS message:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notify({ type: 'WS_DISCONNECTED' });
        clearInterval(this.pingTimer);
        // Attempt reconnect after 3 seconds
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.debug('WebSocket error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.debug('Failed to initialize WebSocket:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(message) {
    for (const listener of this.listeners) {
      try {
        listener(message);
      } catch (e) {
        console.error('Error in WS subscriber:', e);
      }
    }
  }
}

export const wsService = new WSManager();

