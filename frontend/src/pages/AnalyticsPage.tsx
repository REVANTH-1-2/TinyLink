import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import DashboardCharts from '../components/DashboardCharts';
import { api } from '../services/api';
import { ArrowLeft, ExternalLink, Calendar, HelpCircle, Shield, RefreshCw } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Fetch specific URL metadata
  const { data: url, isLoading: loadingUrl } = useQuery({
    queryKey: ['urlDetails', id],
    queryFn: async () => {
      const res = await api.get(`/urls/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  // 2. Fetch specific URL clicks feed
  const { data: clicks, isLoading: loadingClicks } = useQuery({
    queryKey: ['urlClicks', id],
    queryFn: async () => {
      const res = await api.get(`/analytics/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const isPageLoading = loadingUrl || loadingClicks;

  const backendRedirectBase = window.location.origin.includes('localhost')
    ? 'http://localhost:8080'
    : window.location.origin;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50">
                Link Performance Analytics
              </h1>
              <p className="text-xs text-slate-500">
                Drill down into device breakdowns, locations, referrers, and activity logs.
              </p>
            </div>
          </div>

          {isPageLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : !url ? (
            <div className="text-center py-12 text-slate-400">URL details not found.</div>
          ) : (
            <>
              {/* URL Quick Detail Card */}
              <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                    {url.title || 'Untitled Link'}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                    <a
                      href={`${backendRedirectBase}/${url.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-0.5"
                    >
                      <span>/{url.shortCode}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="truncate max-w-sm" title={url.originalUrl}>
                      Destination: {url.originalUrl}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-xl border border-slate-150 px-4 py-2 text-center bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Clicks</p>
                    <p className="text-lg font-black text-brand-600 dark:text-brand-400">{url.clickCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-150 px-4 py-2 text-center bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Gate</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                      {url.isPasswordProtected ? 'Password Enabled' : 'None'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Render charts if clicks exist */}
              {clicks && clicks.length > 0 ? (
                <>
                  <DashboardCharts clicks={clicks} />

                  {/* Click History Log Table */}
                  <div className="mt-8 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                        Detailed Click Audit Feed
                      </h3>
                      <p className="text-xs text-slate-500">
                        A real-time audit log of the most recent redirect requests resolved.
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
                      <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                        <thead className="bg-slate-50/75 border-b border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-850 text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider text-xs">
                          <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Visitor IP (Hashed)</th>
                            <th scope="col" className="px-6 py-3">Location</th>
                            <th scope="col" className="px-6 py-3">Device & OS</th>
                            <th scope="col" className="px-6 py-3">Browser</th>
                            <th scope="col" className="px-6 py-3">Referrer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {clicks.map((click: any) => (
                            <tr key={click.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="px-6 py-3.5 whitespace-nowrap text-slate-900 dark:text-slate-200">
                                {new Date(click.clickTimestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-3.5 font-mono text-xs text-slate-500 truncate max-w-[120px]" title={click.ipHash}>
                                {click.ipHash ? click.ipHash.substring(0, 16) + '...' : '-'}
                              </td>
                              <td className="px-6 py-3.5 text-slate-800 dark:text-slate-300">
                                {click.country || 'Unknown'}
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="inline-flex items-center space-x-1">
                                  <span className="text-slate-800 dark:text-slate-300">{click.deviceType}</span>
                                  <span className="text-slate-400">/</span>
                                  <span className="text-xs text-slate-500">{click.operatingSystem}</span>
                                </span>
                              </td>
                              <td className="px-6 py-3.5 text-slate-700 dark:text-slate-450">
                                {click.browser || '-'}
                              </td>
                              <td className="px-6 py-3.5 text-slate-600 dark:text-slate-450 truncate max-w-[150px]" title={click.referrer}>
                                {click.referrer || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <Card className="text-center py-16 space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-slate-50">
                      No Clicks Logged Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      This link hasn't been accessed yet. Share the shortened link to track visitor browser, OS, and country metrics.
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
