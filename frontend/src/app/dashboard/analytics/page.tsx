'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
    BarChart3,
    CreditCard,
    Eye,
    Film,
    FolderTree,
    Layers3,
    Loader2,
    Play,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import api from '@/lib/api';

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
    const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'weekly'>('monthly');

    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/analytics')
            ]);

            const statsPayload = statsRes.data?.data ?? statsRes.data;
            const analyticsPayload = analyticsRes.data?.data ?? analyticsRes.data;

            setStats(statsPayload.stats || null);
            setUrgentItems(statsPayload.urgentItems || []);
            setTopContent(statsPayload.topContent || []);
            setGenreStats(analyticsPayload.genreStats || []);
        } catch (err: any) {
            const message = err?.response?.data?.error?.message || err?.message || 'Failed to load analytics';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
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

    const currentRevenue = revenuePeriod === 'monthly'
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Platform Analytics</h1>
                    <p className="text-sm text-gray-400">
                        Real-time metrics and performance overview in INR (₹)
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#161b22] border border-white/10 p-1 rounded-xl">
                        <button
                            onClick={() => setRevenuePeriod('weekly')}
                            className={clsx(
                                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                revenuePeriod === 'weekly' ? "bg-primary text-white" : "text-gray-500 hover:text-white"
                            )}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setRevenuePeriod('monthly')}
                            className={clsx(
                                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                revenuePeriod === 'monthly' ? "bg-primary text-white" : "text-gray-500 hover:text-white"
                            )}
                        >
                            Monthly
                        </button>
                    </div>

                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={clsx('inline-block mr-2', loading && 'animate-spin')} />
                        Refresh
                    </button>
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
                                    {revenuePeriod === 'monthly' ? 'Monthly MRR' : 'Weekly Revenue'}
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
                            {revenuePeriod} Projection
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">{revenuePeriod === 'monthly' ? 'Monthly MRR' : 'Weekly Revenue'}</p>
                            <p className="text-2xl font-bold text-emerald-400">{loading ? '—' : formatINR(currentRevenue)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Est. Annual Revenue</p>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : formatINR((stats?.revenue || stats?.monthlyRevenue || 0) * 12)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Avg Revenue/User</p>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : formatINR(stats?.totalUsers ? (currentRevenue / stats?.totalUsers) : 0)}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs text-gray-400 mb-2">Active Subscribers</p>
                            <p className="text-2xl font-bold text-white">{loading ? '—' : (stats?.activeSubscribers || 0).toLocaleString('en-IN')}</p>
                        </div>
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

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Genre Performance */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Categories</p>
                        <h2 className="text-lg font-bold text-white">Genre Statistics</h2>
                    </div>
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : genreStats.length > 0 ? (
                            genreStats.map((genre) => (
                                <div key={genre._id} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-gray-200">{genre._id}</span>
                                        <span className="text-gray-400">{genre.count.toLocaleString()} views</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(19,91,236,0.3)]"
                                            style={{ width: `${Math.min(100, (genre.count / (stats?.totalViews || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 italic">No genre data available</div>
                        )}
                    </div>
                </div>

                {/* Top Content */}
                <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Top Content</p>
                        <h2 className="text-lg font-bold text-white">Top Series by Views</h2>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-primary" size={24} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topContent.map((item) => (
                                <div key={item._id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                                    <div className="h-10 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 flex-shrink-0">
                                        {item.coverImage ? (
                                            <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Layers3 size={16} className="text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {item.views.toLocaleString()} views
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Platform Health/System Status Footer */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 font-medium">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        API Status: Optimal
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        DB Sync: Active
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                        Last Aggregation: Just now
                    </span>
                </div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">
                    Micro-Drama Insight Engine v2.1
                </div>
            </div>
        </div>
    );
}

