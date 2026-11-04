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
  RefreshCw
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
    <div className="space-y-6">
      {/* Header and Search Filters */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Status Tab Filters */}
        <div className="flex items-center space-x-1 bg-industrial-950 p-1 rounded-lg border border-industrial-800">
          {[
            { id: '', label: 'ALL RECORDS' },
            { id: 'PASS', label: 'PASSED' },
            { id: 'FAIL', label: 'FAILED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-industrial-800 text-white shadow-sm'
                  : 'text-industrial-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-industrial-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. INSP-20261103) or date..."
              className="w-full bg-industrial-950 border border-industrial-700 rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-white placeholder-industrial-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono transition-colors"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={loadData}
            title="Refresh Table"
            className="p-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-industrial-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main Inspections Table */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-950 text-industrial-400 border-b border-industrial-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Inspection Code</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Defects</th>
                <th className="py-3 px-4">Inference Latency</th>
                <th className="py-3 px-4">Retention Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800">
              {inspections.length > 0 ? (
                inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-industrial-850/50 transition-colors">
                    <td className="py-3 px-4 text-industrial-500">#{item.id}</td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{item.inspection_code}</td>
                    <td className="py-3 px-4 text-industrial-300">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{item.defect_count}</td>
                    <td className="py-3 px-4 text-industrial-300">{item.inference_time_ms.toFixed(1)} ms</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        item.processing_status === 'IMAGE_EXPIRED'
                          ? 'bg-industrial-800/80 text-industrial-500 border border-industrial-700'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {item.processing_status === 'IMAGE_EXPIRED' ? 'IMAGE EXPIRED (>100s)' : 'IMAGE ON DISK'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveModalId(item.id)}
                        className="px-2.5 py-1 rounded bg-industrial-800 hover:bg-industrial-700 text-industrial-200 text-xs font-mono transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-industrial-500">
                    {loading ? 'Querying SQLite database...' : 'No inspection records match the current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="h-12 px-5 bg-industrial-950 border-t border-industrial-800 flex items-center justify-between text-xs font-mono text-industrial-400">
          <div>
            Showing <span className="text-white font-bold">{inspections.length}</span> of{' '}
            <span className="text-white font-bold">{total}</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded bg-industrial-850 hover:bg-industrial-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page <span className="text-cyan-400">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded bg-industrial-850 hover:bg-industrial-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspection Detail Modal */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-industrial-850 border-b border-industrial-800 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white font-mono">
                    {modalData?.inspection_code || `Inspection #${activeModalId}`}
                  </h3>
                  {modalData && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      modalData.status === 'PASS' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {modalData.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-industrial-400 font-mono mt-0.5">
                  Timestamp: {modalData ? new Date(modalData.timestamp).toLocaleString() : ''}
                </p>
              </div>

              <button
                onClick={() => { setActiveModalId(null); if (onCloseModal) onCloseModal(); }}
                className="p-1.5 rounded-lg bg-industrial-800 text-industrial-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {modalLoading ? (
                <div className="py-12 text-center text-xs font-mono text-industrial-400">
                  Loading inspection records and bounding boxes...
                </div>
              ) : modalData ? (
                <>
                  {/* Image Display or Retention Notice */}
                  <div className="bg-black border border-industrial-800 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                    {modalData.processing_status === 'IMAGE_EXPIRED' ? (
                      <div className="p-8 text-center">
                        <ImageOff className="w-12 h-12 text-industrial-600 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-industrial-300 font-mono">
                          Image Expired (&gt;100s Rolling Retention)
                        </h4>
                        <p className="text-xs text-industrial-500 max-w-md mt-1 font-mono">
                          As per the 100-second image retention policy, the physical image file was pruned from disk to preserve local storage. Full text metadata, telemetry, and bounding box coordinates remain permanently stored in SQLite.
                        </p>
                      </div>
                    ) : (
                      <img
                        src={`/api/images/${modalData.annotated_image_filename}`}
                        alt="Inspection Annotated Frame"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
                      <span className="text-industrial-500 block">Defects Count</span>
                      <span className="text-white font-bold text-base">{modalData.defect_count}</span>
                    </div>
                    <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
                      <span className="text-industrial-500 block">Inference Latency</span>
                      <span className="text-cyan-400 font-bold text-base">{modalData.inference_time_ms.toFixed(1)} ms</span>
                    </div>
                    <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
                      <span className="text-industrial-500 block">Camera Source</span>
                      <span className="text-industrial-300 truncate block text-xs">{modalData.camera_source}</span>
                    </div>
                    <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800">
                      <span className="text-industrial-500 block">Database Status</span>
                      <span className="text-emerald-400 font-bold text-xs">PERSISTENT RECORD</span>
                    </div>
                  </div>

                  {/* Defect Detections Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-industrial-300 font-mono mb-2">
                      Detected Bounding Boxes ({modalData.detections?.length || 0})
                    </h4>
                    {modalData.detections && modalData.detections.length > 0 ? (
                      <div className="border border-industrial-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-industrial-950 text-industrial-400">
                            <tr>
                              <th className="py-2 px-3">Class</th>
                              <th className="py-2 px-3">Confidence</th>
                              <th className="py-2 px-3">Box [X1, Y1, X2, Y2]</th>
                              <th className="py-2 px-3">Dimensions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-industrial-800">
                            {modalData.detections.map((det, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3 text-amber-400 font-bold">{det.class_name}</td>
                                <td className="py-2 px-3 text-white">{(det.confidence * 100).toFixed(1)}%</td>
                                <td className="py-2 px-3 text-industrial-300">
                                  [{det.x1}, {det.y1}, {det.x2}, {det.y2}]
                                </td>
                                <td className="py-2 px-3 text-industrial-400">
                                  {det.x2 - det.x1} x {det.y2 - det.y1} px
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-industrial-500 font-mono">No defects detected in this frame.</p>
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
