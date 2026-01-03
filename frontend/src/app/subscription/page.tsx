'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap, Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import { useState } from 'react';

export default function SubscriptionPage() {
  const { user, updateSubscription } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'weekly' | 'monthly') => {
    // 1. Redirect if not logged in
    if (!user) {
      router.push('/login?redirect=/subscription');
      return;
    }
    
    setLoading(plan);
    
    try {
      // 2. Call Backend to create/update subscription in DB
      await api.post('/subscriptions/subscribe', { plan });
      
      // 3. Update Local State (AuthContext) so UI updates immediately
      updateSubscription(plan);
      
      // 4. Redirect to Success Page
      router.push(`/subscription/success?plan=${plan}`);
    } catch (err) {
      console.error("Subscription failed", err);
      alert("Transaction failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Crown size={12} fill="currentColor" /> Premium Access
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Unlock Unlimited <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Micro-Drama</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Experience cinematic storytelling without interruptions. Choose the plan that fits your viewing habits.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* FREE PLAN */}
          <div className="rounded-3xl bg-[#161b22] border border-white/5 p-8 flex flex-col hover:border-white/10 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Free Plan</h3>
              <p className="text-sm text-gray-500 mt-2">Good for getting started</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">₹0</span>
              <span className="text-gray-500">/forever</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check size={18} className="text-gray-500" /> Limited episodes
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check size={18} className="text-gray-500" /> Standard quality (720p)
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Check size={18} className="text-gray-500" /> Ad-supported viewing
              </li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 text-gray-300 font-bold hover:bg-white/10 transition-colors border border-white/5">
              Current Plan
            </button>
          </div>

          {/* WEEKLY PLAN */}
          <div className="rounded-3xl bg-[#161b22] border border-white/5 p-8 flex flex-col hover:border-primary/30 transition-colors relative overflow-hidden group">
            <div className="mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                 <Zap size={20} className="text-blue-400 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white">Weekly Pass</h3>
              <p className="text-sm text-gray-500 mt-2">Perfect for binge-watching</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">₹99</span>
              <span className="text-gray-500">/week</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check size={12} /></div>
                Unlimited Episodes
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check size={12} /></div>
                Ad-free experience
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check size={12} /></div>
                Valid for 7 days
              </li>
            </ul>
            <button 
              onClick={() => handleSubscribe('weekly')}
              disabled={loading === 'weekly'}
              className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'weekly' ? 'Processing...' : 'Get Weekly'}
            </button>
          </div>

          {/* MONTHLY PLAN (Highlighted) */}
          <div className="rounded-3xl bg-[#1d1926] border border-primary/50 p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(139,47,201,0.15)] transform md:-translate-y-4">
            {/* Best Value Badge */}
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Best Value
            </div>
            
            <div className="mb-6">
               <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                 <Crown size={20} className="text-primary fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white">Monthly Pro</h3>
              <p className="text-sm text-gray-400 mt-2">Full access, zero limits</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">₹199</span>
              <span className="text-gray-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-white">
                <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check size={12} /></div>
                Everything in Weekly
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                 <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check size={12} /></div>
                4K Ultra HD Quality
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                 <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check size={12} /></div>
                Offline Downloads
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                 <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check size={12} /></div>
                Priority Support
              </li>
            </ul>
            <button 
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <Shield size={14} /> Secure payment · Cancel anytime
            </p>
        </div>

      </main>
    </div>
  );
}