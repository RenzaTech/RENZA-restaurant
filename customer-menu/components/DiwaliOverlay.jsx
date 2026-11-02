'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Hanging Lamps Coordinates & Chain Configurations
 * Positioned on the left and right margins of the mobile screen.
 */
const HANGING_LAMPS = [
  { xPercent: 0.045, chainLength: 85, phase: 0 },
  { xPercent: 0.075, chainLength: 175, phase: 1.2 },
  { xPercent: 0.045, chainLength: 265, phase: 2.4 },
  { xPercent: 0.075, chainLength: 355, phase: 3.6 },

  { xPercent: 0.955, chainLength: 95, phase: 0.6 },
  { xPercent: 0.925, chainLength: 185, phase: 1.8 },
  { xPercent: 0.955, chainLength: 275, phase: 3.0 },
  { xPercent: 0.925, chainLength: 365, phase: 4.2 },
];

export default function DiwaliOverlay({ active = true, durationSeconds = 5, forcePlay = false }) {
  const canvasRef = useRef(null);
  const flashRef = useRef(null);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [greetingOpacity, setGreetingOpacity] = useState(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let animStartTime = null;
    let rockets = [];
    let particles = [];
    let flashTimeout = null;
    let textShowTimeout = null;
    let textHideTimeout = null;

    // Check session storage to avoid annoying repeated bursts on every tab switch
    const hasSeenDiwali = typeof window !== 'undefined' ? sessionStorage.getItem('renza_diwali_seen') : null;
    const shouldPlayBursts = forcePlay || !hasSeenDiwali;

    if (shouldPlayBursts && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('renza_diwali_seen', 'true');
      } catch (_) {}
    }

    const triggerFlash = (intensity = 0.35) => {
      if (!flashRef.current) return;
      flashRef.current.style.opacity = intensity;
      if (flashTimeout) clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => {
        if (flashRef.current) flashRef.current.style.opacity = '0';
      }, 70);
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- ROCKET CLASS ---
    class RealisticSlowRocket {
      constructor(startX, targetX, targetY, delayMs) {
        this.x = startX;
        this.y = (canvas.getBoundingClientRect().height || 800) + 10;
        this.targetX = targetX;
        this.targetY = targetY;
        this.delay = delayMs;
        this.exploded = false;
        this.trail = [];
        this.speed = 6.4;
      }

      update(elapsed) {
        if (elapsed < this.delay || this.exploded) return;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10 || this.y <= this.targetY) {
          this.explode();
          this.exploded = true;
          return;
        }

        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 12) this.trail.shift();
      }

      draw() {
        if (this.exploded) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const a = (i / this.trail.length) * 0.7;
          ctx.strokeStyle = `rgba(251, 191, 36, ${a})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      explode() {
        triggerFlash(0.28);
        for (let i = 0; i < 110; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.1 + Math.random() * 3.4;
          particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            drag: 0.978,
            gravity: 0.038,
            alpha: 1,
            decay: 0.007 + Math.random() * 0.005,
            size: 2.2,
            trailLength: 8,
            color: Math.random() > 0.35 ? '#fbbf24' : '#f97316',
            type: 'willowSpark',
            history: [],
            twinkle: true,
          });
        }
      }
    }

    // --- DRAW HANGING LAMPS (FIXED ALONG VIEWPORT SIDES) ---
    const drawPermanentSideLamps = (elapsed, w) => {
      HANGING_LAMPS.forEach((lamp) => {
        const originX = w * lamp.xPercent;
        const originY = 0;

        const swayAngle = Math.sin(elapsed * 0.002 + lamp.phase) * 0.035;
        const targetX = originX + Math.sin(swayAngle) * lamp.chainLength;
        const targetY = originY + Math.cos(swayAngle) * lamp.chainLength;

        ctx.save();

        // 1. Golden Beaded Chain
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        const numBeads = Math.floor(lamp.chainLength / 14);
        for (let b = 1; b < numBeads; b++) {
          const t = b / numBeads;
          const bx = originX + (targetX - originX) * t;
          const by = originY + (targetY - originY) * t;
          ctx.beginPath();
          ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Hanging Brass Diya Bowl
        ctx.translate(targetX, targetY);
        ctx.rotate(swayAngle);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.lineTo(-12, 14);
        ctx.moveTo(0, 3);
        ctx.lineTo(12, 14);
        ctx.moveTo(0, 3);
        ctx.lineTo(0, 14);
        ctx.stroke();

        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.ellipse(0, 16, 14, 7, 0, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, 16, 12, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Teardrop Flame with Warm Ambient Glow
        const flicker = Math.sin(elapsed * 0.018 + lamp.phase * 3) * 1.5;
        const flameHeight = 16 + flicker;

        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(0, 14 - flameHeight * 0.4, 2, 0, 14 - flameHeight * 0.4, 24);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 14 - flameHeight * 0.4, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-4, 15);
        ctx.bezierCurveTo(-7, 15 - flameHeight * 0.4, 0, 15 - flameHeight, 0, 15 - flameHeight);
        ctx.bezierCurveTo(0, 15 - flameHeight, 7, 15 - flameHeight * 0.4, 4, 15);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-1.8, 15);
        ctx.bezierCurveTo(-3, 15 - flameHeight * 0.3, 0, 15 - flameHeight * 0.65, 0, 15 - flameHeight * 0.65);
        ctx.bezierCurveTo(0, 15 - flameHeight * 0.65, 3, 15 - flameHeight * 0.3, 1.8, 15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    };

    // --- CELEBRATION INITIALIZATION ---
    if (shouldPlayBursts) {
      const w = canvas.getBoundingClientRect().width || 430;
      const h = canvas.getBoundingClientRect().height || 800;

      // Launch 3 staggered slow rockets
      rockets.push(new RealisticSlowRocket(w * 0.3, w * 0.32, h * 0.22, 100));
      rockets.push(new RealisticSlowRocket(w * 0.7, w * 0.68, h * 0.26, 500));
      rockets.push(new RealisticSlowRocket(w * 0.5, w * 0.5, h * 0.17, 950));

      // Show "Happy Diwali" golden text right when crackers burst (~1.3s)
      textShowTimeout = setTimeout(() => {
        setGreetingVisible(true);
        setGreetingOpacity(1);

        // Disappear strictly after 1.8 seconds (between 1 and 2 seconds as requested)
        textHideTimeout = setTimeout(() => {
          setGreetingOpacity(0);
          setTimeout(() => setGreetingVisible(false), 600);
        }, 1800);
      }, 1300);
    }

    // --- RENDER LOOP ---
    const renderLoop = (timestamp) => {
      if (!animStartTime) animStartTime = timestamp;
      const elapsed = timestamp - animStartTime;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Permanent Side Hanging Lamps
      drawPermanentSideLamps(timestamp, w);

      // 2. Draw Rockets (if active)
      for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].update(elapsed);
        rockets[i].draw();
        if (rockets[i].exploded) rockets.splice(i, 1);
      }

      // 3. Draw Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'willowSpark') {
          p.history.push({ x: p.x, y: p.y });
          if (p.history.length > p.trailLength) p.history.shift();
        }
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        let a = p.alpha;
        if (p.twinkle && Math.random() > 0.45) a *= 0.35;
        ctx.globalAlpha = Math.max(0, a);
        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';

        if (p.type === 'willowSpark') {
          if (p.history.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let j = 1; j < p.history.length; j++) ctx.lineTo(p.history[j].x, p.history[j].y);
            ctx.stroke();
          }
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      if (flashTimeout) clearTimeout(flashTimeout);
      if (textShowTimeout) clearTimeout(textShowTimeout);
      if (textHideTimeout) clearTimeout(textHideTimeout);
    };
  }, [active, durationSeconds, forcePlay]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 max-w-[430px] mx-auto pointer-events-none z-50 overflow-hidden select-none"
    >
      {/* Google Font for Royal Festive Calligraphy */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Playfair+Display:ital,wght@1,700;1,900&display=swap');
      `}</style>

      {/* Sky Flash Layer */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white pointer-events-none z-10 opacity-0 transition-opacity duration-100"
      />

      {/* Canvas for Hanging Lamps & Fireworks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Pure Floating 'Happy Diwali' Typography (Placed neatly with Cinzel Decorative) */}
      {greetingVisible && (
        <div
          style={{
            opacity: greetingOpacity,
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: greetingOpacity === 1 ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-8px)',
          }}
          className="absolute top-32 left-0 right-0 z-30 flex items-center justify-center text-center pointer-events-none px-6"
        >
          <h2
            style={{
              fontFamily: "'Cinzel Decorative', 'Playfair Display', Georgia, serif",
              textShadow: '0 0 25px rgba(251, 191, 36, 0.9), 0 3px 10px rgba(0, 0, 0, 0.85)',
            }}
            className="text-3xl sm:text-[34px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF0] via-[#FDE047] to-[#EAB308] select-none"
          >
            Happy Diwali
          </h2>
        </div>
      )}
    </div>
  );
}
