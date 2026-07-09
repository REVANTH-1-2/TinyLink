import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Link2, Shield, BarChart3, QrCode, Zap, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Base62 Shortening',
      description: 'Convert long, ugly URLs into clean, manageable, cryptographically random 6–8 character codes.',
      icon: Link2,
    },
    {
      title: 'Advanced Analytics',
      description: 'Track clicks, devices, operating systems, browsers, referring sites, and geographic locations in real-time.',
      icon: BarChart3,
    },
    {
      title: 'Custom Aliases',
      description: 'Personalize your links by defining custom, recognizable vanity aliases instead of random codes.',
      icon: Globe,
    },
    {
      title: 'Password Security',
      description: 'Protect sensitive destination sites by adding password gates to your shortened URLs.',
      icon: Shield,
    },
    {
      title: 'Automatic QR Codes',
      description: 'Instantly generate high-quality QR codes for every shortened link to enable easy mobile scanning.',
      icon: QrCode,
    },
    {
      title: 'One-Time Links & TTL',
      description: 'Create self-destructing links that expire after a single use or after a configured datetime limit.',
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-indigo-500 opacity-20 dark:opacity-30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-brand-50/50 px-4 py-1.5 dark:border-brand-900/30 dark:bg-brand-950/20">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">TinyLink Enterprise v1.0 is Live</span>
          </div>

          <h1 className="mx-auto max-w-4xl bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-800 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-slate-100 dark:via-brand-400 dark:to-indigo-300">
            Create Short, Secure, and <br className="hidden md:inline" />
            Trackable Connections
          </h1>

          <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-650 dark:text-slate-405 leading-relaxed">
            TinyLink is an SDE portfolio-grade, production-ready link shortening platform. Manage your short URLs, view advanced analytics, lock targets with passwords, and generate QR codes instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-650 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:from-brand-700 hover:to-indigo-750 transition-all duration-200 group w-full sm:w-auto justify-center"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4.5 w-4.5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
            >
              Configure Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 md:py-24 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/50 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Equipped with Premium Features
            </h2>
            <p className="mx-auto max-w-xl text-sm text-slate-550 dark:text-slate-400">
              A comprehensive toolkit engineered to provide complete control over redirection flows and metrics.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/40 p-6 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/85 transition-all duration-300 group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 group-hover:scale-105 transition-transform">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-50">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SDE Tech Stack section banner */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/20 border-t border-slate-200/50 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Portfolio Technology Stack Configuration
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-70">
            <span className="font-extrabold text-slate-600 dark:text-slate-400">Java 21</span>
            <span className="font-extrabold text-slate-600 dark:text-slate-400">Spring Boot 3</span>
            <span className="font-extrabold text-slate-600 dark:text-slate-400">PostgreSQL</span>
            <span className="font-extrabold text-slate-600 dark:text-slate-400">Redis Cache</span>
            <span className="font-extrabold text-slate-600 dark:text-slate-400">React + TS</span>
            <span className="font-extrabold text-slate-600 dark:text-slate-400">Docker</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Link2 className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">TinyLink</span>
          </div>
          <p className="text-xs text-slate-450 dark:text-slate-500">
            &copy; {new Date().getFullYear()} TinyLink URL Shortener. All rights reserved. Created for portfolio demonstrations.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
