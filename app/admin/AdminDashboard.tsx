'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  BookOpen, Users, Bookmark, Heart, BarChart2,
  TrendingUp, Clock, Globe, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Analytics {
  total_bookmarks: number;
  total_favorites: number;
  total_users: number;
  total_reading_sessions: number;
  popular_pages: { page_number: number; count: number }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // In production, check admin role from user metadata
      setIsAdmin(true);

      try {
        const [bookmarks, favorites, progress, history] = await Promise.all([
          supabase.from('bookmarks').select('id', { count: 'exact', head: true }),
          supabase.from('favorite_ayahs').select('id', { count: 'exact', head: true }),
          supabase.from('reading_progress').select('id', { count: 'exact', head: true }),
          supabase.from('reading_history').select('page_number'),
        ]);

        // Count popular pages
        const pageCounts: Record<number, number> = {};
        (history.data ?? []).forEach((h) => {
          pageCounts[h.page_number] = (pageCounts[h.page_number] ?? 0) + 1;
        });
        const popularPages = Object.entries(pageCounts)
          .map(([page, count]) => ({ page_number: parseInt(page), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setAnalytics({
          total_bookmarks: bookmarks.count ?? 0,
          total_favorites: favorites.count ?? 0,
          total_users: progress.count ?? 0,
          total_reading_sessions: history.data?.length ?? 0,
          popular_pages: popularPages,
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoad();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-600 dark:text-stone-400 font-inter">
          Admin access required. Please sign in.
        </p>
        <Link href="/" className="text-emerald-600 hover:text-emerald-500 font-inter text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Quran
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Active Readers', value: analytics?.total_users ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Bookmarks', value: analytics?.total_bookmarks ?? 0, icon: Bookmark, color: 'text-amber-600' },
    { label: 'Favorite Ayahs', value: analytics?.total_favorites ?? 0, icon: Heart, color: 'text-rose-600' },
    { label: 'Reading Sessions', value: analytics?.total_reading_sessions ?? 0, icon: Clock, color: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <header className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h1 className="font-inter font-semibold text-lg">Quran Sharif Admin</h1>
        </div>
        <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm font-inter flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to App
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 font-inter mb-6">
          Analytics Dashboard
        </h2>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm"
            >
              <div className={cn('w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center mb-3', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 font-inter">
                {value.toLocaleString()}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-inter mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Popular pages */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="font-inter font-semibold text-stone-800 dark:text-stone-100">
              Most Read Pages
            </h3>
          </div>
          {analytics?.popular_pages.length ? (
            <div className="divide-y divide-stone-100 dark:divide-stone-700">
              {analytics.popular_pages.map((p) => (
                <div key={p.page_number} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-sm font-inter text-stone-500 w-8">p.{p.page_number}</span>
                  <div className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (p.count / (analytics.popular_pages[0]?.count ?? 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-inter text-stone-600 dark:text-stone-400 w-8 text-right">
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-stone-400 font-inter text-sm">
              No reading history data yet
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '#', label: 'Manage Translations', icon: Globe, desc: 'Update translation sources' },
            { href: '#', label: 'Audio Sources', icon: BookOpen, desc: 'Configure recitation APIs' },
            { href: '#', label: 'User Management', icon: Users, desc: 'View and manage users' },
          ].map(({ href, label, icon: Icon, desc }) => (
            <div
              key={label}
              className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 flex items-center gap-3"
            >
              <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-inter font-medium text-stone-800 dark:text-stone-100 text-sm">{label}</p>
                <p className="text-xs text-stone-400 font-inter">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
