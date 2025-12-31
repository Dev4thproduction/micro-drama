'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  CreditCard, 
  BarChart3, 
  UserPlus, 
  LogOut, 
  Menu, 
  X,
  Database,
  Home // 1. Import Home icon
} from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'CMS & Content', href: '/dashboard/cms/categories', icon: Database },
    { name: 'User Management', href: '/dashboard/users', icon: Users },
    { name: 'Moderation Queue', href: '/dashboard/moderation', icon: Shield },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Create Admin', href: '/dashboard/create-admin', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display flex">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#161b22] border-r border-white/5 transition-transform duration-300 lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
           <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
             <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
               M
             </div>
             Micro-Admin
           </Link>
           <button className="ml-auto lg:hidden" onClick={() => setIsSidebarOpen(false)}>
             <X size={20} className="text-gray-400" />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
           {navItems.map((item) => {
             const Icon = item.icon;
             
             const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href) || (item.name === 'CMS & Content' && pathname.startsWith('/dashboard/cms'));

             return (
               <Link 
                 key={item.name} 
                 href={item.href}
                 onClick={() => setIsSidebarOpen(false)}
                 className={clsx(
                   "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                   isActive 
                     ? "bg-primary text-white shadow-[0_0_20px_rgba(19,91,236,0.3)]" 
                     : "text-gray-400 hover:bg-white/5 hover:text-white"
                 )}
               >
                 <Icon size={20} className={clsx(isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                 {item.name}
               </Link>
             );
           })}

           {/* 2. Added Back to Home Button */}
           <div className="pt-4 mt-4 border-t border-white/5">
              <Link 
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 group"
              >
                <Home size={20} className="text-gray-500 group-hover:text-white" />
                Back to Home
              </Link>
           </div>
        </nav>

        {/* Footer User Profile */}
        <div className="p-4 border-t border-white/5">
            <Link href="/dashboard/settings">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold ring-2 ring-[#0f1117] group-hover:ring-white/20 transition-all">
                  {user?.email?.[0].toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{user?.displayName || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault(); 
                    handleLogout();
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors z-10"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </Link>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <div className="lg:hidden h-16 flex items-center px-4 border-b border-white/5 bg-[#161b22]">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white">
             <Menu size={24} />
           </button>
           <span className="ml-4 font-bold text-white">Dashboard</span>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
           {children}
        </main>
      </div>

    </div>
  );
}