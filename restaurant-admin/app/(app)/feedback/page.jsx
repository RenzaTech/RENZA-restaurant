'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MessageSquareQuote,
  Star,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ThumbsUp,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function FeedbackAdminPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-refresh config (30 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Filters
  const [ratingFilter, setRatingFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | '7days' | '30days'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute startDate & endDate from dateFilter
  const getDateRange = useCallback(() => {
    const now = new Date();
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return { startDate: today.toISOString() };
    }
    if (dateFilter === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: past.toISOString() };
    }
    if (dateFilter === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: past.toISOString() };
    }
    return {};
  }, [dateFilter]);

  // Fetch feedback data
  const fetchFeedbacks = useCallback(
    async (showSilentRefresh = false) => {
      if (showSilentRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const dateRange = getDateRange();
        const params = {
          page,
          limit: 20,
          ...(ratingFilter ? { rating: ratingFilter } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...dateRange,
        };

        const res = await api.get('/api/restaurant/feedbacks', { params });
        const data = res.data || {};

        setFeedbacks(data.feedbacks || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        if (data.summary) {
          setSummary(data.summary);
        }
        setLastUpdated(new Date());
        setSecondsAgo(0);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error('Failed to load feedbacks:', err);
          if (!showSilentRefresh) {
            toast.error('Failed to load feedback records');
          }
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, ratingFilter, debouncedSearch, getDateRange]
  );

  // Initial fetch and when filters change
  useEffect(() => {
    fetchFeedbacks(false);
  }, [fetchFeedbacks]);

  // Auto-refresh interval (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFeedbacks(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchFeedbacks]);

  // Ticking seconds-ago counter
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Refresh immediately when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (autoRefresh) {
        fetchFeedbacks(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [autoRefresh, fetchFeedbacks]);

  // Export CSV handler
  const handleDownloadCsv = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Preparing feedback CSV export...');
    try {
      const dateRange = getDateRange();
      const params = {
        ...(ratingFilter ? { rating: ratingFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...dateRange,
      };

      const res = await api.get('/api/restaurant/feedbacks/export', {
        params,
        responseType: 'blob',
      });

      // Extract filename from response headers if present
      let filename = `restaurant-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
      const disposition = res.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      // Trigger browser download
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Feedback CSV downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Download CSV failed:', err);
      toast.error('Failed to export feedback CSV. Please try again.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to format date in readable IST format
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── TOP HEADER & ACTIONS BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <MessageSquareQuote className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Guest Dining Feedback
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Live feedback from customer QR menus & table visits.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status, Refresh & Download Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Live Auto-Refresh Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              {autoRefresh && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'
                )}
              ></span>
            </span>
            <span className="hidden sm:inline">
              {autoRefresh ? 'Auto-updating (30s)' : 'Auto-update paused'}
            </span>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-[11px] underline text-slate-500 hover:text-slate-800 ml-0.5"
            >
              {autoRefresh ? 'Pause' : 'Resume'}
            </button>
            {lastUpdated && (
              <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">
                {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
              </span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchFeedbacks(true)}
            disabled={isRefreshing || loading}
            className="gap-1.5 h-9"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-orange-500')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Download CSV Button */}
          <Button
            type="button"
            onClick={handleDownloadCsv}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs h-9 text-xs sm:text-sm font-bold"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Feedback CSV</span>
          </Button>
        </div>
      </div>

      {/* ── SUMMARY KPI ANALYTICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Average Rating */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Average Rating
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {summary ? summary.averageRating : '0.0'}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-inner">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Total Reviews</span>
            <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
              {summary ? summary.totalFeedbacks : 0}
            </span>
          </div>
        </div>

        {/* Card 2: Food Quality */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Food Quality
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600 tracking-tight">
                  {summary?.averageFoodRating ? summary.averageFoodRating : '—'}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-medium truncate">
            Taste, freshness & portion size
          </div>
        </div>

        {/* Card 3: Service Speed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Staff & Service
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600 tracking-tight">
                  {summary?.averageServiceRating ? summary.averageServiceRating : '—'}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-medium truncate">
            Wait time & staff friendliness
          </div>
        </div>

        {/* Card 4: Cleanliness & Ambience */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Ambience & Clean
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600 tracking-tight">
                  {summary?.averageCleanlinessRating ? summary.averageCleanlinessRating : '—'}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-medium truncate">
            Hygiene, comfort & environment
          </div>
        </div>
      </div>

      {/* ── HIGHLIGHTS & IMPROVEMENT TAGS BAR ── */}
      {summary && (summary.topHighlights?.length > 0 || summary.topImprovements?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Praises */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Guest Praises
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.topHighlights.map((item) => (
                <span
                  key={item.tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                >
                  <span>{item.tag}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-200/70 text-[10px] text-emerald-900 font-black">
                    {item.count}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Top Improvement Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Improvement Areas
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.topImprovements.length === 0 ? (
                <span className="text-xs text-slate-400">No improvement concerns noted!</span>
              ) : (
                summary.topImprovements.map((item) => (
                  <span
                    key={item.tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                  >
                    <span>{item.tag}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-200/70 text-[10px] text-rose-900 font-black">
                      {item.count}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER CONTROLS BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table number or comment keywords..."
            className="pl-9 h-10 text-xs sm:text-sm bg-slate-50 border-slate-200"
          />
        </div>

        {/* Rating & Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Star Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { label: 'All Stars', val: '' },
              { label: '5 ★', val: '5' },
              { label: '4 ★', val: '4' },
              { label: '3 ★', val: '3' },
              { label: '1-2 ★', val: '2' },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setRatingFilter(opt.val);
                  setPage(1);
                }}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  ratingFilter === opt.val
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { label: 'Today', val: 'today' },
              { label: '7 Days', val: '7days' },
              { label: '30 Days', val: '30days' },
              { label: 'All Time', val: 'all' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => {
                  setDateFilter(opt.val);
                  setPage(1);
                }}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  dateFilter === opt.val
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEEDBACK RECORDS LIST ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No feedback records found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || ratingFilter || dateFilter !== 'all'
              ? 'Try clearing or relaxing your search and date filters.'
              : 'Customer feedback submitted via the QR menu will automatically appear here.'}
          </p>
          {(searchQuery || ratingFilter || dateFilter !== 'all') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRatingFilter('');
                setDateFilter('all');
                setPage(1);
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Row 1: Table badge, overall rating stars, timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold tracking-wide">
                    {item.tableNumber || 'Unspecified'}
                  </span>

                  {/* Overall Star Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.overallRating} / 5</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>
              </div>

              {/* Row 2: Aspect ratings (Food, Service, Ambience) */}
              {(item.foodRating || item.serviceRating || item.cleanlinessRating) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {item.foodRating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                      <span className="text-slate-400">Food:</span>
                      <strong className="text-slate-900">{item.foodRating}★</strong>
                    </span>
                  )}
                  {item.serviceRating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                      <span className="text-slate-400">Service:</span>
                      <strong className="text-slate-900">{item.serviceRating}★</strong>
                    </span>
                  )}
                  {item.cleanlinessRating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                      <span className="text-slate-400">Cleanliness:</span>
                      <strong className="text-slate-900">{item.cleanlinessRating}★</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Row 3: Highlight & Improvement Tags */}
              {(item.highlights?.length > 0 || item.improvements?.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {item.highlights?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {item.improvements?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Row 4: Detailed Customer Comment */}
              {item.comment && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-sans">
                  <p className="whitespace-pre-wrap">{item.comment}</p>
                </div>
              )}

              {/* Row 5: Optional Customer Details */}
              {(item.customerName || item.customerPhone) && (
                <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Guest: {item.customerName || 'Anonymous'}</span>
                  {item.customerPhone && <span>• {item.customerPhone}</span>}
                </div>
              )}
            </div>
          ))}

          {/* ── PAGINATION BAR ── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total
                responses)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-2.5 text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
