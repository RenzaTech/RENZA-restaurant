'use client';

import { Heart } from 'lucide-react';

const SCANZAA_INSTAGRAM_URL =
  'https://www.instagram.com/scanzaa_india?exln=MTRjeXZ0djR5bHZzbw==';
const SCANZAA_LINKEDIN_URL =
  'https://www.linkedin.com/in/renza-undefined-2252b643b/';
const SCANZAA_WHATSAPP_URL =
  'https://wa.me/918925789321';

function formatWhatsappUrl(val) {
  if (!val) return SCANZAA_WHATSAPP_URL;
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  const digits = val.replace(/\D/g, '');
  const clean = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${clean}`;
}

export default function PortalFooter({ restaurant }) {
  const instagramUrl =
    restaurant?.scanzaaInstagramUrl ||
    SCANZAA_INSTAGRAM_URL;
  const linkedinUrl =
    restaurant?.scanzaaLinkedinUrl ||
    SCANZAA_LINKEDIN_URL;
  const whatsappUrl = formatWhatsappUrl(
    restaurant?.scanzaaWhatsappUrl ||
    restaurant?.whatsapp ||
    restaurant?.whatsappNumber
  );

  return (
    <footer className="relative w-full pt-6 pb-0 flex flex-col items-center justify-center text-center overflow-hidden bg-[#FFFCF7]">
      {/* Centered Social Row with Thin Horizontal Dividers on Either Side */}
      <div className="flex items-center justify-center w-full max-w-[340px] gap-2.5 min-[360px]:gap-3 mb-3.5 z-10 px-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8EAF0] to-[#E8EAF0]" />

        {/* Social Icons Cluster: Instagram, LinkedIn, WhatsApp */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* 1. Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#E8EAF0] shadow-2xs flex items-center justify-center hover:scale-105 hover:shadow-md hover:border-pink-200 transition-all active:scale-95 shrink-0"
            aria-label="Visit Scanzaa on Instagram"
            title="Instagram"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="scanzaa-ig" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fdf497" />
                  <stop offset="5%" stopColor="#fdf497" />
                  <stop offset="45%" stopColor="#fd5949" />
                  <stop offset="60%" stopColor="#d6249f" />
                  <stop offset="90%" stopColor="#285AEB" />
                </linearGradient>
              </defs>
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="url(#scanzaa-ig)" strokeWidth="2" />
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="url(#scanzaa-ig)" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="url(#scanzaa-ig)" />
            </svg>
          </a>

          {/* 2. LinkedIn */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#E8EAF0] shadow-2xs flex items-center justify-center hover:scale-105 hover:shadow-md hover:border-blue-200 transition-all active:scale-95 shrink-0"
            aria-label="Visit Scanzaa on LinkedIn"
            title="LinkedIn"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-[#0A66C2] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74v-8.37H5.06v8.37z" />
            </svg>
          </a>

          {/* 3. WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#E8EAF0] shadow-2xs flex items-center justify-center hover:scale-105 hover:shadow-md hover:border-emerald-200 transition-all active:scale-95 shrink-0"
            aria-label="Contact Scanzaa on WhatsApp"
            title="WhatsApp"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-[#25D366] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.06 7.42C8.89 7.42 8.62 7.49 8.38 7.75C8.15 8.01 7.5 8.62 7.5 9.87C7.5 11.12 8.41 12.33 8.54 12.5C8.67 12.67 10.33 15.22 12.87 16.32C13.47 16.58 13.94 16.74 14.31 16.86C14.92 17.05 15.47 17.03 15.91 16.96C16.4 16.89 17.43 16.34 17.65 15.72C17.86 15.1 17.86 14.56 17.8 14.46C17.74 14.35 17.58 14.29 17.33 14.17C17.09 14.05 15.89 13.46 15.66 13.38C15.44 13.29 15.28 13.25 15.11 13.5C14.95 13.75 14.48 14.29 14.34 14.46C14.2 14.62 14.06 14.64 13.82 14.52C13.57 14.4 12.53 14.06 11.3 12.96C10.34 12.11 9.7 11.06 9.5 10.73C9.31 10.4 9.48 10.22 9.6 10.1C9.71 9.99 9.85 9.81 9.97 9.66C10.1 9.52 10.14 9.42 10.22 9.25C10.31 9.09 10.26 8.94 10.2 8.82C10.14 8.7 9.68 7.57 9.49 7.1C9.3 6.65 9.11 6.71 8.97 6.71C8.84 6.7 8.68 6.7 8.51 6.7" />
            </svg>
          </a>
        </div>

        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E8EAF0] to-[#E8EAF0]" />
      </div>

      {/* Small Heart Icon & Powered by SCANZAA */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-[#718096] font-sans tracking-wide hover:text-[#101B35] transition-colors z-10"
      >
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>
          Powered by <strong className="font-extrabold text-[#101B35]">SCANZAA</strong>
        </span>
      </a>

      {/* Tagline: SCAN · DISCOVER · DINE */}
      <p className="text-[10px] text-[#718096]/80 font-bold uppercase tracking-[0.24em] font-sans mt-1.5 mb-2 z-10">
        SCAN · DISCOVER · DINE
      </p>

      {/* Bottom Botanical Leaves & Warm Golden Wave */}
      <div className="relative w-full select-none pointer-events-none mt-1 -mb-1 overflow-hidden">
        <img
          src="/categories/bottom-waves-leaves.png"
          alt="Decorative leaves and golden waves"
          className="w-full h-auto object-cover block"
        />
      </div>
    </footer>
  );
}
