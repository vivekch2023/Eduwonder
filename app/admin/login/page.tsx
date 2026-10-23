'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setIsAdmin } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // 1. If Supabase is configured, attempt Supabase Auth
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          // If user hasn't registered in Supabase auth yet, provide helpful message
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          setIsAdmin(true);
          localStorage.setItem('eduwonder_is_admin', 'true');
          setSuccessMsg('Signed in successfully! Opening dashboard...');
          setTimeout(() => router.push('/admin'), 1000);
          return;
        }
      }

      // 2. Demo Admin Fallback authentication for immediate testing
      if (
        (email.trim().toLowerCase() === 'admin@eduwonder.com' && password === 'admin123') ||
        (email.trim().toLowerCase() === 'admin@college.edu' && password === 'admin123')
      ) {
        setIsAdmin(true);
        localStorage.setItem('eduwonder_is_admin', 'true');
        setSuccessMsg('Signed in successfully! Opening dashboard...');
        setTimeout(() => router.push('/admin'), 1000);
        return;
      }

      setErrorMsg('Wrong email or password. You can click "Auto-Fill" below to test.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@eduwonder.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-violet-500/25">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Teacher & Staff
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Teacher Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to upload notes, create tests, check student marks, and manage exams.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="admin@eduwonder.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        
      </div>
    </div>
  );
}
