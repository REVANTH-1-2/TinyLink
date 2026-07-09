import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { ShieldX, Home } from 'lucide-react';

const DisabledPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md text-center space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 mb-2 animate-pulse">
            <ShieldX className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Link Suspended
          </h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            This shortened URL has been disabled or paused by the administrator/owner.
          </p>
        </div>

        <Card className="py-8">
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            If you own this link, you can reactivate it anytime by toggling the status switch on your dashboard.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default DisabledPage;
