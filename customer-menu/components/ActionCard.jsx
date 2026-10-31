'use client';

import { ChevronRight } from 'lucide-react';

export default function ActionCard({
  icon: Icon,
  variant = 'yellow', // 'yellow' | 'blue' | 'green'
  title,
  subtitle,
  badgeText,
  illustration,
  onClick,
  href,
}) {
  const variantStyles = {
    yellow: {
      card: 'border-[1.8px] border-[#FFB800] bg-white sm:bg-[#FFFCF7] shadow-[0_4px_18px_rgba(255,184,0,0.12)] hover:shadow-[0_8px_26px_rgba(255,184,0,0.22)] hover:border-[#E5A500]',
      iconBox: 'bg-[#FEF3C7] border border-[#FDE68A] text-[#8B4513]',
      badge: 'bg-[#DCFCE7] text-[#15803D] border border-emerald-300',
      chevron: 'bg-[#FFB800] text-white',
    },
    blue: {
      card: 'border-[1.8px] border-[#D0E2FF] bg-[#F3F7FF] shadow-[0_4px_18px_rgba(40,120,255,0.08)] hover:shadow-[0_8px_26px_rgba(40,120,255,0.18)] hover:border-[#93C5FD]',
      iconBox: 'bg-[#DBEAFE] border border-blue-200 text-[#2878FF]',
      badge: 'bg-blue-100 text-blue-800 border border-blue-300',
      chevron: 'bg-[#DBEAFE] text-[#2878FF]',
    },
    green: {
      card: 'border-[1.8px] border-[#B7F0D0] bg-[#F0FFF6] shadow-[0_4px_18px_rgba(22,184,106,0.08)] hover:shadow-[0_8px_26px_rgba(22,184,106,0.18)] hover:border-[#86EFAC]',
      iconBox: 'bg-[#DCFCE7] border border-emerald-200 text-[#16B86A]',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      chevron: 'bg-[#DCFCE7] text-[#16B86A]',
    },
  };

  const style = variantStyles[variant] || variantStyles.yellow;

  const content = (
    <div
      className={`group relative flex items-center justify-between p-2.5 min-[360px]:p-3 sm:p-3.5 rounded-[22px] min-[360px]:rounded-[24px] transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden ${style.card}`}
    >
      {/* Left: Icon & Text Details */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 pr-1 z-10">
        {/* Rounded square container for icon */}
        <div
          className={`w-10 h-10 min-[360px]:w-11 min-[360px]:h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${style.iconBox}`}
        >
          {Icon && <Icon className="w-5 h-5 stroke-[2.2]" />}
        </div>

        {/* Text Details */}
        <div className="flex flex-col text-left min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[14px] min-[360px]:text-[15px] sm:text-[16px] font-extrabold text-[#101B35] font-ancizar tracking-tight leading-tight"
              style={{ fontFamily: "'UNAL Ancizar Serif', 'Ancizar Serif', Georgia, serif" }}
            >
              {title}
            </span>
            {badgeText && (
              <span
                className={`px-1.5 py-0.2 text-[8px] min-[360px]:text-[8.5px] font-black rounded-full border uppercase tracking-wider shrink-0 ${style.badge}`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10.5px] min-[360px]:text-[11px] text-[#718096] font-medium font-sans mt-0.5 line-clamp-1 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right: Circular Action Arrow & Decorative Right Illustration */}
      <div className="flex items-center gap-1.5 min-[360px]:gap-2 shrink-0 z-10">
        {/* Circular Action Arrow Button */}
        <div
          className={`w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold shadow-xs transition-transform duration-200 group-hover:scale-110 shrink-0 ${style.chevron}`}
        >
          <ChevronRight className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 stroke-[3]" />
        </div>

        {/* Illustration: Food Bowl, Notepad, or Google Maps Pin */}
        {illustration && (
          <div
            className="w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 shrink-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
            style={{ width: '46px', height: '46px', minWidth: '46px', maxWidth: '46px' }}
          >
            {typeof illustration === 'string' ? (
              <img
                src={illustration}
                alt={title}
                className="w-full h-full object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              illustration
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : '_self'}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] rounded-[24px]"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] rounded-[24px]"
    >
      {content}
    </button>
  );
}
