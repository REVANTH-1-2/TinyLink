import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
          {/* Header Title */}
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-50">
              Account Profile
            </h1>
            <p className="text-xs text-slate-500">
              Manage your personal credentials, roles, and connected settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Profile Info */}
            <Card className="md:col-span-2 space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                Profile Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Username</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Access Role</p>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                      Standard User (ROLE_USER)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                  Account Control
                </h2>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-3 leading-relaxed">
                  Sign out of TinyLink. Clearing local caches will terminate your current authentication token.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
