import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  BarChart2,
  Trash2,
  Edit2,
  Lock,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X
} from 'lucide-react';
import { api } from '../services/api';

interface UrlData {
  id: number;
  originalUrl: string;
  shortCode: string;
  customAlias: string;
  title: string;
  description: string;
  isEnabled: boolean;
  isOneTimeUse: boolean;
  clickCount: number;
  qrCode: string;
  expirationDate: string | null;
  isPasswordProtected: boolean;
  createdAt: string;
}

interface UrlTableProps {
  urls: UrlData[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: string) => void;
  onRefresh: () => void;
  onOpenQr: (qrCode: string, shortUrl: string) => void;
}

export const UrlTable: React.FC<UrlTableProps> = ({
  urls,
  totalPages,
  currentPage,
  onPageChange,
  onSearchChange,
  onSortChange,
  onRefresh,
  onOpenQr
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState<UrlData | null>(null);
  const [editForm, setEditForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    description: '',
    password: '',
    expirationDate: '',
    isOneTimeUse: false,
    isEnabled: true
  });
  const [editError, setEditError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const backendRedirectBase = window.location.origin.includes('localhost')
    ? 'http://localhost:8080'
    : window.location.origin;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchVal);
  };

  const handleCopy = (id: number, shortCode: string) => {
    const fullUrl = `${backendRedirectBase}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle enabled/disabled status
  const handleToggleStatus = async (url: UrlData) => {
    try {
      await api.put(`/urls/${url.id}`, {
        originalUrl: url.originalUrl,
        customAlias: url.customAlias || undefined,
        title: url.title,
        description: url.description,
        isOneTimeUse: url.isOneTimeUse,
        expirationDate: url.expirationDate ? url.expirationDate : undefined,
        isEnabled: !url.isEnabled
      });
      onRefresh();
    } catch (err: any) {
      console.error('Failed to toggle link status', err);
    }
  };

  // Delete shortcode
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shortened URL? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/urls/${id}`);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete URL', err);
    }
  };

  // Open Edit Modal
  const openEditModal = (url: UrlData) => {
    setEditingUrl(url);
    setEditForm({
      originalUrl: url.originalUrl,
      customAlias: url.customAlias || '',
      title: url.title || '',
      description: url.description || '',
      password: '', // Kept empty unless they overwrite it
      expirationDate: url.expirationDate ? url.expirationDate.substring(0, 16) : '',
      isOneTimeUse: url.isOneTimeUse,
      isEnabled: url.isEnabled
    });
    setEditError('');
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUrl) return;
    setSubmitting(true);
    setEditError('');

    try {
      await api.put(`/urls/${editingUrl.id}`, {
        originalUrl: editForm.originalUrl,
        customAlias: editForm.customAlias ? editForm.customAlias : undefined,
        title: editForm.title,
        description: editForm.description,
        password: editForm.password ? editForm.password : undefined,
        expirationDate: editForm.expirationDate ? new Date(editForm.expirationDate).toISOString() : undefined,
        isOneTimeUse: editForm.isOneTimeUse,
        isEnabled: editForm.isEnabled
      });
      setEditingUrl(null);
      onRefresh();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update URL details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search URLs, titles, aliases..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-500 transition-all duration-200"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <button type="submit" className="hidden">Search</button>
        </form>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSortChange('clickCount')}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort by Clicks</span>
          </button>
          <button
            onClick={() => onSortChange('createdAt')}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort by Date</span>
          </button>
        </div>
      </div>

      {/* URL List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
        <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50/75 border-b border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-850 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th scope="col" className="px-6 py-4">Short Link</th>
              <th scope="col" className="px-6 py-4">Destination & Title</th>
              <th scope="col" className="px-6 py-4 text-center">Settings</th>
              <th scope="col" className="px-6 py-4 text-center">Clicks</th>
              <th scope="col" className="px-6 py-4 text-center">Active</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {urls.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  No URLs found matching your criteria. Create a shortened URL to get started.
                </td>
              </tr>
            ) : (
              urls.map((url) => {
                const shortPath = `${backendRedirectBase}/${url.shortCode}`;
                return (
                  <tr key={url.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    {/* Short Link */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <a
                            href={shortPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-0.5"
                          >
                            <span>/{url.shortCode}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          
                          {/* Copy Link Button */}
                          <button
                            onClick={() => handleCopy(url.id, url.shortCode)}
                            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {copiedId === url.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {url.customAlias && (
                          <span className="text-[10px] text-indigo-500 dark:text-indigo-400">
                            alias: {url.customAlias}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Destination & Title */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-slate-200 font-bold truncate">
                          {url.title || 'Untitled Link'}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {url.originalUrl}
                        </span>
                      </div>
                    </td>

                    {/* Indicators Settings */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {url.isPasswordProtected && (
                          <span className="rounded-md bg-amber-50 p-1 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" title="Password Protected">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {url.isOneTimeUse && (
                          <span className="rounded-md bg-rose-50 p-1 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400" title="One-time Use Only">
                            <Zap className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {url.expirationDate && (
                          <span className="rounded-md bg-blue-50 p-1 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" title={`Expires: ${new Date(url.expirationDate).toLocaleString()}`}>
                            <Calendar className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {!url.isPasswordProtected && !url.isOneTimeUse && !url.expirationDate && (
                          <span className="text-xs text-slate-350 dark:text-slate-600">-</span>
                        )}
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {url.clickCount} Clicks
                      </span>
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(url)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          url.isEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            url.isEnabled ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOpenQr(url.qrCode, shortPath)}
                          className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-250 transition-colors"
                          title="View QR Code"
                        >
                          <QrCode className="h-4.5 w-4.5" />
                        </button>
                        
                        <Link
                          to={`/analytics/${url.id}`}
                          className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-250 transition-colors"
                          title="View Analytics"
                        >
                          <BarChart2 className="h-4.5 w-4.5" />
                        </Link>

                        <button
                          onClick={() => openEditModal(url)}
                          className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-250 transition-colors"
                          title="Edit link config"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(url.id)}
                          className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                          title="Delete Short Link"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Showing Page <span className="text-slate-850 dark:text-slate-300 font-bold">{currentPage + 1}</span> of{' '}
            <span className="text-slate-850 dark:text-slate-300 font-bold">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inline URL Editing Modal */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingUrl(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Edit Link Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Configure alias details, expiration bounds, and password protection
            </p>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              {editError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={editForm.originalUrl}
                  onChange={(e) => setEditForm({ ...editForm, originalUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">
                    Custom Alias (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.customAlias}
                    onChange={(e) => setEditForm({ ...editForm, customAlias: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">
                    Update Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.expirationDate}
                    onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 border-t border-slate-150 dark:border-slate-800 pt-4">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none text-sm text-slate-750 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editForm.isOneTimeUse}
                    onChange={(e) => setEditForm({ ...editForm, isOneTimeUse: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span>One-Time Use Only</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none text-sm text-slate-750 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editForm.isEnabled}
                    onChange={(e) => setEditForm({ ...editForm, isEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span>Active Link</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-750 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlTable;
