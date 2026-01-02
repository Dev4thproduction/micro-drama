'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SeriesCard from '@/components/browse/SeriesCard';
import { Loader2, Heart, Play } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MyListPage() {
    const { user, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchMyList = async () => {
            try {
                setLoading(true);
                const res = await api.get('/users/mylist');
                if (res.data.success) {
                    setList(res.data.data);
                }
            } catch (err: any) {
                console.error("Fetch My List Error:", err);
                setError(err.response?.data?.message || 'Failed to load your list.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyList();
        }
    }, [user, authLoading, router]);

    if (authLoading || (loading && list.length === 0)) {
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
        <div className="min-h-screen bg-[#0f1117] flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <Heart className="text-primary fill-current" size={32} />
                            My List
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">Your bookmarked and favorite dramas</p>
                    </div>

                    <div className="text-sm font-medium text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        {list.length} Series Bookmarked
                    </div>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <span className="text-xl font-bold">!</span>
                        {error}
                    </div>
                )}

                {list.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {list.map((series) => (
                            <SeriesCard key={series._id} series={{
                                ...series,
                                posterUrl: series.coverImage // Map coverImage to posterUrl for SeriesCard
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center text-center bg-[#161b22] rounded-3xl border border-dashed border-white/10 p-12">
                        <div className="p-6 bg-white/5 rounded-full mb-6">
                            <Heart className="text-gray-600" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Your list is empty</h2>
                        <p className="text-gray-400 max-w-sm mb-8">
                            Start adding your favorite dramas to this list by clicking the plus icon on any series page.
                        </p>
                        <button
                            onClick={() => router.push('/browse')}
                            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-transform active:scale-95 flex items-center gap-2"
                        >
                            <Play size={18} fill="currentColor" />
                            Browse Content
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
