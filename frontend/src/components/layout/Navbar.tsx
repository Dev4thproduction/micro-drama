'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Zap, Crown, LogOut, LayoutDashboard, Settings, CreditCard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  const isSubscribed = user?.subscriptionStatus === 'active';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0f1117]/90 backdrop-blur-xl border-b border-white/5 h-16 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Zap className="text-primary fill-current" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Micro-Drama</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all">Home</Link>
            <Link href="/browse" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all">Browse</Link>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
          <form onSubmit={handleSearch} className="hidden sm:flex relative w-full max-w-xs group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors"><Search size={16} /></div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-10 pr-4 text-sm text-gray-200 focus:border-primary/50 focus:bg-[#161b22] outline-none transition-all"
            />
          </form>

          {!isSubscribed && (
            <Link href="/subscription">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full transition-colors group">
                <Crown size={16} className="fill-current group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider hidden lg:block">Premium</span>
              </button>
            </Link>
          )}

          {user ? (
            <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 pl-2 py-1 pr-1 rounded-r-xl transition-colors">
                  <div className={clsx(
                    "size-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 text-white relative",
                    isSubscribed ? "ring-amber-400 bg-gradient-to-br from-amber-600 to-yellow-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "ring-[#0f1117] bg-gradient-to-br from-primary to-blue-600"
                  )}>
                    {user.displayName?.[0]?.toUpperCase() || 'U'}
                    {isSubscribed && <div className="absolute -top-1.5 -right-1 bg-[#0f1117] rounded-full p-0.5 border border-amber-500"><Crown size={8} className="text-amber-500 fill-current" /></div>}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-[#161b22] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-1.5 space-y-0.5">
                      <div className="px-3 py-2 text-xs text-gray-500 font-bold uppercase tracking-wider">{user.displayName || 'Account'}</div>
                      {isSubscribed && (
                         <Link href="/settings/subscription" className="flex items-center gap-2 px-3 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors font-medium">
                            <CreditCard size={16} /> Manage Subscription
                         </Link>
                      )}
                      {user.role === 'admin' && <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-primary hover:text-white rounded-lg transition-colors"><LayoutDashboard size={16} /> Dashboard</Link>}
                      <Link href="/settings" className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-primary hover:text-white rounded-lg transition-colors"><Settings size={16} /> Settings</Link>
                      <div className="h-px bg-white/5 my-1" />
                      <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"><LogOut size={16} /> Sign Out</button>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <Link href="/login"><button className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg transition-all">Log In</button></Link>
          )}
        </div>
      </div>
    </nav>
  );
}