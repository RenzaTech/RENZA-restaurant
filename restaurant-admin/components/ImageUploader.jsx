'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Camera, ImageIcon, Loader2, RefreshCw, UploadCloud, UtensilsCrossed, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.82;

function validateFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPEG, JPG, PNG, or WebP image.';
  if (file.size > MAX_FILE_SIZE) return 'Image must be 5MB or smaller.';
  return '';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error('The selected image could not be read.'));
    };
    image.src = sourceUrl;
  });
}

async function prepareFile(file) {
  const image = await loadImage(file);
  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  if (longEdge <= MAX_IMAGE_EDGE) return file;

  const scale = MAX_IMAGE_EDGE / longEdge;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new Error('The image could not be optimized.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

function PhotoFrame({ src, alt, className, onLoad, onError }) {
  return <div className={cn('relative overflow-hidden bg-slate-100', className)}><Image src={src} alt={alt} fill sizes="(min-width: 640px) 280px, 100vw" unoptimized={src.startsWith('blob:')} className="object-cover" onLoad={onLoad} onError={onError} /></div>;
}

export default function ImageUploader({ dishName = 'Dish name', initialImageUrl = null, uploadProgress = 0, onFileChange, onValidationChange }) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [isExistingLoading, setIsExistingLoading] = useState(Boolean(initialImageUrl));
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const showError = (message) => {
    setError(message);
    onValidationChange?.(Boolean(message));
  };

  const acceptFile = async (file) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      showError(validationError);
      return;
    }

    setError('');
    onValidationChange?.(false);
    setIsProcessing(true);
    try {
      const preparedFile = await prepareFile(file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const nextPreviewUrl = URL.createObjectURL(preparedFile);
      objectUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      setIsExistingLoading(false);
      onFileChange(preparedFile);
    } catch (processingError) {
      showError(processingError.message || 'The image could not be processed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (event) => {
    acceptFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const handlePaste = (event) => {
    const pastedFile = Array.from(event.clipboardData.files || []).find((file) => file.type.startsWith('image/'));
    if (pastedFile) acceptFile(pastedFile);
  };

  const handleRemove = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreviewUrl(null);
    setIsExistingLoading(false);
    setError('');
    onValidationChange?.(false);
    onFileChange(null);
  };

  const hasPreview = Boolean(previewUrl);
  const previewAlt = `${dishName} preview`;

  return (
    <div className="space-y-3" onPaste={handlePaste}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn('relative min-h-44 cursor-pointer rounded-xl border-2 border-dashed transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:min-h-52 sm:rounded-2xl', isDragging ? 'border-orange-500 bg-orange-50' : hasPreview ? 'border-slate-200 bg-white' : 'border-slate-300 bg-slate-50/50 hover:border-orange-300 hover:bg-orange-50/50')}
        aria-label={hasPreview ? 'Replace dish photo' : 'Upload dish photo'}
      >
        {hasPreview ? (
          <>
            {isExistingLoading && <div className="skeleton absolute inset-0 z-10" />}
            <PhotoFrame src={previewUrl} alt={previewAlt} className="absolute inset-0 h-full w-full" onLoad={() => setIsExistingLoading(false)} onError={() => { setIsExistingLoading(false); showError('This existing image could not be loaded.'); }} />
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 opacity-0 transition-opacity hover:opacity-100"><span className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 shadow-lg"><Camera className="h-4 w-4" />Replace photo</span></div>
          </>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center px-4 text-center sm:min-h-52"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100/80 text-orange-600"><UploadCloud className="h-7 w-7" /></div><p className="text-xs font-bold text-slate-700">Drop, paste, or browse a dish photo</p><p className="mt-1 text-[10px] text-slate-400">JPEG, JPG, PNG, or WebP · max 5MB</p></div>
        )}
        {isProcessing && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-sm"><span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow"><Loader2 className="h-4 w-4 animate-spin" />Preparing photo...</span></div>}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={handleInputChange} />

      {hasPreview && <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"><RefreshCw className="h-3.5 w-3.5" />Replace</button><button type="button" onClick={handleRemove} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500"><X className="h-3.5 w-3.5" />Remove</button></div>}
      {error && <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600" role="alert"><ImageIcon className="h-3.5 w-3.5" />{error}</p>}
      {uploadProgress > 0 && <div className="space-y-1.5" aria-live="polite"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>Uploading image</span><span>{uploadProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500 transition-[width]" style={{ width: `${uploadProgress}%` }} /></div></div>}

      {hasPreview && <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">How customers will see it</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative aspect-[4/3]"><PhotoFrame src={previewUrl} alt={`${dishName} customer menu card`} className="absolute inset-0 h-full w-full" /><span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold text-white">₹249.00</span></div><div className="p-3"><p className="truncate text-xs font-bold text-slate-900">{dishName || 'Dish name'}</p><div className="mt-2 h-2 w-16 rounded-full bg-slate-200" /></div></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative aspect-[4/3]"><PhotoFrame src={previewUrl} alt={`${dishName} dish sheet hero`} className="absolute inset-0 h-full w-full" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8"><p className="font-serif text-sm font-bold text-white">{dishName || 'Dish name'}</p></div></div><div className="h-8 bg-white" /></div></div></div>}
    </div>
  );
}
