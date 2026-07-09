import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, User, Settings, Link2 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create', label: 'Create URL', icon: PlusCircle },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors duration-300">
      <div className="space-y-6">
        <div>
          <h2 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace
          </h2>
          <nav className="mt-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Workspace Quick Info / Tip box */}
        <div className="rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-4 text-white shadow-md shadow-brand-500/10 hidden md:block">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Link2 className="h-4 w-4" />
          </div>
          <h3 className="mt-3 text-sm font-bold">Fast Redirection</h3>
          <p className="mt-1 text-xs text-brand-100 leading-relaxed">
            Create URLs with custom expiration times, security password layers, or QR codes.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 hidden md:block">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          TinyLink URL Shortener v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
