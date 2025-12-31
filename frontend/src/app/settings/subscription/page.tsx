'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import { 
  CreditCard, Calendar, Mail, Fingerprint, 
  CheckCircle2, Clock, Shield, AlertCircle 
} from 'lucide-react';
import { clsx } from 'clsx';

export default function ManageSubscriptionPage() {
  const { user, downgradeSubscription } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch real subscription data
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.get('/subscriptions/my-subscription');
        setSub(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSub();
  }, []);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel? You will lose access immediately.")) return;
    try {
      await api.post('/subscriptions/cancel'); 
      
      // 1. Show confirmation popup
      alert("You have been downgraded to the Free tier. All premium features have been removed.");
      
      // 2. Immediate Downgrade (Context & Local State)
      downgradeSubscription(); // Updates global AuthContext (removes gold border)
      setSub({ ...sub, status: 'canceled' }); // Updates local state to show "No Active Subscription" UI

    } catch (err) {
      alert("Failed to cancel subscription");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-white">Loading...</div>;

  const isWeekly = sub?.plan === 'weekly';
  const planName = isWeekly ? 'Weekly Pass' : 'Monthly Pro';
  const planPrice = isWeekly ? '₹99' : '₹199';
  const planDuration = isWeekly ? '/ week' : '/ month';
  const statusColor = sub?.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2">Manage Your Subscription</h1>
          <p className="text-gray-400 text-base font-normal max-w-2xl">
            View your current plan details, manage payment methods, and review your billing history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: ACTIVE PLAN */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Plan Card */}
            <div className="bg-[#161b22] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="p-8 relative z-10">
                {!sub || sub.status !== 'active' ? (
                   // NO ACTIVE SUBSCRIPTION STATE
                   <div className="text-center py-10">
                      <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
                      <p className="text-gray-400 mb-6">You are currently on the free tier.</p>
                      <Link href="/subscription">
                        <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25">
                          Upgrade Now
                        </button>
                      </Link>
                   </div>
                ) : (
                  // ACTIVE SUBSCRIPTION STATE
                  <>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Abstract Art / Cover */}
                      <div className="w-full md:w-48 aspect-video md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary to-purple-900 shrink-0 shadow-lg flex items-center justify-center">
                        <CheckCircle2 size={48} className="text-white/50" />
                      </div>

                      <div className="flex-1 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Current Plan</p>
                            <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", statusColor)}>
                              <span className={clsx("w-1.5 h-1.5 rounded-full", sub.status === 'active' ? "bg-emerald-400" : "bg-red-400")}></span>
                              {sub.status.toUpperCase()}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">{planName}</h2>
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black text-white">{planPrice}</span>
                            <span className="text-gray-400 text-sm">{planDuration}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {/* Only show 'Change to Monthly' if currently on Weekly */}
                          {isWeekly && (
                            <Link href="/subscription">
                              <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20">
                                Change to Monthly
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/5 my-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-primary" />
                        <span className="text-gray-300 text-sm">Unlimited Skips & Rewinds</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 size={18} className="text-primary" />
                        <span className="text-gray-300 text-sm">4K Ultra HD Streaming</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 size={18} className="text-primary" />
                        <span className="text-gray-300 text-sm">Offline Downloads</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <CheckCircle2 size={18} className="text-primary" />
                        <span className="text-gray-300 text-sm">Early Access to Originals</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Billing Details */}
            {sub && sub.status === 'active' && (
              <div className="bg-[#161b22] rounded-3xl border border-white/5 p-8">
                <h3 className="text-lg font-bold mb-6 text-white">Billing Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-gray-500 text-sm">Next Billing Date</p>
                    <div className="flex items-center gap-2 text-gray-200">
                      <Calendar size={18} />
                      <span className="font-medium">{new Date(sub.renewsAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-gray-500 text-sm">Payment Method</p>
                    <div className="flex items-center gap-2 text-gray-200">
                      <CreditCard size={18} />
                      <span className="font-medium">Micro-Wallet •••• 1234</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-gray-500 text-sm">Billing Email</p>
                    <div className="flex items-center gap-2 text-gray-200">
                      <Mail size={18} />
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-gray-500 text-sm">Plan ID</p>
                    <div className="flex items-center gap-2 text-gray-200">
                      <Fingerprint size={18} />
                      <span className="font-medium font-mono text-xs">#{sub._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Looking to take a break?</p>
                  <button onClick={handleCancel} className="text-red-400 hover:text-red-300 text-sm font-bold hover:underline transition-colors flex items-center gap-1">
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: HISTORY */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#161b22] rounded-3xl border border-white/5 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Billing History</h3>
              </div>
              
              <div className="flex flex-col space-y-4">
                {/* Mock History Items */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">Payment Success</p>
                        <p className="text-gray-500 text-xs">{new Date(Date.now() - i * 86400000 * 30).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-white font-bold text-sm">{planPrice}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="text-white text-sm font-bold mb-1">Need help?</p>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        If you have issues with billing, please contact our support team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}