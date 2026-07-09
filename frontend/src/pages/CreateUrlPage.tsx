import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import { api } from '../services/api';
import { Link2, ArrowLeft, Check, Copy, Sparkles, AlertCircle } from 'lucide-react';

const urlSchema = z.object({
  originalUrl: z.string().url('Invalid URL format. Please start with http:// or https://'),
  customAlias: z.string().optional()
    .refine(val => !val || /^[a-zA-Z0-9-_]*$/.test(val), {
      message: 'Alias must contain only alphanumeric characters, hyphens, or underscores',
    }),
  title: z.string().optional(),
  description: z.string().optional(),
  password: z.string().optional(),
  expirationDate: z.string().optional(),
  isOneTimeUse: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
});

type UrlFormValues = z.infer<typeof urlSchema>;

const CreateUrlPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdData, setCreatedData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      isOneTimeUse: false,
      isEnabled: true
    }
  });

  const onSubmit = async (data: UrlFormValues) => {
    setLoading(true);
    setServerError('');
    try {
      // Map form fields to API fields
      const payload = {
        originalUrl: data.originalUrl,
        customAlias: data.customAlias ? data.customAlias.trim() : undefined,
        title: data.title ? data.title.trim() : undefined,
        description: data.description ? data.description.trim() : undefined,
        password: data.password ? data.password : undefined,
        expirationDate: data.expirationDate ? new Date(data.expirationDate).toISOString() : undefined,
        isOneTimeUse: data.isOneTimeUse,
        isEnabled: data.isEnabled
      };

      const res = await api.post('/urls', payload);
      setCreatedData(res.data);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to create shortened URL. Alias might be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdData) return;
    const redirectBase = window.location.origin.includes('localhost')
      ? 'http://localhost:8080'
      : window.location.origin;
    navigator.clipboard.writeText(`${redirectBase}/${createdData.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    setCreatedData(null);
    reset();
    setServerError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
          {/* Top Title Banner */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50">
                Shorten Link
              </h1>
              <p className="text-xs text-slate-500">
                Configure destination URLs, custom aliases, security bounds, and more.
              </p>
            </div>
          </div>

          {createdData ? (
            /* Success State */
            <Card className="max-w-2xl mx-auto text-center space-y-6 py-8 border-2 border-emerald-500/20 dark:border-emerald-500/10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 animate-bounce">
                <Sparkles className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                  Link Shortened Successfully!
                </h2>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Your short code has been generated and cached for production performance.
                </p>
              </div>

              {/* Generated Links Box */}
              <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950 max-w-lg mx-auto flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TinyLink URL Link</p>
                  <a
                    href={`${window.location.origin.includes('localhost') ? 'http://localhost:8080' : window.location.origin}/${createdData.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-extrabold text-brand-600 dark:text-brand-400 hover:underline break-all"
                  >
                    /{createdData.shortCode}
                  </a>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Image Box */}
              {createdData.qrCode && (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-inner">
                    <img src={createdData.qrCode} alt="QR Code" className="h-32 w-32" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500">
                    Instantly shareable QR code generated
                  </span>
                </div>
              )}

              {/* Navigation Action */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <button
                  onClick={handleCreateAnother}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Shorten Another
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors"
                >
                  View Dashboard List
                </button>
              </div>

            </Card>
          ) : (
            /* Creation Form */
            <Card className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <Input
                  label="Destination Original URL"
                  type="url"
                  placeholder="https://example.com/very-long-path/search?q=springboot"
                  error={errors.originalUrl?.message}
                  {...register('originalUrl')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Alias (Optional, e.g. promo2026)"
                    type="text"
                    placeholder="customAlias"
                    error={errors.customAlias?.message}
                    {...register('customAlias')}
                  />
                  <Input
                    label="Title / Label (Optional)"
                    type="text"
                    placeholder="e.g. Marketing Link"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                    Description / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add an internal description for reference"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 transition-all duration-200"
                    {...register('description')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Input
                    label="Add Access Password (Optional)"
                    type="password"
                    placeholder="password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  
                  <Input
                    label="Link Expiration Date (Optional)"
                    type="datetime-local"
                    error={errors.expirationDate?.message}
                    {...register('expirationDate')}
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center space-x-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4.5 w-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
                      {...register('isOneTimeUse')}
                    />
                    <span>One-Time Use Only</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer select-none text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4.5 w-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
                      {...register('isEnabled')}
                    />
                    <span>Enabled immediately</span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/10 transition-colors disabled:opacity-50"
                  >
                    <span>{loading ? 'Generating link...' : 'Create Short Link'}</span>
                  </button>
                </div>
              </form>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
};

export default CreateUrlPage;
