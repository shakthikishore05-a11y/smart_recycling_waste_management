import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Scan,
  X
} from 'lucide-react';
import { apiRequest } from '../../api/client';

interface ScanItem {
  id: number;
  image_path: string;
  original_filename?: string;
  predicted_category: string;
  display_name: string;
  confidence: number;
  is_confident: boolean;
  model_identifier?: string;
  classification_type?: string;
  user_feedback_category?: string;
  notes?: string;
  recommendation_data?: any;
  created_at: string;
}

export const WasteHistory: React.FC = () => {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modal detail
  const [inspectScan, setInspectScan] = useState<ScanItem | null>(null);

  // Delete modal
  const [scanToDelete, setScanToDelete] = useState<ScanItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort_by: sortBy,
      });
      if (category !== 'all') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());

      const data = await apiRequest(`/api/v1/scans?${params.toString()}`);
      setScans(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load waste history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [page, category, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  const handleDelete = async () => {
    if (!scanToDelete) return;
    try {
      setDeleting(true);
      await apiRequest(`/api/v1/scans/${scanToDelete.id}`, { method: 'DELETE' });
      setScanToDelete(null);
      fetchScans();
    } catch (err) {
      console.error('Failed to delete scan:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await apiRequest('/api/v1/scans/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_waste_scans_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-eco-900 tracking-tight">My Waste History</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Archived AI classification scans, confidence metrics, and confirmed user corrections ({total} records).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-[#E3EAE4] bg-white text-eco-900 text-xs font-semibold hover:bg-surface-soft shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/dashboard/scanner"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-eco-700 hover:bg-eco-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Item</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAE4] shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by notes or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E3EAE4] text-xs focus:ring-2 focus:ring-eco-600 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#E3EAE4] text-xs bg-white focus:ring-2 focus:ring-eco-600 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="plastic">Plastic</option>
            <option value="cardboard">Cardboard</option>
            <option value="glass">Glass</option>
            <option value="metal">Metal</option>
            <option value="paper">Paper</option>
            <option value="trash">General Trash</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#E3EAE4] text-xs bg-white focus:ring-2 focus:ring-eco-600 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="confidence">Highest Confidence</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-white rounded-2xl border border-[#E3EAE4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-textSecondary animate-pulse">
            Loading archived scans...
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-eco-900">No waste scans found</h3>
            <p className="text-xs text-textSecondary mt-1">Try adjusting your filters or upload a new waste photo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft border-b border-[#E3EAE4] text-textSecondary font-semibold">
                <tr>
                  <th className="py-3 px-4">Item Thumbnail</th>
                  <th className="py-3 px-4">Predicted Category</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">User Feedback</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-surface-soft/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={scan.image_path}
                          alt={scan.display_name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E3EAE4]"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="font-bold text-eco-900 truncate max-w-[150px]">{scan.display_name}</p>
                          <p className="text-[10px] text-textSecondary truncate max-w-[150px]">{scan.original_filename || 'Uploaded Image'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {scan.predicted_category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, scan.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-eco-900">{(scan.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {scan.user_feedback_category ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Corrected: {scan.user_feedback_category}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Confirmed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-textSecondary">
                      {new Date(scan.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setInspectScan(scan)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-eco-900 hover:bg-surface-soft"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setScanToDelete(scan)}
                        className="p-1.5 rounded-lg text-textSecondary hover:text-red-600 hover:bg-red-50"
                        title="Delete scan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-[#E3EAE4] flex items-center justify-between text-xs text-textSecondary">
            <span>
              Showing page {page} of {pages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-[#E3EAE4] hover:bg-surface-soft disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-[#E3EAE4] hover:bg-surface-soft disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Detail Modal */}
      {inspectScan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E3EAE4] shadow-eco-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-eco-900">Scan Details & Recommendation</h3>
              <button onClick={() => setInspectScan(null)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#E3EAE4] max-h-56 bg-black/5">
              <img
                src={inspectScan.image_path}
                alt={inspectScan.display_name}
                className="w-full h-56 object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-soft p-3.5 rounded-xl border border-surface-border">
              <div>
                <span className="text-textSecondary block">Predicted Category:</span>
                <strong className="text-eco-900">{inspectScan.display_name}</strong>
              </div>
              <div>
                <span className="text-textSecondary block">Confidence Score:</span>
                <strong className="text-emerald-700">{(inspectScan.confidence * 100).toFixed(1)}%</strong>
              </div>
              <div>
                <span className="text-textSecondary block">Model Architecture:</span>
                <span className="font-mono text-gray-700">{inspectScan.model_identifier || 'MobileNetV3'}</span>
              </div>
              <div>
                <span className="text-textSecondary block">Scan Date:</span>
                <span className="text-gray-700">{new Date(inspectScan.created_at).toLocaleString()}</span>
              </div>
            </div>

            {inspectScan.user_feedback_category && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>User Correction:</strong> Marked as {inspectScan.user_feedback_category}
              </div>
            )}

            {inspectScan.notes && (
              <div className="p-3 rounded-xl bg-surface-soft border border-surface-border text-xs text-textSecondary">
                <strong>Notes:</strong> {inspectScan.notes}
              </div>
            )}

            <button
              onClick={() => setInspectScan(null)}
              className="w-full py-2.5 rounded-xl bg-eco-700 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {scanToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#E3EAE4] shadow-eco-lg space-y-4">
            <h3 className="font-extrabold text-base text-eco-900">Confirm Deletion</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Are you sure you want to delete this scan ({scanToDelete.display_name})? This will permanently remove the record and image file.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setScanToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#E3EAE4] text-xs font-semibold text-gray-700 hover:bg-surface-soft"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
