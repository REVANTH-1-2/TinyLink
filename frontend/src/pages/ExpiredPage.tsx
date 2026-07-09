import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { Hourglass, Home } from 'lucide-react';

const ExpiredPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md text-center space-y-6">
        
        <div className="space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 mb-2">
            <Hourglass className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Link Expired
          </h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            This shortened URL has expired. It reached its configuration expiration datetime limit or was configured for one-time use only.
          </p>
        </div>

        <Card className="py-8">
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Create your own trackable, customizable, and secure links inside the TinyLink workspace portal.
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

export default ExpiredPage;
