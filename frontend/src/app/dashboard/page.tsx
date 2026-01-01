'use client';

import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  Film, 
  Tv, 
  Home
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Users Management */}
        <Link href="/dashboard/users" className="block group">
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-primary/50 transition-all group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/10">
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
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-emerald-500/50 transition-all group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
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
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-purple-500/50 transition-all group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-purple-500/10">
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
          <div className="h-full p-6 bg-[#161b22] border border-white/5 rounded-2xl hover:border-pink-500/50 transition-all group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-pink-500/10">
            <div className="size-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 ring-1 ring-pink-500/20">
              <Film size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Movies Management</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload standalone movies and manage vertical short films.
            </p>
          </div>
        </Link>

        {/* Removed: Moderation Queue & Analytics */}

      </div>
    </div>
  );
}