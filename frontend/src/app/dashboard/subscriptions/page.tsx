'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  DollarSign,
  TrendingUp,
  Search,
  Crown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Zap,
  BarChart3,
  Wallet,
  Target,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { clsx } from 'clsx';
import PeriodicChart from '@/components/dashboard/PeriodicChart';
import DashboardFilter, { FilterResult } from '@/components/dashboard/DashboardFilter';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<FilterResult | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'monthly' | 'weekly'>('all');
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!globalFilter) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const commonParams = {
          startDate: globalFilter.startDate,
          endDate: globalFilter.endDate,
          period: globalFilter.period
        };

        const [statsRes, subsRes, trendRes] = await Promise.all([
          api.get('/admin/stats', { params: commonParams }),
          api.get('/admin/subscriptions', {
            params: {
              ...commonParams,
              page,
              search: debouncedSearch,
              plan: planFilter === 'all' ? undefined : planFilter
            }
          }),
          api.get('/admin/revenue/periodic', { params: commonParams })
        ]);

        setStats(statsRes.data.data.stats || {});
        setSubs(subsRes.data.data || []);
        setTotalPages(subsRes.data.meta?.totalPages || 1);
        setRevenueTrend(trendRes.data?.data ?? trendRes.data ?? []);
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page, debouncedSearch, planFilter, globalFilter]);

  const handleFilterChange = (filter: FilterResult) => {
    setGlobalFilter(filter);
    setPage(1);
  };

  const handleRefresh = () => {
    if (globalFilter) {
      setPage(1);
      // The dependency in useEffect will handle the update
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentRevenue = globalFilter?.period === 'monthly'
    ? (stats.monthlyRevenue || stats.revenue || 0)
    : (stats.weeklyRevenue || 0);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Subscriptions & Revenue</h1>
          <p className="text-gray-400 mt-1">Manage billing and track revenue analytics.</p>
        </div>
      </div>

      <DashboardFilter
        onChange={handleFilterChange}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* REVENUE CARD */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-[#161b22] p-6 shadow-xl transition-all hover:bg-white/[0.04]">
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-all group-hover:bg-blue-500/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 shadow-lg">
                <Wallet size={24} />
              </div>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                {globalFilter?.period} MRR
              </span>
            </div>
            <h3 className="text-3xl font-black text-white">{loading ? <Loader2 size={24} className="animate-spin text-gray-500" /> : formatINR(currentRevenue)}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">Estimated {globalFilter?.period} Revenue</p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-blue-400/80">
              <TrendingUp size={12} /> Live Tracking
            </div>
          </div>
        </div>

        {/* REVENUE CARD - TOTAL */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-[#161b22] p-6 shadow-xl transition-all hover:bg-white/[0.04]">
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-all group-hover:bg-emerald-500/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 shadow-lg">
                <Target size={24} />
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                Lifetime Revenue
              </span>
            </div>
            <h3 className="text-3xl font-black text-white">{loading ? <Loader2 size={24} className="animate-spin text-gray-500" /> : formatINR(stats.totalRevenue || 0)}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">Gross Platform Earnings</p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-emerald-400/80">
              <Sparkles size={12} /> Accumulative
            </div>
          </div>
        </div>

        {/* ACTIVE SUBSCRIBERS */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-[#161b22] p-6 shadow-xl transition-all hover:bg-white/[0.04]">
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20 shadow-lg">
                <Crown size={24} />
              </div>
              <span className="bg-purple-500/10 text-purple-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                Active Users
              </span>
            </div>
            <h3 className="text-3xl font-black text-white">{loading ? <Loader2 size={24} className="animate-spin text-gray-500" /> : (stats.activeSubscribers || 0).toLocaleString('en-IN')}</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">Current Premium Members</p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-purple-400/80">
              <Zap size={12} /> Paying Base
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
            <BarChart3 size={14} className="text-primary" />
            Revenue Analytics
          </div>
          <h2 className="text-xl font-bold text-white tracking-tighter">Performance Trend</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{globalFilter?.label || 'Historical'}</p>
        </div>

        <PeriodicChart
          data={revenueTrend}
          type="bar"
          color="#10b981"
          loading={chartLoading}
          valueFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
        />
      </div>

      {/* TABLE */}
      <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* TABLE LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-[#161b22]/40 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-white whitespace-nowrap">Subscriber Database</h3>

            {/* PLAN FILTER */}
            <div className="hidden sm:flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-lg ml-4">
              {(['all', 'monthly', 'weekly'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => {
                    setPage(1);
                    setPlanFilter(plan);
                  }}
                  className={clsx(
                    "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                    planFilter === plan ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-primary/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4 text-center sm:text-left">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {subs.length === 0 && !loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No subscribers found.</td></tr>
              ) : (
                subs.map((sub) => (
                  <tr key={sub._id} className="group hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                          {sub.user?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-white leading-tight">{sub.user?.displayName || 'Unknown'}</div>
                          <div className="text-[10px] text-gray-500">{sub.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.plan === 'monthly' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/5">
                          <Crown size={12} fill="currentColor" /> Monthly (₹199)
                        </span>
                      ) : sub.plan === 'weekly' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/5">
                          <Zap size={12} fill="currentColor" /> Weekly (₹99)
                        </span>
                      ) : (
                        <span className="text-gray-400">{sub.plan}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "text-[10px] font-black px-2 py-0.5 rounded border tracking-widest",
                        sub.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-[10px]">
                      {new Date(sub.startDate).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="border-t border-white/5 p-4 flex items-center justify-between bg-black/20">
          <span className="text-xs text-gray-500 font-medium tracking-tight">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

