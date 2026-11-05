import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  X, 
  Clock, 
  Layers, 
  ImageOff,
  RefreshCw,
  Calendar,
  Zap,
  ArrowRight,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

export default function InspectionHistory({ selectedInspectionId, onCloseModal }) {
  const [inspections, setInspections] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyView, setHistoryView] = useState('timeline'); // 'timeline' or 'table'

  // Modal detail state
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeModalId, setActiveModalId] = useState(selectedInspectionId || null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getInspections(page, 15, statusFilter, searchQuery);
      setInspections(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      console.error('Failed to load inspections:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  // Handle external selection
  useEffect(() => {
    if (selectedInspectionId) {
      setActiveModalId(selectedInspectionId);
    }
  }, [selectedInspectionId]);

  // Load modal inspection data when activeModalId changes
  useEffect(() => {
    if (activeModalId) {
      setModalLoading(true);
      api.getInspectionById(activeModalId)
        .then((data) => setModalData(data))
        .catch((e) => console.error('Failed to load detail:', e))
        .finally(() => setModalLoading(false));
    } else {
      setModalData(null);
    }
  }, [activeModalId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prominent Page Title with Organic Curvature */}
      <div className="modular-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="pill-badge px-3 py-1 bg-warm-200/80 dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs font-semibold border border-warm-300/50">
              Audit Trail
            </span>
            <span className="pill-badge px-3 py-1 bg-neon-lime-bg dark:bg-neon-lime-dark/20 text-neon-lime-dark dark:text-neon-lime-accent text-xs font-bold border border-neon-lime/30">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse mr-1.5" />
              SQLite WAL Indexed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-sans tracking-tight">
            Inspection History & Audit Records
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-darkwarm-text-muted mt-1 max-w-2xl">
            Complete historical registry of captured frames, bounding box telemetry, defect classifications, and retention statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex p-1 bg-warm-200/60 dark:bg-darkwarm-surface rounded-full border border-warm-300/60 dark:border-darkwarm-border text-xs">
            <button
              onClick={() => setHistoryView('timeline')}
              className={`pill-btn px-3.5 py-1.5 font-semibold rounded-full ${
                historyView === 'timeline'
                  ? 'bg-charcoal-900 text-white shadow-tactile dark:bg-warm-100 dark:text-charcoal-900'
                  : 'text-charcoal-600 dark:text-darkwarm-text-muted hover:text-charcoal-900'
              }`}
            >
              Flowing Cards
            </button>
            <button
              onClick={() => setHistoryView('table')}
              className={`pill-btn px-3.5 py-1.5 font-semibold rounded-full ${
                historyView === 'table'
                  ? 'bg-charcoal-900 text-white shadow-tactile dark:bg-warm-100 dark:text-charcoal-900'
                  : 'text-charcoal-600 dark:text-darkwarm-text-muted hover:text-charcoal-900'
              }`}
            >
              Data Table
            </button>
          </div>
        </div>
      </div>

      {/* Header and Search Filters Bar (Modular Floating Card with Rounded Pill Buttons) */}
      <div className="modular-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors">
        {/* Status Tab Filters */}
        <div className="flex items-center space-x-1.5 bg-warm-100 dark:bg-darkwarm-surface p-1.5 rounded-full border border-warm-200 dark:border-darkwarm-border">
          {[
            { id: '', label: 'ALL RECORDS' },
            { id: 'PASS', label: 'PASSED' },
            { id: 'FAIL', label: 'FAILED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`pill-btn px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                statusFilter === tab.id
                  ? 'bg-charcoal-900 text-white shadow-tactile dark:bg-warm-100 dark:text-charcoal-900'
                  : 'text-charcoal-600 dark:text-darkwarm-text-muted hover:text-charcoal-900 hover:bg-white/60 dark:hover:bg-darkwarm-card'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Refresh Button */}
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code (e.g. INSP-2026...)"
              className="w-full bg-warm-50 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border rounded-full pl-9 pr-4 py-2 text-xs text-charcoal-800 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:border-charcoal-900 dark:focus:border-warm-200 transition-all shadow-inner"
            />
          </form>
          <button
            onClick={loadData}
            title="Refresh Inspection Logs"
            className="p-2.5 rounded-full bg-warm-100 dark:bg-darkwarm-surface hover:bg-warm-200 dark:hover:bg-darkwarm-card border border-warm-200 dark:border-darkwarm-border text-charcoal-700 dark:text-warm-200 transition-colors shadow-tactile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Records Container */}
      <div className="modular-card p-6 transition-colors">
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-warm-100 dark:border-darkwarm-border">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-warm-100 font-sans">
              Historical Registry Data
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted">
              Total Records: <strong className="text-charcoal-800 dark:text-warm-200">{total}</strong> archived inspections
            </p>
          </div>
          <span className="pill-badge px-3.5 py-1 text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-warm-100 dark:bg-darkwarm-surface border border-warm-200 dark:border-darkwarm-border">
            Page {page} of {totalPages}
          </span>
        </div>

        {/* View Mode 1: Flowing Cards with Connected Timeline Nodes */}
        {historyView === 'timeline' ? (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-warm-200 dark:before:bg-darkwarm-border">
            {inspections.length > 0 ? (
              inspections.map((item) => {
                const isPass = item.status === 'PASS';
                return (
                  <div key={item.id} className="relative group">
                    {/* Glowing highlight node marker */}
                    <div className={`absolute -left-[23px] sm:-left-[27px] top-4 w-4 h-4 rounded-full border-2 bg-white dark:bg-darkwarm-card transition-transform group-hover:scale-125 ${
                      isPass 
                        ? 'border-neon-lime ring-4 ring-neon-lime/20' 
                        : 'border-earth-terracotta ring-4 ring-earth-terracotta/20'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mx-auto my-0.5 ${isPass ? 'bg-neon-lime' : 'bg-earth-terracotta'}`} />
                    </div>

                    {/* Modular Flowing Card */}
                    <div className="bg-warm-50/70 dark:bg-darkwarm-surface/70 hover:bg-white dark:hover:bg-darkwarm-card p-4 sm:p-5 rounded-2xl border border-warm-200/60 dark:border-darkwarm-border shadow-tactile transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs text-charcoal-400 font-semibold">#{item.id}</span>
                        <span className="font-mono font-bold text-xs text-charcoal-900 dark:text-warm-100">{item.inspection_code}</span>

                        <span className={`pill-badge px-2.5 py-0.5 text-[11px] font-bold ${
                          isPass
                            ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent border border-neon-lime/30'
                            : 'bg-earth-terracotta-bg dark:bg-earth-terracotta/25 text-earth-terracotta border border-earth-terracotta/30'
                        }`}>
                          {item.status}
                        </span>

                        <span className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </span>

                        <span className="pill-badge px-2.5 py-0.5 bg-warm-200/60 dark:bg-darkwarm-card text-charcoal-700 dark:text-warm-200 text-xs font-semibold">
                          {item.defect_count} defect(s)
                        </span>

                        <span className="font-mono text-[11px] text-charcoal-500 dark:text-darkwarm-text-muted">
                          {item.inference_time_ms.toFixed(1)} ms
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`pill-badge px-2.5 py-0.5 text-[10px] font-mono font-semibold ${
                          item.processing_status === 'IMAGE_EXPIRED'
                            ? 'bg-warm-200/40 text-charcoal-400 dark:text-darkwarm-text-muted'
                            : 'bg-warm-200 text-charcoal-800 dark:bg-darkwarm-card dark:text-warm-200 border border-warm-300/40'
                        }`}>
                          {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED' : 'DISK SAVED'}
                        </span>

                        <button
                          onClick={() => setActiveModalId(item.id)}
                          className="pill-btn px-4 py-1.5 bg-white hover:bg-charcoal-900 hover:text-white dark:bg-darkwarm-card dark:hover:bg-warm-100 dark:hover:text-charcoal-900 text-charcoal-800 dark:text-warm-200 text-xs font-semibold border border-warm-200 dark:border-darkwarm-border shadow-sm transition-all flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View Detail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-charcoal-400 dark:text-darkwarm-text-muted">
                No matching inspection records found.
              </div>
            )}
          </div>
        ) : (
          /* View Mode 2: Structured Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-warm-50 dark:bg-darkwarm-surface text-charcoal-500 dark:text-darkwarm-text-muted font-semibold border-b border-warm-100 dark:border-darkwarm-border">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Inspection Code</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Defects</th>
                  <th className="py-3 px-4">Inference Latency</th>
                  <th className="py-3 px-4">Image Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-darkwarm-border">
                {inspections.length > 0 ? (
                  inspections.map((item) => (
                    <tr key={item.id} className="hover:bg-warm-50/70 dark:hover:bg-darkwarm-surface/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-charcoal-400 font-semibold">#{item.id}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-charcoal-900 dark:text-warm-100">{item.inspection_code}</td>
                      <td className="py-3.5 px-4 text-charcoal-500 dark:text-darkwarm-text-muted font-medium">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`pill-badge px-2.5 py-0.5 text-[11px] font-bold ${
                          item.status === 'PASS'
                            ? 'bg-neon-lime-bg dark:bg-neon-lime-dark/25 text-neon-lime-dark dark:text-neon-lime-accent border border-neon-lime/30'
                            : 'bg-earth-terracotta-bg dark:bg-earth-terracotta/25 text-earth-terracotta border border-earth-terracotta/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-900 dark:text-warm-100 font-bold">{item.defect_count}</td>
                      <td className="py-3.5 px-4 font-mono text-charcoal-600 dark:text-darkwarm-text-muted">{item.inference_time_ms.toFixed(1)} ms</td>
                      <td className="py-3.5 px-4">
                        <span className="pill-badge px-2 py-0.5 text-[10px] font-mono font-semibold bg-warm-100 dark:bg-darkwarm-surface text-charcoal-600 dark:text-darkwarm-text-muted">
                          {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED' : 'DISK SAVED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveModalId(item.id)}
                          className="pill-btn px-3 py-1 bg-warm-100 hover:bg-charcoal-900 hover:text-white dark:bg-darkwarm-surface text-charcoal-700 dark:text-warm-200 text-xs transition-all inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-charcoal-400 dark:text-darkwarm-text-muted">
                      No matching inspection records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="h-16 px-4 border-t border-warm-100 dark:border-darkwarm-border flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pill-btn px-4 py-2 border border-warm-200 dark:border-darkwarm-border bg-white dark:bg-darkwarm-card text-charcoal-700 dark:text-warm-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-warm-100 text-xs font-semibold shadow-sm flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-medium text-charcoal-500 dark:text-darkwarm-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="pill-btn px-4 py-2 border border-warm-200 dark:border-darkwarm-border bg-white dark:bg-darkwarm-card text-charcoal-700 dark:text-warm-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-warm-100 text-xs font-semibold shadow-sm flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspection Detail Modal (Modular Floating Card with Organic Curvature) */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="modular-card w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-tactile-lg border border-warm-200 dark:border-darkwarm-border p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-warm-100 dark:border-darkwarm-border">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-tactile ${
                  modalData?.status === 'PASS' 
                    ? 'bg-neon-lime-dark' 
                    : 'bg-earth-terracotta'
                }`}>
                  {modalData?.status || '—'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-100 font-sans">
                    Inspection Diagnostics — #{activeModalId}
                  </h3>
                  <span className="text-xs text-charcoal-500 dark:text-darkwarm-text-muted font-mono">
                    {modalData?.inspection_code || 'Loading details...'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setActiveModalId(null); if (onCloseModal) onCloseModal(); }}
                className="p-2 rounded-full hover:bg-warm-100 dark:hover:bg-darkwarm-surface text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {modalLoading ? (
              <div className="py-20 text-center text-charcoal-500 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-charcoal-400" />
                <span className="text-xs">Loading inspection telemetry...</span>
              </div>
            ) : modalData ? (
              <div className="space-y-6 pt-5">
                {/* Image Snapshot Box */}
                <div className="bg-charcoal-950 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-warm-200/30">
                  {modalData.image_data_base64 ? (
                    <img
                      src={`data:image/jpeg;base64,${modalData.image_data_base64}`}
                      alt="Captured Inspection"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-8 text-warm-300">
                      <ImageOff className="w-12 h-12 mx-auto mb-3 text-warm-400" />
                      <p className="text-sm font-bold text-warm-100">Physical Capture File Expired</p>
                      <p className="text-xs text-warm-400 mt-1 max-w-sm">
                        This frame passed the 100-second retention limit and was purged from disk.
                        Permanent classification data remains archived below in SQLite.
                      </p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-charcoal-900/80 backdrop-blur-md rounded-full text-[10px] font-mono text-neon-lime-accent border border-white/10">
                    STATUS: {modalData.processing_status}
                  </div>
                </div>

                {/* Metadata Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-warm-50 dark:bg-darkwarm-surface p-3.5 rounded-2xl border border-warm-200/70 dark:border-darkwarm-border">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-semibold">Deciding Status</span>
                    <span className={`font-bold mt-1 block text-sm ${modalData.status === 'PASS' ? 'text-neon-lime-dark' : 'text-earth-terracotta'}`}>
                      {modalData.status}
                    </span>
                  </div>
                  <div className="bg-warm-50 dark:bg-darkwarm-surface p-3.5 rounded-2xl border border-warm-200/70 dark:border-darkwarm-border">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-semibold">Defect Count</span>
                    <span className="font-bold text-charcoal-900 dark:text-warm-100 mt-1 block text-sm">
                      {modalData.defect_count} defect(s)
                    </span>
                  </div>
                  <div className="bg-warm-50 dark:bg-darkwarm-surface p-3.5 rounded-2xl border border-warm-200/70 dark:border-darkwarm-border">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-semibold">Inference Latency</span>
                    <span className="font-bold font-mono text-charcoal-900 dark:text-warm-100 mt-1 block text-sm">
                      {modalData.inference_time_ms.toFixed(1)} ms
                    </span>
                  </div>
                  <div className="bg-warm-50 dark:bg-darkwarm-surface p-3.5 rounded-2xl border border-warm-200/70 dark:border-darkwarm-border">
                    <span className="text-charcoal-400 block text-[10px] uppercase font-semibold">Timestamp</span>
                    <span className="font-medium text-charcoal-700 dark:text-warm-200 mt-1 block text-xs">
                      {new Date(modalData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Defect Entity Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-warm-100 mb-3 font-sans">
                    Detailed Defect Bounding Records
                  </h4>
                  {modalData.detections && modalData.detections.length > 0 ? (
                    <div className="space-y-2">
                      {modalData.detections.map((d, i) => (
                        <div
                          key={i}
                          className="bg-warm-50 dark:bg-darkwarm-surface p-3 rounded-2xl border border-warm-200/70 dark:border-darkwarm-border flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-5 h-5 rounded-full bg-earth-terracotta-bg text-earth-terracotta text-[10px] font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="font-bold text-earth-terracotta">{d.class_name}</span>
                            <span className="font-mono text-charcoal-500">[{d.bbox.map(b => Math.round(b)).join(', ')}]</span>
                          </div>
                          <span className="font-mono font-bold text-charcoal-800 dark:text-warm-100">
                            {(d.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-warm-50 dark:bg-darkwarm-surface rounded-2xl border border-warm-200/70 dark:border-darkwarm-border text-xs text-charcoal-500 text-center">
                      Zero defects classified on this inspection cycle. Surface meets quality tolerance (PASS).
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
