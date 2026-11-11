'use client';

import React, { useState, useEffect } from 'react';
import { fetchRestaurants, fetchCards, createCard, toggleCard, deleteCard } from '@/lib/api';
import NfcWriter from '@/components/NfcWriter';
import QrCodeViewer from '@/components/QrCodeViewer';
import {
  Sparkles,
  Store,
  Link2,
  Tag,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminGeneratorPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [cardLabel, setCardLabel] = useState('Billing Counter');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Active generated card to display
  const [generatedCard, setGeneratedCard] = useState(null);

  // Card inventory list
  const [cards, setCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Base URL for cards
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setOriginUrl(origin.replace(/\/+$/, ''));
    }
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [restRes, cardRes] = await Promise.all([fetchRestaurants(), fetchCards()]);
      if (restRes.success) {
        setRestaurants(restRes.data || []);
      }
      if (cardRes.success) {
        setCards(cardRes.data || []);
      }
    } catch (err) {
      console.error('[Admin] Error loading initial data:', err);
      toast.error('Failed to connect to Super Admin backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantChange = (e) => {
    const id = e.target.value;
    setSelectedRestaurantId(id);
    const found = restaurants.find((r) => r.id === id);
    if (found && found.googleReviewUrl) {
      setGoogleReviewUrl(found.googleReviewUrl);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) {
      toast.error('Please select a restaurant');
      return;
    }
    if (!googleReviewUrl.trim()) {
      toast.error('Please enter the restaurant Google Review URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCard({
        restaurantId: selectedRestaurantId,
        targetGoogleUrl: googleReviewUrl.trim(),
        label: cardLabel.trim() || 'Counter Card',
        customCode: customCode.trim() || undefined,
      });

      if (res.success) {
        setGeneratedCard(res.data);
        toast.success(`Smart NFC Card ${res.data.uniqueCode} created!`);
        // Refresh card inventory
        const updated = await fetchCards();
        if (updated.success) setCards(updated.data);
      } else {
        toast.error(res.message || 'Failed to create card');
      }
    } catch (err) {
      console.error('[Admin] Creation error:', err);
      toast.error(err.response?.data?.message || 'Error generating NFC card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCard = async (card) => {
    try {
      const res = await toggleCard(card.id, !card.isActive);
      if (res.success) {
        toast.success(`Card ${card.uniqueCode} switched ${!card.isActive ? 'ON' : 'OFF'}`);
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, isActive: !card.isActive } : c))
        );
        if (generatedCard && generatedCard.id === card.id) {
          setGeneratedCard((prev) => ({ ...prev, isActive: !card.isActive }));
        }
      }
    } catch (err) {
      toast.error('Failed to toggle card status');
    }
  };

  const handleDeleteCardConfirm = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCard(cardToDelete.id);
      if (res.success) {
        toast.success(`Card ${cardToDelete.uniqueCode} deleted successfully`, {
          icon: '🗑️',
        });
        setCards((prev) => prev.filter((c) => c.id !== cardToDelete.id));
        if (generatedCard && generatedCard.id === cardToDelete.id) {
          setGeneratedCard(null);
        }
        setCardToDelete(null);
      } else {
        toast.error(res.message || 'Failed to delete card');
      }
    } catch (err) {
      console.error('[Admin] Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);
  const cardUrl = generatedCard ? `${originUrl}/c/${generatedCard.uniqueCode}` : '';

  const filteredCards = cards.filter((c) => {
    const nameMatch = c.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const codeMatch = c.uniqueCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const labelMatch = c.label?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || codeMatch || labelMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="text-teal-400 font-semibold text-xs uppercase tracking-wider mb-1">
              SCANZAA SMART REVIEW SUITE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              NFC Review Card Generator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Generate dynamic review links, program NFC cards in-browser, and manage live redirection.
            </p>
          </div>

          <button
            onClick={loadInitialData}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center gap-2 py-2 px-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            Sync Super Admin Data
          </button>
        </header>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Generator Form (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Store className="w-5 h-5 text-teal-400" />
              1. Select Restaurant & Configure
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Restaurant Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Restaurant <span className="text-teal-400 font-normal">(Fetched from Super Admin)</span>
                </label>
                <select
                  value={selectedRestaurantId}
                  onChange={handleRestaurantChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="">-- Choose a Restaurant --</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.city ? `(${r.city})` : ''} — [{r.status}]
                    </option>
                  ))}
                </select>
                {selectedRestaurant && (
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Connected to Super Admin ID: <span className="font-mono text-slate-300">{selectedRestaurant.id}</span>
                  </p>
                )}
              </div>

              {/* Destination Google Review URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Destination Google Review URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://g.page/r/CbXxY.../review or Google maps review link"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-600 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  When customer taps the NFC card, our website forwards them to this link if active.
                </p>
              </div>

              {/* Card Label & Optional Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Card Label / Location
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={cardLabel}
                      onChange={(e) => setCardLabel(e.target.value)}
                      placeholder="e.g., Billing Counter, Table 1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Custom Code <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Auto-generated if blank (RC-XXXX)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3 text-slate-100 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Generating Smart NFC Card...' : 'Generate Smart NFC Card & QR Code'}
              </button>
            </form>
          </div>

          {/* Right Column: Generated Output & Idea 2 Tools (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {generatedCard ? (
              <div className="bg-slate-900/90 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                      Smart Card Ready
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">
                      {generatedCard.uniqueCode}
                    </h3>
                  </div>

                  {/* Quick ON / OFF indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <button
                      onClick={() => handleToggleCard(generatedCard)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        generatedCard.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {generatedCard.isActive ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}
                    </button>
                  </div>
                </div>

                {/* NFC Card URL Bar */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Card Tap Target URL:</span>
                    <a
                      href={cardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline flex items-center gap-1"
                    >
                      Test Tap <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="font-mono text-xs text-teal-300 break-all select-all font-semibold">
                    {cardUrl}
                  </p>
                </div>

                {/* Idea 2: Web-NFC Writer */}
                <NfcWriter url={cardUrl} code={generatedCard.uniqueCode} />

                {/* Idea 2: Auto QR Code Viewer */}
                <QrCodeViewer
                  url={cardUrl}
                  code={generatedCard.uniqueCode}
                  restaurantName={generatedCard.restaurant?.name || selectedRestaurant?.name}
                />
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[360px] text-slate-500">
                <Store className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-300 text-sm mb-1">No Card Selected</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Fill in the restaurant and Google Review URL on the left, then click Generate to unlock the in-browser NFC writer and print-ready QR code.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Card Management & Live Remote Switch */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                Live Card Remote Control
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch individual cards ON or OFF to control customer redirection in real-time.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurant or code..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Card Code & Label</th>
                  <th className="py-3 px-4">Redirect URL</th>
                  <th className="py-3 px-4 text-center">Taps</th>
                  <th className="py-3 px-4 text-center">Remote Switch</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredCards.length > 0 ? (
                  filteredCards.map((card) => {
                    const cUrl = `${originUrl}/c/${card.uniqueCode}`;
                    return (
                      <tr key={card.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {card.restaurant?.name || 'Unknown Restaurant'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-teal-300 font-bold border border-slate-800 mr-2">
                            {card.uniqueCode}
                          </span>
                          <span className="text-slate-400">{card.label}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                          {card.targetGoogleUrl}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">
                          {card.totalTaps}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCard(card)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              card.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {card.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-400" />
                                <span>ON</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-rose-400" />
                                <span>OFF</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setGeneratedCard(card)}
                            className="text-teal-400 hover:text-teal-300 font-medium hover:underline mr-3"
                          >
                            Open Tools
                          </button>
                          <a
                            href={cUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors inline-flex items-center mr-1"
                            title="Test Tap"
                          >
                            <ExternalLink className="w-3.5 h-3.5 inline" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setCardToDelete(card)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors inline-flex items-center ml-1"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 text-xs">
                      No NFC cards found. Generate your first card above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {cardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !isDeleting && setCardToDelete(null)}
            />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Delete NFC Review Card?
              </h3>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Are you sure you want to permanently delete card{' '}
                <span className="font-mono font-bold text-teal-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {cardToDelete.uniqueCode}
                </span>{' '}
                for{' '}
                <strong className="text-white">
                  {cardToDelete.restaurant?.name || 'this restaurant'}
                </strong>?
              </p>
              <p className="text-[11px] text-rose-400 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 mb-6 font-medium leading-relaxed">
                ⚠️ Anyone tapping this physical card or scanning its QR code will immediately be blocked and shown the offline screen.
              </p>
              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCardToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteCardConfirm}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Card'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
