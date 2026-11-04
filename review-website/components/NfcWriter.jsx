'use client';

import React, { useState, useEffect } from 'react';
import { Radio, CheckCircle, AlertTriangle, Smartphone, Loader2 } from 'lucide-react';

export default function NfcWriter({ url, code }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleWriteNfc = async () => {
    if (!url) return;
    setErrorMessage(null);
    setWriteSuccess(false);
    setIsWriting(true);

    try {
      const ndef = new window.NDEFReader();
      // Prompt user permission and start scan
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: url,
          },
        ],
      });

      setWriteSuccess(true);
      setIsWriting(false);
    } catch (err) {
      console.error('[Web-NFC] Error writing card:', err);
      if (err.name === 'NotAllowedError') {
        setErrorMessage('NFC permission was denied.');
      } else if (err.name === 'NotSupportedError') {
        setErrorMessage('NFC is not supported or turned off on this device.');
      } else {
        setErrorMessage(err.message || 'Failed to write NFC tag. Ensure card is close to the phone.');
      }
      setIsWriting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-700/60 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Radio className="w-5 h-5 text-teal-400 animate-pulse" />
        <h4 className="font-semibold text-base text-slate-100">
          Direct Web-NFC Writer
        </h4>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
          In-Browser
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Write this smart redirect URL directly onto a physical NFC card chip without third-party apps.
      </p>

      {isSupported ? (
        <div className="space-y-3">
          {writeSuccess ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="font-medium">NFC Card Written Successfully!</p>
                <p className="text-xs text-emerald-400/80">Code: {code} is now programmed into the chip.</p>
              </div>
            </div>
          ) : isWriting ? (
            <div className="flex items-center gap-3 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-sm">
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin text-amber-400" />
              <div>
                <p className="font-medium animate-pulse">Ready to Write!</p>
                <p className="text-xs text-amber-300/80">Hold your blank NFC card/sticker firmly to the back of this phone...</p>
              </div>
            </div>
          ) : null}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleWriteNfc}
            disabled={isWriting}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isWriting
                ? 'bg-amber-600/80 text-white cursor-wait'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold active:scale-[0.98]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            {isWriting ? 'Touch Card to Phone Now...' : 'Tap to Write NFC Card'}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Smartphone className="w-4 h-4" />
            <span>Web NFC requires Chrome on Android</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Direct browser writing is available when opening this generator on an Android phone with NFC enabled.
            On desktop or iPhone, copy the card URL below and write it using any free NFC app (like <em>NFC Tools</em>).
          </p>
        </div>
      )}
    </div>
  );
}
