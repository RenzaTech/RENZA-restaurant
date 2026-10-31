'use client';

import { useState, useEffect, useMemo } from 'react';

export default function SplashScreen({
  restaurant,
  onEnter,
  autoTransitionDelay = 2200,
  isStandalone = false,
}) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Dynamic status text based on progress
  const statusText = useMemo(() => {
    if (progress < 25) return 'INITIALIZING SCANNER...';
    if (progress < 55) return 'CONNECTING TO TABLE...';
    if (progress < 85) return 'SYNCING MENU & SPECIALS...';
    return 'READY TO DINE!';
  }, [progress]);

  // Instant enter on tap
  const handleInstantEnter = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onEnter) {
        onEnter();
      } else if (typeof window !== 'undefined') {
        const slug = restaurant?.slug || 'anbude-cafe';
        const rawT = (restaurant?.table?.label || restaurant?.table?.name || '').trim();
        const m = rawT.match(/(\d+)/);
        const tbl = m ? m[1] : '';
        window.location.href = tbl ? `/menu/${slug}?table=${tbl}` : `/menu/${slug}`;
      }
    }, 350);
  };

  // Smooth loading progress animation
  useEffect(() => {
    let fadeTimer = null;
    let navTimer = null;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / autoTransitionDelay) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsReady(true);
        fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
          navTimer = setTimeout(() => {
            if (onEnter) {
              onEnter();
            } else if (typeof window !== 'undefined') {
              const slug = restaurant?.slug || 'anbude-cafe';
              const rawT = (restaurant?.table?.label || restaurant?.table?.name || '').trim();
              const m = rawT.match(/(\d+)/);
              const tbl = m ? m[1] : '';
              window.location.href = tbl ? `/menu/${slug}?table=${tbl}` : `/menu/${slug}`;
            }
          }, 400);
        }, 250);
      }
    }, 20);

    return () => {
      clearInterval(interval);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (navTimer) clearTimeout(navTimer);
    };
  }, [autoTransitionDelay, onEnter, restaurant]);

  // Ambient floating particles configuration
  const particles = [
    { top: '14%', left: '12%', size: 5, color: '#FFB800', dur: '3.8s', delay: '0s' },
    { top: '22%', right: '14%', size: 4, color: '#00BFA5', dur: '4.4s', delay: '0.7s' },
    { top: '36%', left: '8%', size: 3, color: '#F59E0B', dur: '5.2s', delay: '1.2s' },
    { top: '60%', right: '10%', size: 4.5, color: '#FFB800', dur: '4s', delay: '0.4s' },
    { top: '72%', left: '15%', size: 3.5, color: '#00BFA5', dur: '4.6s', delay: '1.5s' },
    { top: '78%', right: '16%', size: 3, color: '#F59E0B', dur: '5s', delay: '0.3s' },
  ];

  return (
    <>
      <style>{`
        @keyframes scanLightBeam {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes rotateClockwise {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes rotateCounter {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes sonarRippleIvory {
          0% { transform: translate(-50%, -50%) scale(0.65); opacity: 0.8; }
          50% { opacity: 0.45; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes logoBreatheLight {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 10px 22px rgba(16, 27, 53, 0.08)) drop-shadow(0 0 25px rgba(255, 184, 0, 0.25)); }
          50% { transform: scale(1.035); filter: drop-shadow(0 14px 28px rgba(16, 27, 53, 0.12)) drop-shadow(0 0 35px rgba(255, 184, 0, 0.45)); }
        }
        @keyframes particleFloatWarm {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.35; }
          50% { transform: translateY(-14px) translateX(6px); opacity: 0.9; }
        }
        @keyframes shimmerSweepGold {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes cornerPulseGold {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.04); }
        }
      `}</style>

      <div
        onClick={handleInstantEnter}
        className={`relative h-full w-full max-w-[430px] mx-auto bg-[#FFFCF7] flex flex-col justify-between items-center text-[#101B35] font-sans overflow-hidden select-none transition-all duration-500 cursor-pointer ${
          isFadingOut ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
        }`}
        style={{
          maxWidth: '430px',
          backgroundColor: '#FFFCF7',
        }}
        title="Tap anywhere to enter"
      >
        {/* ── 1. Corner Viewfinder Tech Brackets (Gold & Amber Accent) ── */}
        <div className="absolute inset-0 pointer-events-none z-30 p-5">
          <div
            className="absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-[#F59E0B]/70"
            style={{ animation: 'cornerPulseGold 3s ease-in-out infinite' }}
          />
          <div
            className="absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-[#F59E0B]/70"
            style={{ animation: 'cornerPulseGold 3s ease-in-out infinite 0.75s' }}
          />
          <div
            className="absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-[#F59E0B]/70"
            style={{ animation: 'cornerPulseGold 3s ease-in-out infinite 1.5s' }}
          />
          <div
            className="absolute bottom-5 right-5 w-5 h-5 border-b-2 border-r-2 border-[#F59E0B]/70"
            style={{ animation: 'cornerPulseGold 3s ease-in-out infinite 2.25s' }}
          />
        </div>

        {/* ── 2. Light Scanning Beam (Soft Warm Gold & Teal Laser) ───── */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-20"
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.3) 20%, #FFB800 50%, rgba(0, 191, 165, 0.4) 80%, transparent 100%)',
            boxShadow: '0 0 14px 2px rgba(255, 184, 0, 0.65), 0 0 24px 4px rgba(0, 191, 165, 0.3)',
            animation: 'scanLightBeam 2.5s ease-in-out infinite',
          }}
        />

        {/* ── 3. Ambient Warm Background Glows ──────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-gradient-to-b from-[#FFB800]/16 via-[#FEF3C7]/25 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-[#00BFA5]/08 rounded-full blur-3xl" />
        </div>

        {/* ── 4. Floating Warm & Cyan Particles ───────────────────────── */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: p.top,
                left: p.left,
                right: p.right,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
                animation: `particleFloatWarm ${p.dur} ease-in-out infinite ${p.delay}`,
              }}
            />
          ))}
        </div>

        {/* ── 5. Top Status Header ──────────────────────────────────── */}
        <div className="relative z-30 pt-7 sm:pt-8 shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          <span className="text-[10px] tracking-[0.26em] font-extrabold uppercase text-[#92400E] font-mono">
            DIGITAL DINING EXPERIENCE
          </span>
        </div>

        {/* ── 6. Center Branding with Warm Concentric Rings ─────────── */}
        <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full px-6 py-2">
          {/* Outer Sonar Ripple Wave */}
          <div
            className="absolute rounded-full border border-[#F59E0B]/35 pointer-events-none"
            style={{
              width: '280px',
              height: '280px',
              top: '50%',
              left: '50%',
              animation: 'sonarRippleIvory 3s cubic-bezier(0.1, 0.7, 0.1, 1) infinite',
            }}
          />

          {/* Middle Dashed Warm Orbit Ring (Counter-Clockwise) */}
          <div
            className="absolute rounded-full border border-dashed border-[#F59E0B]/45 pointer-events-none"
            style={{
              width: '235px',
              height: '235px',
              top: '50%',
              left: '50%',
              animation: 'rotateCounter 22s linear infinite',
            }}
          />

          {/* Core Soft Ambient Halo */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '150px',
              height: '150px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255, 184, 0, 0.25) 0%, rgba(254, 243, 199, 0.15) 50%, transparent 75%)',
              filter: 'blur(14px)',
            }}
          />

          {/* SCANZAA Brand Asset (100% Crisp Light-Mode Transparent PNG) */}
          <div
            className="relative z-10 w-full max-w-[240px] sm:max-w-[260px] flex items-center justify-center"
            style={{ animation: 'logoBreatheLight 3.5s ease-in-out infinite' }}
          >
            <img
              src="/scanzaa-logo-light.png"
              alt="SCANZAA - SCAN DISCOVER DINE"
              className="w-full h-auto object-contain block drop-shadow-sm"
            />
          </div>
        </div>

        {/* ── 7. Bottom Progress Console & Botanical Wave ───────────── */}
        <div className="relative z-30 w-full flex flex-col items-center shrink-0">
          {/* Progress Container */}
          <div className="w-full max-w-[300px] px-6 flex flex-col items-center mb-3">
            {/* Dynamic Status Text */}
            <div className="flex items-center justify-between w-full mb-2 px-0.5">
              <span className="text-[10px] sm:text-[10.5px] font-mono tracking-widest text-[#92400E] font-bold">
                {statusText}
              </span>
              <span className="text-[11px] font-mono font-black text-[#78350F] tracking-wider">
                {progress}%
              </span>
            </div>

            {/* Warm Golden & Teal Progress Track */}
            <div className="relative w-full h-[7px] rounded-full overflow-hidden p-[1px] bg-[#EAE7DF] shadow-inner border border-[#F59E0B]/30">
              {/* Animated Progress Fill */}
              <div
                className="relative h-full rounded-full transition-all duration-100 ease-out overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #FFB800 0%, #F59E0B 50%, #00BFA5 100%)',
                  boxShadow: '0 0 10px rgba(255, 184, 0, 0.7)',
                }}
              >
                {/* Shimmer Light Sweeping Across Fill */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)',
                    animation: 'shimmerSweepGold 1.6s ease-in-out infinite',
                  }}
                />
              </div>
            </div>

            {/* Ambient Skip Hint */}
            <p className="mt-2 text-[9px] tracking-[0.24em] text-[#718096] font-mono uppercase font-semibold">
              {isReady ? '✦ OPENING MENU ✦' : 'TAP SCREEN TO ENTER'}
            </p>
          </div>

          {/* Bottom Botanical Leaves & Warm Golden Wave (Seamless Dining Hub Seam) */}
          <div className="relative w-full select-none pointer-events-none -mb-1 overflow-hidden">
            <img
              src="/categories/bottom-waves-leaves.png"
              alt="Decorative leaves and golden waves"
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>
      </div>
    </>
  );
}
