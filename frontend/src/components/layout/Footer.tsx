'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0b0d11] mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                                <Zap className="text-primary fill-current" size={20} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">Micro-Drama</span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            The premier destination for vertical storytelling. Experience cinematic quality short-form content designed for the mobile generation.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Discover</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/browse" className="hover:text-primary transition-colors">Trending Now</Link></li>
                            <li><Link href="/browse" className="hover:text-primary transition-colors">New Releases</Link></li>
                            <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Genres</Link></li>
                            <li><Link href="/subscription" className="hover:text-primary transition-colors">Premium Plans</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Community</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/register?role=creator" className="hover:text-primary transition-colors">Become a Creator</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Creator Portal</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Cookie Settings</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-medium">
                    <p>© 2025 Micro-Drama Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
