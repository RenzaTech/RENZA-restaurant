'use client';

import { useState } from 'react';
import Link from 'next/link';
import SplashScreen from '../../components/SplashScreen';

export default function SplashPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashDuration, setSplashDuration] = useState(2300);

  const triggerReplay = (duration) => {
    setSplashDuration(duration);
    setShowSplash(false);
    setTimeout(() => {
      setShowSplash(true);
    }, 50);
  };

  return (
    <main className="relative min-h-screen bg-[#040608] text-[#f6f2eb] flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background Lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(14, 208, 186, 0.09) 0%, rgba(212, 177, 93, 0.04) 45%, #040608 90%)',
        }}
      />

      {showSplash && (
        <SplashScreen
          key={splashDuration}
          isStatic={false}
          isLoading={false}
          minDuration={splashDuration}
          restaurant={{ name: "Anbu'de Cafe" }}
          onFinish={() => setShowSplash(false)}
          showSkip={true}
        />
      )}

      {/* Standalone Splash Page Preview (Visible after splash completes) */}
      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center space-y-6">
        {/* SCANZAA Logo without black background */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-6 rounded-full bg-[#0ed0ba]/15 blur-2xl opacity-60 pointer-events-none" />
          <img
            src="/scanzaa-logo.png"
            alt="SCANZAA Logo"
            className="w-64 sm:w-80 h-auto object-contain drop-shadow-[0_10px_35px_rgba(14,208,186,0.25)]"
          />
        </div>

        {/* Restaurant Name Revealed */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-sans tracking-[0.28em] uppercase text-[#0ed0ba] font-semibold">
            Ready to Dine
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#f6f2eb] font-semibold tracking-wide">
            Anbu&apos;de Cafe
          </h1>
          <p className="text-xs text-white/50 tracking-wider">
            Powered by RENZA • Scan Discover Dine
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full pt-1">
          <Link
            href="/"
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#0ed0ba] to-[#00bfa5] text-slate-950 font-bold text-xs tracking-widest uppercase hover:brightness-110 transition shadow-[0_0_25px_rgba(14,208,186,0.3)] text-center"
          >
            Open Menu Portal →
          </Link>

          {/* Quick Timing Comparison Buttons */}
          <div className="pt-2">
            <span className="text-[10.5px] uppercase tracking-widest text-white/40 block mb-2 font-medium">
              Test Splash Timings
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => triggerReplay(2000)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold tracking-wider transition ${
                  splashDuration === 2000
                    ? 'border-[#0ed0ba] bg-[#0ed0ba]/15 text-[#0ed0ba]'
                    : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                2.0 sec
              </button>
              <button
                type="button"
                onClick={() => triggerReplay(2300)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold tracking-wider transition ${
                  splashDuration === 2300
                    ? 'border-[#0ed0ba] bg-[#0ed0ba]/15 text-[#0ed0ba]'
                    : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                2.3 sec
              </button>
              <button
                type="button"
                onClick={() => triggerReplay(2800)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold tracking-wider transition ${
                  splashDuration === 2800
                    ? 'border-[#0ed0ba] bg-[#0ed0ba]/15 text-[#0ed0ba]'
                    : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                2.8 sec
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
