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

export default function ImageUploader({
  dishName = 'Dish name',
  initialImageUrl = null,
  uploadProgress = 0,
  onFileChange,
  onPreviewChange,
  onValidationChange,
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [isExistingLoading, setIsExistingLoading] = useState(Boolean(initialImageUrl));
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onPreviewChange?.(initialImageUrl || null);
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [initialImageUrl, onPreviewChange]);

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
      onPreviewChange?.(nextPreviewUrl);
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
    onPreviewChange?.(null);
  };

  const hasPreview = Boolean(previewUrl);
  const previewAlt = `${dishName} preview`;

  return (
    <div className="space-y-3" onPaste={handlePaste}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 select-none group',
          isDragging
            ? 'border-orange-500 bg-orange-50/80 ring-4 ring-orange-500/20'
            : hasPreview
            ? 'border-slate-200/90 bg-slate-900 shadow-sm'
            : 'border-dashed border-slate-300 bg-slate-50/60 hover:border-orange-400 hover:bg-orange-50/30'
        )}
        aria-label={hasPreview ? 'Replace dish photo' : 'Upload dish photo'}
      >
        {hasPreview ? (
          <>
            {isExistingLoading && <div className="skeleton absolute inset-0 z-10" />}
            <PhotoFrame
              src={previewUrl}
              alt={previewAlt}
              className="absolute inset-0 h-full w-full"
              onLoad={() => setIsExistingLoading(false)}
              onError={() => {
                setIsExistingLoading(false);
                showError('This existing image could not be loaded.');
              }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-md">
                <Camera className="h-3.5 w-3.5 text-orange-600" />
                Click to Change Photo
              </span>
              <span className="mt-1.5 text-[10px] font-medium text-white/90">
                or drag & drop a new photo
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-100/90 text-orange-600 ring-4 ring-orange-50 transition-transform duration-200 group-hover:scale-105">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Upload dish photography
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Drag & drop, paste, or click to browse
            </p>
            <span className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
              JPEG, PNG, WebP · max 5MB
            </span>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-md">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              Optimizing photo...
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Action buttons under photo */}
      {hasPreview && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            Replace Photo
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600" role="alert">
          <ImageIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {uploadProgress > 0 && (
        <div className="space-y-1.5" aria-live="polite">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>Uploading photo</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-teal-500 transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
