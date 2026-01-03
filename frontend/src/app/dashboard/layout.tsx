'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Film,
  UserPlus,
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
    { name: 'Content CMS', href: '/dashboard/cms/series', icon: Film },
    { name: 'Create Admin', href: '/dashboard/create-admin', icon: UserPlus },
    // ❌ REMOVED: Analytics
    // ❌ REMOVED: Moderation Queue
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display flex">

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white/10 rounded-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#161b22] border-r border-white/5 transition-transform duration-300 lg:translate-x-0 lg:static",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 lg:p-10 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}