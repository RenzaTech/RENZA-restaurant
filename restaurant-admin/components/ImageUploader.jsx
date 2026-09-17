'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Camera, ImageIcon, Loader2, RefreshCw, UploadCloud, UtensilsCrossed, X, FolderOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.85;

function validateFile(file) {
  if (!file) return 'No file selected.';
  if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return 'Use a JPEG, JPG, PNG, or WebP image.';
  }
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
  if (longEdge <= MAX_IMAGE_EDGE && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return file;
  }

  const scale = Math.min(1, MAX_IMAGE_EDGE / longEdge);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new Error('The image could not be optimized.');
  const cleanName = (file.name || 'dish_photo').replace(/\.[^.]+$/, '');
  return new File([blob], `${cleanName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

function PhotoFrame({ src, alt, className, onLoad, onError }) {
  return (
    <div className={cn('relative overflow-hidden bg-slate-900', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 640px) 380px, 100vw"
        unoptimized={src.startsWith('blob:')}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}

export default function ImageUploader({
  title = 'Dish Photo',
  badge = 'Angle',
  description = 'Upload dish photography',
  dishName = 'Dish name',
  initialImageUrl = null,
  uploadProgress = 0,
  onFileChange,
  onPreviewChange,
  onValidationChange,
  onRemove,
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [isExistingLoading, setIsExistingLoading] = useState(Boolean(initialImageUrl));
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
    setIsExistingLoading(Boolean(initialImageUrl));
    onPreviewChange?.(initialImageUrl || null);
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
      onFileChange?.(preparedFile);
      onPreviewChange?.(nextPreviewUrl);
    } catch (processingError) {
      showError(processingError.message || 'The image could not be processed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) acceptFile(file);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handlePaste = (event) => {
    const pastedFile = Array.from(event.clipboardData.files || []).find((file) =>
      file.type.startsWith('image/')
    );
    if (pastedFile) acceptFile(pastedFile);
  };

  const handleRemoveClick = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreviewUrl(null);
    setIsExistingLoading(false);
    setError('');
    onValidationChange?.(false);
    onFileChange?.(null);
    onPreviewChange?.(null);
    onRemove?.();
  };

  const hasPreview = Boolean(previewUrl);
  const previewAlt = `${dishName} - ${title}`;

  return (
    <div className="space-y-3 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs" onPaste={handlePaste}>
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{title}</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60 uppercase tracking-wider">
              {badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>

        {hasPreview && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Photo Loaded
          </span>
        )}
      </div>

      {/* Main Preview / Drop Zone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 transition-all duration-200 select-none group',
          isDragging
            ? 'border-orange-500 bg-orange-50/80 ring-4 ring-orange-500/20'
            : hasPreview
            ? 'border-slate-200/90 bg-slate-900 shadow-sm'
            : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-orange-400 hover:bg-orange-50/30'
        )}
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

            {/* Hover overlay with quick replace actions */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 p-4">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-orange-600 transition-all cursor-pointer w-full max-w-[200px] justify-center"
              >
                <Camera className="h-4 w-4" />
                <span>Snap New Photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 shadow-lg hover:bg-white transition-all cursor-pointer w-full max-w-[200px] justify-center"
              >
                <FolderOpen className="h-4 w-4 text-slate-600" />
                <span>Choose from Gallery</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-5 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100/90 text-orange-600 ring-4 ring-orange-50 transition-transform duration-200 group-hover:scale-105">
              <Camera className="h-6 w-6" />
            </div>

            <p className="text-xs font-bold text-slate-800">
              Add {title}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 max-w-[240px]">
              Take instant photo on mobile or choose from files
            </p>

            {/* Two Action Buttons on Empty State */}
            <div className="flex items-center gap-2 mt-3.5 w-full max-w-[260px]">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm shadow-orange-500/25 transition-all cursor-pointer"
                title="Take photo using device camera"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
                title="Choose existing photo from files"
              >
                <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Browse</span>
              </button>
            </div>

            <span className="mt-3 text-[10px] text-slate-400">
              Supports JPEG, PNG, WebP · Max 5MB
            </span>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-xs">
            <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-md">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              Processing photo...
            </span>
          </div>
        )}
      </div>

      {/* Hidden Native File and Camera Inputs */}
      {/* 1. Camera Input: on mobile phones/tablets, capture="environment" launches rear camera instantly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* 2. File / Gallery Browser Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Action Buttons Under Photo when Loaded */}
      {hasPreview && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Retake Camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
            <span>Browse File</span>
          </button>

          <button
            type="button"
            onClick={handleRemoveClick}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 hover:border-rose-300 cursor-pointer"
            title="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
            <span>Remove</span>
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1" role="alert">
          <ImageIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {uploadProgress > 0 && (
        <div className="space-y-1.5 pt-1" aria-live="polite">
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
