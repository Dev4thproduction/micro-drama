'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Users,
  CreditCard,
  Film,
  Tv,
  Home,
  BarChart3,
  Eye,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data.stats);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your platform content and users.</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors font-medium"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#161b22] border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Users</span>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users size={18} className="text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white">
              {loading ? <Loader2 className="animate-spin text-gray-600" size={24} /> : stats?.totalUsers || 0}
            </h2>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-bold italic tracking-tighter">
              <TrendingUp size={12} /> Real-time
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#161b22] border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Platform Views</span>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Eye size={18} className="text-orange-400" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white">
              {loading ? <Loader2 className="animate-spin text-gray-600" size={24} /> : stats?.totalViews || 0}
            </h2>
            <div className="mt-2 text-xs text-orange-400 flex items-center gap-1 font-bold italic tracking-tighter">
              <TrendingUp size={12} /> Live Tracking
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#161b22] border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Monthly MRR</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CreditCard size={18} className="text-emerald-400" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white">
              {loading ? <Loader2 className="animate-spin text-gray-600" size={24} /> : formatINR(stats?.revenue || 0)}
            </h2>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-bold italic tracking-tighter">
              <TrendingUp size={12} /> 100% Growth
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Analytics Overview (New) */}
        <Link href="/dashboard/analytics" className="block group lg:col-span-2">
          <div className="h-full p-6 bg-gradient-to-br from-[#1c2128] to-[#161b22] border border-primary/20 rounded-2xl hover:border-primary transition-all group-hover:shadow-2xl group-hover:shadow-primary/5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="size-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 ring-1 ring-primary/20">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Platform Analytics</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                  Deep dive into user behavior, genre performance, and revenue trends. Get actionable insights to grow your micro-drama platform.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Engagment</p>
                  <div className="flex items-end gap-1 h-12">
                    <div className="w-2 h-4 bg-primary/20 rounded-t-sm animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-8 bg-primary/40 rounded-t-sm animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-6 bg-primary/30 rounded-t-sm animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <div className="w-2 h-10 bg-primary/60 rounded-t-sm animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-12 bg-primary rounded-t-sm animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Users Management */}
        <Link href="/dashboard/users" className="block group">
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-blue-500/50 transition-all">
            <div className="size-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              View registered users, manage roles, and handle account statuses.
            </p>
          </div>
        </Link>

        {/* Subscriptions */}
        <Link href="/dashboard/subscriptions" className="block group">
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-emerald-500/50 transition-all">
            <div className="size-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
              <CreditCard size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Subscriptions</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Monitor active subscriptions, revenue plans, and billing cycles.
            </p>
          </div>
        </Link>

        {/* Series Content CMS */}
        <Link href="/dashboard/cms/series" className="block group">
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-purple-500/50 transition-all">
            <div className="size-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 ring-1 ring-purple-500/20">
              <Tv size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Series Management</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload new drama series, manage episodes, and update metadata.
            </p>
          </div>
        </Link>

        {/* Movies Content CMS */}
        <Link href="/dashboard/cms/movies" className="block group">
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-pink-500/50 transition-all">
            <div className="size-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 ring-1 ring-pink-500/20">
              <Film size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Movies Management</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload standalone movies and manage vertical short films.
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}
