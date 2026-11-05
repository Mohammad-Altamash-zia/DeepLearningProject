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
  ArrowRight
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
      {/* Header and Search Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        {/* Status Tab Filters */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800 p-1 rounded-squircle">
          {[
            { id: '', label: 'ALL RECORDS' },
            { id: 'PASS', label: 'PASSED' },
            { id: 'FAIL', label: 'FAILED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-squircle-xs text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by code (e.g. INSP-2026...)"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-squircle pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </form>
          <button
            onClick={loadData}
            title="Refresh Inspection Logs"
            className="p-2 rounded-squircle bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-squircle-xl overflow-hidden shadow-sm transition-colors">
        <div className="h-14 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Historical Telemetry Log</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Total Records: <strong className="text-slate-700 dark:text-slate-300">{total}</strong> archived inspections</p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Inspection Code</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Decision</th>
                <th className="py-3 px-6">Defects</th>
                <th className="py-3 px-6">Inference Latency</th>
                <th className="py-3 px-6">Image Status</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {inspections.length > 0 ? (
                inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400 dark:text-slate-500 font-semibold">#{item.id}</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">{item.inspection_code}</td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-900 dark:text-white font-bold">{item.defect_count}</td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-slate-300">{item.inference_time_ms.toFixed(1)} ms</td>
                    <td className="py-3.5 px-6">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        item.processing_status === 'IMAGE_EXPIRED'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900'
                      }`}>
                        {item.processing_status === 'IMAGE_EXPIRED' ? 'EXPIRED' : 'DISK SAVED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setActiveModalId(item.id)}
                        className="p-1.5 rounded-squircle-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all inline-flex items-center space-x-1"
                        title="View Full Inspection Diagnostics"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium pr-1">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching inspection records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-700 dark:text-slate-200">{inspections.length}</strong> of <strong className="text-slate-700 dark:text-slate-200">{total}</strong> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-squircle-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300 px-2 font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-squircle-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal Dialog */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-squircle-2xl max-w-4xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-squircle flex items-center justify-center font-bold text-white text-xs ${
                  modalData?.status === 'PASS' ? 'bg-emerald-500' : 'bg-rose-600'
                }`}>
                  {modalData?.status || '...'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm font-sans">
                    Inspection Detail: <span className="text-blue-600 dark:text-blue-400 font-mono">{modalData?.inspection_code || activeModalId}</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Timestamp: {modalData?.timestamp ? new Date(modalData.timestamp).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModalId(null);
                  if (onCloseModal) onCloseModal();
                }}
                className="p-2 rounded-squircle text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {modalLoading ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs">Loading inspection telemetry...</p>
                </div>
              ) : modalData ? (
                <>
                  {/* Image Preview & Buffer Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Raw Capture View */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Original Capture
                      </span>
                      <div className="aspect-video bg-slate-950 rounded-squircle-lg overflow-hidden relative flex items-center justify-center border border-slate-200 dark:border-slate-800">
                        {modalData.image_url ? (
                          <img
                            src={modalData.image_url}
                            alt="Original Capture"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-400">
                            <ImageOff className="w-8 h-8 mx-auto mb-1 text-slate-500" />
                            <p className="text-xs font-semibold">Image File Expired</p>
                            <p className="text-[10px] text-slate-500">Deleted by 100s retention buffer</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Annotated Result View */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        YOLO11n Defect Overlay
                      </span>
                      <div className="aspect-video bg-slate-950 rounded-squircle-lg overflow-hidden relative flex items-center justify-center border border-slate-200 dark:border-slate-800">
                        {modalData.annotated_image_url ? (
                          <img
                            src={modalData.annotated_image_url}
                            alt="Annotated Inspection"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-400">
                            <ImageOff className="w-8 h-8 mx-auto mb-1 text-slate-500" />
                            <p className="text-xs font-semibold">Annotated Image Expired</p>
                            <p className="text-[10px] text-slate-500">Deleted by 100s retention buffer</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-squircle border border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px]">DECISION</span>
                      <strong className={`text-sm ${modalData.status === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {modalData.status}
                      </strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-squircle border border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px]">DEFECT COUNT</span>
                      <strong className="text-sm text-slate-800 dark:text-white">{modalData.defect_count}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-squircle border border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px]">INFERENCE TIME</span>
                      <strong className="text-sm text-blue-600 dark:text-blue-400 font-mono">{modalData.inference_time_ms.toFixed(1)} ms</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-squircle border border-slate-100 dark:border-slate-700/60">
                      <span className="text-slate-400 dark:text-slate-500 block text-[11px]">DISK BUFFER</span>
                      <strong className="text-sm text-slate-700 dark:text-slate-300 font-mono">{modalData.processing_status}</strong>
                    </div>
                  </div>

                  {/* Defect Detections Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Detected Anomaly Regions ({modalData.detections?.length || 0})
                    </h4>
                    {modalData.detections && modalData.detections.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-700 rounded-squircle-md">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-750">
                            <tr>
                              <th className="py-2.5 px-4">#</th>
                              <th className="py-2.5 px-4">Class</th>
                              <th className="py-2.5 px-4">Confidence</th>
                              <th className="py-2.5 px-4">Bounding Box</th>
                              <th className="py-2.5 px-4">Dimensions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {modalData.detections.map((det, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-2.5 px-4 text-slate-400 dark:text-slate-500">{idx + 1}</td>
                                <td className="py-2.5 px-4 font-bold text-amber-600 dark:text-amber-400">{det.class_name}</td>
                                <td className="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                                  {det.confidence_pct || `${(det.confidence * 100).toFixed(1)}%`}
                                </td>
                                <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">[{det.x1}, {det.y1}, {det.x2}, {det.y2}]</td>
                                <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">{det.width} x {det.height} px</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 p-4 rounded-squircle text-center">
                        No surface defects detected in this inspection cycle.
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
