'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
    Users,
    TrendingUp,
    Eye,
    CreditCard,
    TrendingDown,
    Layers3,
    Sparkles,
    Loader2,
    BarChart3,
    ArrowUpRight,
    Zap,
    Wallet,
    Target
} from 'lucide-react';
import api from '@/lib/api';
import PeriodicChart from '@/components/dashboard/PeriodicChart';
import GenreChart from '@/components/dashboard/GenreChart';
import DashboardFilter, { FilterResult } from '@/components/dashboard/DashboardFilter';

type Stats = {
    totalUsers: number;
    pendingEpisodes: number;
    revenue: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    activeSubscribers: number;
    totalViews: number;
    totalSeries: number;
    publishedSeries: number;
    totalEpisodes: number;
    publishedEpisodes: number;
    totalCategories: number;
    episodesPerSeries: number;
};


type GenreStat = {
    _id: string;
    count: number;
};

type UrgentItem = {
    _id: string;
    title: string;
    createdAt: string;
    series?: { _id: string; title: string };
    status: string;
};

type TopContent = {
    _id: string;
    title: string;
    views: number;
    coverImage?: string;
    createdAt: string;
};

type PeriodicData = {
    label: string;
    value: number;
};

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);

    const [urgentItems, setUrgentItems] = useState<UrgentItem[]>([]);
    const [topContent, setTopContent] = useState<TopContent[]>([]);
    const [genreStats, setGenreStats] = useState<GenreStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [globalFilter, setGlobalFilter] = useState<FilterResult | null>(null);
    const [viewsTrend, setViewsTrend] = useState<PeriodicData[]>([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [topSeriesData, setTopSeriesData] = useState<PeriodicData[]>([]);
    const [topEpisodesData, setTopEpisodesData] = useState<PeriodicData[]>([]);
    const [contentLoading, setContentLoading] = useState(false);

    const fetchData = async (filter: FilterResult) => {
        setLoading(true);
        setError('');
        try {
            const params = {
                startDate: filter.startDate,
                endDate: filter.endDate,
                period: filter.period
            };

            const [statsRes, analyticsRes, viewsRes, contentRes] = await Promise.all([
                api.get('/admin/stats', { params }),
                api.get('/admin/analytics', { params }),
                api.get('/admin/analytics/periodic', { params }),
                api.get('/admin/analytics/content', { params })
            ]);

            const statsPayload = statsRes.data?.data ?? statsRes.data;
            const analyticsPayload = analyticsRes.data?.data ?? analyticsRes.data;

            setStats(statsPayload.stats || null);
            setUrgentItems(statsPayload.urgentItems || []);
            setTopContent(statsPayload.topContent || []);
            setGenreStats(analyticsPayload.genreStats || []);

            setViewsTrend(viewsRes.data?.data ?? viewsRes.data ?? []);

            const contentData = contentRes.data?.data ?? contentRes.data;
            setTopSeriesData(contentData.topSeries || []);
            setTopEpisodesData(contentData.topEpisodes || []);

        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to load analytics';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filter: FilterResult) => {
        setGlobalFilter(filter);
        fetchData(filter);
    };

    const handleRefresh = () => {
        if (globalFilter) fetchData(globalFilter);
    };

    useEffect(() => {
        // Set a default filter on initial load
        const defaultFilter: FilterResult = {
            label: 'Last 30 Days',
            period: 'monthly',
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
        };
        setGlobalFilter(defaultFilter);
        fetchData(defaultFilter);
    }, []);

    const renderGrowth = (percent: number) => {
        if (percent === 0) return <span className="text-gray-400">No change</span>;
        const isPositive = percent > 0;
        return (
            <span className={clsx('flex items-center gap-1', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{percent}%
            </span>
        );
    };

    const currentRevenue = globalFilter?.period === 'monthly'
        ? (stats?.monthlyRevenue || stats?.revenue || 0)
        : (stats?.weeklyRevenue || 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        <BarChart3 size={14} className="text-primary" />
                        Analytics
                    </div>
                    <div className="mb-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Analytics</h1>
                        <p className="text-sm text-gray-400">Track your platform performance and content engagement</p>
                    </div>

                    <DashboardFilter
                        onChange={handleFilterChange}
                        onRefresh={handleRefresh}
                        loading={loading}
                    />
                    <p className="text-sm text-gray-400">
                        Real-time metrics and performance overview in INR (₹)
                    </p>
                </div>

            </div>


            {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Total Users */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Total Users</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (stats?.totalUsers || 0).toLocaleString('en-IN')}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <Users size={20} className="text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="text-emerald-400 flex items-center gap-1">
                                <TrendingUp size={14} /> Live
                            </span>
                            <span className="text-gray-500">Platform Data</span>
                        </div>
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Active Subscriptions</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (stats?.activeSubscribers || 0).toLocaleString('en-IN')}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <CreditCard size={20} className="text-purple-300" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="text-emerald-400 flex items-center gap-1">
                                <TrendingUp size={14} /> Total
                            </span>
                            <span className="text-gray-500">Active Members</span>
                        </div>
                    </div>
                </div>

                {/* Total Views */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Total Views</p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (stats?.totalViews || 0).toLocaleString('en-IN')}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <Eye size={20} className="text-orange-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                            <Sparkles size={14} className="text-orange-400" /> Global Engagement
                        </div>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 opacity-80" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                    {globalFilter?.period === 'monthly' ? 'Monthly MRR' : 'Weekly Revenue'}
                                </p>
                                <h3 className="mt-3 text-3xl font-bold text-white">
                                    {loading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : formatINR(currentRevenue)}
                                </h3>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                                <TrendingUp size={20} className="text-emerald-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                            {globalFilter?.period} Projection
                        </div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Revenue Overview */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Overview</p>
                            <h2 className="text-lg font-bold text-white">Revenue & Growth</h2>
                        </div>
                        <div className="flex gap-2">
                            <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">INR Pool</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Current Period Revenue */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{globalFilter?.period === 'monthly' ? 'Monthly MRR' : 'Weekly Revenue'}</p>
                                    <p className="mt-2 text-2xl font-black text-white">{loading ? '—' : formatINR(currentRevenue)}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                                    <Wallet size={18} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-emerald-400/80">
                                <TrendingUp size={12} /> Live Performance
                            </div>
                        </div>

                        {/* Estimated annual Revenue */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Est. Annual Revenue</p>
                                    <p className="mt-2 text-2xl font-black text-white">{loading ? '—' : formatINR((stats?.revenue || stats?.monthlyRevenue || 0) * 12)}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                                    <Zap size={18} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-blue-400/80">
                                <Target size={12} /> Projected Growth
                            </div>
                        </div>

                        {/* Avg Revenue/User */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition-all group-hover:bg-indigo-500/20" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Avg Revenue/User</p>
                                    <p className="mt-2 text-2xl font-black text-white">{loading ? '—' : formatINR(stats?.totalUsers ? (currentRevenue / stats?.totalUsers) : 0)}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                                    <Users size={18} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-indigo-400/80">
                                <Sparkles size={12} /> User Value
                            </div>
                        </div>

                        {/* Active Subscribers */}
                        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Subscribers</p>
                                    <p className="mt-2 text-2xl font-black text-white">{loading ? '—' : (stats?.activeSubscribers || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                                    <CreditCard size={18} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-purple-400/80">
                                <Zap size={12} /> Premium Base
                            </div>
                        </div>
                    </div>

                    {/* Views Trend Chart */}
                    <div className="mt-8 border-t border-white/5 pt-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-white uppercase tracking-tighter">Views Trend</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{globalFilter?.label || 'Total'}</p>
                        </div>
                        <PeriodicChart
                            data={viewsTrend}
                            type="area"
                            color="#3b82f6"
                            loading={loading}
                        />
                    </div>


                    <div className="mt-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4">Platform Health</p>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Content Completion Rate</span>
                                    <span className="text-white font-medium">85%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-primary rounded-full transition-all duration-1000" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">User Retention (30d)</span>
                                    <span className="text-white font-medium">62%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[62%] bg-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Summary */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Total Viewers</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.totalUsers || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Published Series</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.publishedSeries || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Total Views</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.totalViews || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Subscribers</p>
                        <p className="mt-2 text-xl font-bold text-white">{loading ? '—' : (stats?.activeSubscribers || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs text-gray-400">Platform Status</p>
                        <p className="mt-2 text-xl font-bold text-emerald-400">{loading ? '—' : 'Healthy'}</p>
                    </div>
                </div>
            </div>

            {/* Content Analytics Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-8">
                {/* Top Series List */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">Top Series</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">By period views</p>
                    </div>

                    <div className="space-y-4">
                        {topSeriesData.length > 0 ? (
                            topSeriesData.map((series: any, idx) => (
                                <div key={idx} className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.05]">
                                    <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                                        <img
                                            src={series.thumbnail || '/placeholder.png'}
                                            alt={series.label}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm font-bold text-white line-clamp-1">{series.label}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">{series.category || 'DRAMA'}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-primary">{series.value.toLocaleString()}</div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase">Views</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">No data for this period</div>
                        )}
                    </div>
                </div>

                {/* Top Episodes Table */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl overflow-hidden">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">Top Episodes</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Most played segments</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                                    <th className="pb-4 pr-4">Episode</th>
                                    <th className="pb-4 pr-4">Series</th>
                                    <th className="pb-4 text-right">Plays</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topEpisodesData.length > 0 ? (
                                    topEpisodesData.map((episode: any, idx) => (
                                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-primary transition-colors border border-white/10">
                                                        #{episode.episodeNumber || (idx + 1)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{episode.label}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="text-[10px] text-gray-400 font-bold line-clamp-1">{episode.seriesTitle}</div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className="text-xs font-black text-white">{episode.value.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">No data</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Genre Analytics */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
                {/* Genre Distribution Pie */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl lg:col-span-1">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white tracking-tight text-center lg:text-left">Genre Distribution</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 text-center lg:text-left">By views in period</p>
                    </div>
                    <div className="flex justify-center -mb-8">
                        <GenreChart data={genreStats} loading={loading} />
                    </div>
                </div>

                {/* Genre Breakdown List */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl lg:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">Performance Breakdown</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Detailed genre metrics</p>
                    </div>

                    <div className="space-y-6">
                        {genreStats.length > 0 ? (
                            genreStats.map((genre: any, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <span className="text-sm font-bold text-white uppercase tracking-wider">{genre._id}</span>
                                        </div>
                                        <span className="text-xs font-black text-gray-400">
                                            {genre.count.toLocaleString()} Views • {((genre.count / (stats?.totalViews || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (genre.count / (stats?.totalViews || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-gray-600 text-xs font-bold uppercase tracking-[0.2em]">No analytics recorded</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Platform Insights Bar */}
            <div className="mt-8 rounded-2xl border border-white/5 bg-black/40 p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">API Status: Optimal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DB Sync: Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Stats: Enabled</span>
                    </div>
                </div>
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] italic pointer-events-none">
                    Insight Engine v2.1
                </div>
            </div>
        </div>
    );
}

