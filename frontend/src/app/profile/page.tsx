'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Loader2, User as UserIcon, Clock, Edit2, Check, X, Play, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isLoading: authLoading, logout, updateUser } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [updating, setUpdating] = useState(false);

    // Security State
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            setNewDisplayName(user.displayName || '');
            fetchHistory();
        }
    }, [user, authLoading, router]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/history');
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (err) {
            console.error("Fetch History Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const res = await api.patch('/auth/profile', { displayName: newDisplayName });
            if (res.data.success) {
                // The auth controller response structure is data.data according to settings page
                updateUser(res.data.data);
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Update Profile Error:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateSecurity = async (e: React.FormEvent) => {
        e.preventDefault();
        setSecurityMessage(null);

        if (securityData.newPassword !== securityData.confirmPassword) {
            return setSecurityMessage({ type: 'error', text: 'Passwords do not match' });
        }

        try {
            setUpdating(true);
            const res = await api.patch('/auth/profile', {
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword
            });

            if (res.data.success) {
                setSecurityMessage({ type: 'success', text: 'Password updated successfully' });
                setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err: any) {
            setSecurityMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading || (loading && history.length === 0)) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1117] flex flex-col text-white">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-12">
                {/* Profile Header */}
                <section className="bg-[#161b22] rounded-3xl p-8 border border-white/5">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-4xl font-black ring-4 ring-primary/20 shadow-2xl">
                            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newDisplayName}
                                            onChange={(e) => setNewDisplayName(e.target.value)}
                                            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1 text-xl font-bold focus:border-primary outline-none"
                                            autoFocus
                                        />
                                        <button type="submit" disabled={updating} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors">
                                            {updating ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <h1 className="text-3xl font-black tracking-tight">{user?.displayName || 'User'}</h1>
                                        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-400 mb-4">{user?.email}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                                    {user?.role || 'Viewer'}
                                </span>
                                {user?.subscriptionStatus === 'active' && (
                                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        Premium Member
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Security Settings Section (Merged from settings) */}
                    <section className="md:col-span-1 space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Lock className="text-primary" /> Security
                        </h2>
                        <div className="bg-[#161b22] rounded-3xl p-6 border border-white/5">
                            <form onSubmit={handleUpdateSecurity} className="space-y-4">
                                {securityMessage && (
                                    <div className={`p-3 rounded-xl text-xs font-medium ${securityMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {securityMessage.text}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            className="w-full bg-[#0f1117] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all pr-10"
                                            value={securityData.currentPassword}
                                            onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                        >
                                            {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            className="w-full bg-[#0f1117] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all pr-10"
                                            value={securityData.newPassword}
                                            onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                            placeholder="Min 8 chars"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                        >
                                            {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            className="w-full bg-[#0f1117] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all pr-10"
                                            value={securityData.confirmPassword}
                                            onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                            placeholder="Confirm new"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-white/5"
                                >
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Watch History */}
                    <section className="md:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Clock className="text-primary" /> Continue Watching
                        </h2>

                        {history.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {history.map((record) => (
                                    <Link
                                        href={`/watch/${record.episode._id}`}
                                        key={record._id}
                                        className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden flex group hover:border-primary/50 transition-all"
                                    >
                                        <div className="w-32 aspect-[9/16] relative bg-black flex-shrink-0">
                                            <img
                                                src={record.episode.thumbnail || record.episode.series?.coverImage}
                                                alt={record.episode.title}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play size={24} fill="white" />
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col justify-between flex-1">
                                            <div>
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                                                    {record.episode.series?.title || 'Series'}
                                                </p>
                                                <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                    Ep {record.episode.order}: {record.episode.title}
                                                </h3>
                                            </div>
                                            <div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, (record.progressSeconds / 60) * 10)}%` }} // Rough progress calc
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">
                                                    {record.completed ? 'Completed' : 'Recently Watched'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[#161b22] rounded-3xl border border-dashed border-white/10">
                                <Clock className="mx-auto text-gray-700 mb-4" size={48} />
                                <p className="text-gray-500">You haven't watched anything yet.</p>
                                <Link href="/browse" className="text-primary font-bold mt-4 inline-block hover:underline">
                                    Start Browsing
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
