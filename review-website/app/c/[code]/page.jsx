import { redirect } from 'next/navigation';
import { AlertCircle, Store } from 'lucide-react';

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

/**
 * High-Speed Server Component for NFC Tap / QR Code Redirection
 */
export default async function CardRedirectPage({ params }) {
  const { code } = params;

  if (!code) {
    return <InvalidCardView message="No card code provided." />;
  }

  let cardData = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/nfc/cards/lookup/${encodeURIComponent(code)}`, {
      cache: 'no-store', // Always fetch fresh live status
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        cardData = json.data;
      }
    }
  } catch (err) {
    console.error('[Redirect] Backend fetch error:', err.message);
  }

  // 1. If card doesn't exist
  if (!cardData) {
    return (
      <InvalidCardView
        code={code}
        message="This NFC card or QR code has not been registered or activated yet."
      />
    );
  }

  // 2. If card is ON and active -> Instant 302 Redirect to Google Review!
  if (cardData.isActive && cardData.targetGoogleUrl) {
    redirect(cardData.targetGoogleUrl);
  }

  // 3. If card is OFF (unpaid or disabled in Super Admin) -> Redirect to Inactive Fallback
  const restaurantName = cardData.restaurant?.name || '';
  redirect(`/inactive?r=${encodeURIComponent(restaurantName)}`);
}

function InvalidCardView({ code, message }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Card Not Found</h1>
        {code && (
          <span className="inline-block font-mono text-xs font-bold bg-slate-950 px-3 py-1 rounded-full text-slate-400 border border-slate-800 mb-4">
            Code: {code}
          </span>
        )}

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          {message}
        </p>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Store className="w-3.5 h-3.5" />
          Powered by Scanzaa Smart Cards
        </div>
      </div>
    </div>
  );
}
