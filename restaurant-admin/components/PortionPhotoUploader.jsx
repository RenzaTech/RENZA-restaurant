'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function PortionPhotoUploader({
  portionKey,
  label,
  subLabel = 'Optional serving photo',
  previewUrl,
  onFileSelected,
  onRemove,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      toast.error('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    onFileSelected(file, blobUrl);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const cleanPreviewUrl = previewUrl
    ? previewUrl.startsWith('http') || previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')
      ? previewUrl
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${previewUrl}`
    : null;

  return (
    <div className="pt-2 border-t border-slate-100">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
          <Camera className="w-3 h-3 text-orange-600" />
          {label}
        </span>
        <span className="text-[9px] font-semibold text-slate-400">Optional</span>
      </div>

      {cleanPreviewUrl ? (
        <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group shadow-2xs">
          <Image
            src={cleanPreviewUrl}
            alt={label}
            fill
            sizes="160px"
            unoptimized={cleanPreviewUrl.startsWith('blob:')}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              title="Change photo"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>
          <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-amber-300 backdrop-blur-2xs">
            {subLabel}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'w-full py-2.5 px-2 rounded-lg border border-dashed text-center flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer',
            isDragging
              ? 'border-orange-500 bg-orange-50/70 text-orange-700'
              : 'border-slate-300 bg-slate-50/70 hover:bg-orange-50/50 hover:border-orange-300 text-slate-500'
          )}
        >
          <ImagePlus className="w-4 h-4 text-orange-600/80" />
          <span className="text-[10px] font-bold text-slate-700">Upload {label}</span>
          <span className="text-[9px] text-slate-400">JPG, PNG or WebP</span>
        </button>
      )}
    </div>
  );
}
