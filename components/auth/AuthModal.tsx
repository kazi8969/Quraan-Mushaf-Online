'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        toast.success('Account created! You are now signed in.');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        onClose();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 bg-emerald-900/5 dark:bg-emerald-900/20 flex items-center justify-between">
          <h2 className="font-inter font-semibold text-stone-800 dark:text-stone-100">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-inter text-stone-500 mb-1.5">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-inter"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-inter text-stone-500 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-inter"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-inter text-stone-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 dark:border-stone-700 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-inter"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl',
              'font-inter font-semibold text-sm transition-colors',
              'flex items-center justify-center gap-2',
              loading && 'opacity-70 cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <><LogIn className="w-4 h-4" /> Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>
        </form>

        <div className="px-5 pb-5 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm text-emerald-600 hover:text-emerald-500 font-inter transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
