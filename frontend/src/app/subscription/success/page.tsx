'use client';

import Link from 'next/link';
import { CheckCircle2, Home, Play } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'Premium';

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161b22] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden">
        
        {/* Confetti/Background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-amber-400" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">You're all set!</h1>
        <p className="text-gray-400 mb-8">
          Thanks for subscribing to the <span className="text-white font-bold capitalize">{plan} Plan</span>. Your account has been upgraded instantly.
        </p>

        <div className="space-y-3">
          <Link href="/browse">
            <button className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
              <Play size={18} fill="currentColor" /> Start Watching
            </button>
          </Link>
          
          <Link href="/">
            <button className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-all flex items-center justify-center gap-2">
              <Home size={18} /> Back to Home
            </button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A receipt has been sent to your email address.
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1117]" />}>
       <SuccessContent />
    </Suspense>
  );
}