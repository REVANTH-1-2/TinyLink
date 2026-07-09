import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import DashboardCharts from '../components/DashboardCharts';
import UrlTable from '../components/UrlTable';
import QrCodeModal from '../components/QrCodeModal';
import { api } from '../services/api';
import { Link2, BarChart3, Star, Layers, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  // Query state for Url table pagination/search/sort
  const [currentPage, setCurrentPage] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // QR Modal State
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    qrCode: '',
    shortUrl: ''
  });

  // 1. Fetch dashboard overview metrics
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    }
  });

  // 2. Fetch paginated URL tables list
  const { data: urlPage, isLoading: loadingUrls, refetch: refetchUrls } = useQuery({
    queryKey: ['urlsList', currentPage, searchVal, sortBy, sortDir],
    queryFn: async () => {
      const res = await api.get('/urls', {
        params: {
          page: currentPage,
          size: 10,
          search: searchVal || undefined,
          sortBy,
          sortDir
        }
      });
      return res.data;
    }
  });

  const handleRefresh = () => {
    refetchMetrics();
    refetchUrls();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setSearchVal(search);
    setCurrentPage(0); // reset page to 0 on new search query
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setCurrentPage(0);
  };

  const handleOpenQr = (qrCode: string, shortUrl: string) => {
    setQrModal({
      isOpen: true,
      qrCode,
      shortUrl
    });
  };

  const isPageLoading = loadingMetrics || loadingUrls;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                Workspace Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                View your active short codes, click performance, and geo distribution.
              </p>
            </div>

            <Link
              to="/create"
              className="flex items-center justify-center space-x-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-500/10 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Create URL</span>
            </Link>
          </div>

          {isPageLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total URLs */}
                <Card className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Short links</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-55">{metrics?.totalUrls || 0}</h3>
                  </div>
                </Card>

                {/* Total Clicks */}
                <Card className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Redirections</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-55">{metrics?.totalClicks || 0}</h3>
                  </div>
                </Card>

                {/* Popular URL Card */}
                <Card className="flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Most Popular</p>
                    {metrics?.popularUrl ? (
                      <div className="truncate mt-0.5">
                        <Link
                          to={`/analytics/${metrics.popularUrl.id}`}
                          className="text-sm font-bold text-slate-900 dark:text-slate-200 hover:underline hover:text-brand-650"
                        >
                          /{metrics.popularUrl.shortCode}
                        </Link>
                        <span className="text-xs text-slate-400 ml-2">({metrics.popularUrl.clickCount} clicks)</span>
                      </div>
                    ) : (
                      <h4 className="text-sm text-slate-400 font-medium mt-0.5">No click records yet</h4>
                    )}
                  </div>
                </Card>
              </div>

              {/* Analytics Graph Feed */}
              {metrics?.recentClicks && metrics.recentClicks.length > 0 && (
                <div className="mt-4">
                  <DashboardCharts clicks={metrics.recentClicks} />
                </div>
              )}

              {/* URLs Data Table */}
              <div className="mt-8">
                <div className="mb-4">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-50">
                    My Short Links
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search, filter, edit, or delete link records. Toggle active status live.
                  </p>
                </div>
                
                <UrlTable
                  urls={urlPage?.content || []}
                  totalPages={urlPage?.totalPages || 0}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onSearchChange={handleSearchChange}
                  onSortChange={handleSortChange}
                  onRefresh={handleRefresh}
                  onOpenQr={handleOpenQr}
                />
              </div>
            </>
          )}

        </main>
      </div>

      {/* QR Code Download Modal Overlay */}
      <QrCodeModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal({ ...qrModal, isOpen: false })}
        qrCodeBase64={qrModal.qrCode}
        shortUrl={qrModal.shortUrl}
      />
    </div>
  );
};

export default DashboardPage;
