'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Tv, Layers, Library } from 'lucide-react';
import { clsx } from 'clsx';

const CMS_LINKS = [
  { name: 'Categories', href: '/dashboard/cms/categories', icon: Library },
  { name: 'Movies', href: '/dashboard/cms/movies', icon: Film },
  { name: 'Series', href: '/dashboard/cms/series', icon: Tv },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-[#161b22] border border-white/5 rounded-2xl p-4 h-fit lg:h-full">
        <div className="mb-6 px-4 pt-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="text-primary" size={20} /> CMS Studio
          </h2>
        </div>
        <nav className="space-y-1">
          {CMS_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#161b22]/50 border border-white/5 rounded-2xl p-6 overflow-y-auto custom-scrollbar relative">
        {children}
      </main>
    </div>
  );
}