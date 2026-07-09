import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import { api } from '../services/api';
import { ShieldAlert, Key, ArrowRight } from 'lucide-react';

const PasswordProtectedPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Validate password against backend endpoint
      const response = await api.post(`/urls/${shortCode}/access`, { password });
      const { originalUrl } = response.data;
      
      // Perform client-side redirect
      window.location.href = originalUrl;
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Access Denied. Incorrect password entered.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 mb-2">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Link Protected
          </h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 max-w-xs mx-auto">
            This shortened URL is password-secured. Enter the access password to proceed.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                {error}
              </div>
            )}

            <Input
              label="Enter Password"
              type="password"
              placeholder="Access token password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 py-3 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-50"
            >
              <Key className="h-4 w-4" />
              <span>{loading ? 'Verifying access...' : 'Unlock Redirection'}</span>
              {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordProtectedPage;
