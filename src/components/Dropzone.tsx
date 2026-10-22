'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileVideo,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  Eye,
  Clock,
  Ban,
  ClipboardPaste,
} from 'lucide-react';

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'error';

export interface BatchQueueItem {
  id: string;
  file: File;
  duration: number;
  status: QueueItemStatus;
  compressedBlob?: Blob;
  outputExt?: string;
  errorMessage?: string;
}

interface DropzoneProps {
  queue: BatchQueueItem[];
  activeItemId: string | null;
  onFilesAdded: (files: File[]) => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onSelectInspectItem?: (id: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB per file
const ACCEPTED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ACCEPTED_EXTENSIONS = ['.mp4', '.mov', '.webm'];

export function formatBytesToMB(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? mb.toFixed(1) : mb.toFixed(2);
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Dropzone({
  queue,
  activeItemId,
  onFilesAdded,
  onRemoveItem,
  onClearQueue,
  onSelectInspectItem,
  disabled = false,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateAndAddFiles = useCallback(
    (fileList: File[] | FileList) => {
      setValidationError(null);
      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        const lowerName = file.name.toLowerCase();
        const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
        const hasValidMime = ACCEPTED_MIME_TYPES.includes(file.type);

        if (!hasValidExtension && !hasValidMime) {
          errors.push(`"${file.name}": Unsupported format (use MP4, MOV, or WebM).`);
          return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          errors.push(
            `"${file.name}": Exceeds the 500MB browser limit (${formatBytesToMB(file.size)} MB).`
          );
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        setValidationError(errors.join(' '));
      }

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded]
  );

  // Support Ctrl+V / Cmd+V clipboard video paste anywhere on the page
  useEffect(() => {
    if (typeof window === 'undefined' || disabled) return;

    const handleWindowPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        e.preventDefault();
        validateAndAddFiles(files);
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [disabled, validateAndAddFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndAddFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadDemoClip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isLoadingDemo) return;

    setValidationError(null);
    setIsLoadingDemo(true);

    try {
      let response = await fetch('/public/demo/sample.mp4');
      if (!response.ok) {
        response = await fetch('/demo/sample.mp4');
      }
      if (!response.ok) {
        throw new Error('Could not load demo sample video.');
      }
      const blob = await response.blob();
      const suffix = queue.length > 0 ? `-${queue.length + 1}` : '';
      const demoFile = new File([blob], `sample${suffix}.mp4`, {
        type: 'video/mp4',
        lastModified: Date.now(),
      });
      validateAndAddFiles([demoFile]);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Failed to load demo video clip.'
      );
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const totalQueueBytes = queue.reduce((acc, item) => acc + item.file.size, 0);

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload video files"
      />

      {queue.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled) fileInputRef.current?.click();
            }
          }}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-10 text-center ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]'
              : 'border-stone-700/80 hover:border-amber-500/60 bg-[#141210]/90 hover:bg-[#191614]'
          } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-amber-500/15 transition-transform">
            <UploadCloud className="w-8 h-8 text-amber-400" />
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1.5">
            Drop one or more videos here, or{' '}
            <span className="text-amber-400 underline decoration-amber-500/40 underline-offset-4">
              browse files
            </span>
          </h3>
          <p className="text-sm text-stone-400 mb-6">
            Supports single or <span className="text-stone-200 font-medium">batch queue</span>{' '}
            compression of <span className="text-stone-200 font-medium">MP4, MOV, and WebM</span>{' '}
            up to <span className="text-stone-200 font-medium">500MB</span> each
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleLoadDemoClip}
              disabled={disabled || isLoadingDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-600/60 text-stone-100 text-xs sm:text-sm font-medium transition shadow-sm"
            >
              {isLoadingDemo ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  Loading 3MB Demo Clip...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  Don&apos;t have a file? Try with Demo Clip
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-400 text-xs font-mono">
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-400" />
              <span>or press Ctrl+V to paste video</span>
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-2xl border transition-all bg-[#141210] p-5 sm:p-6 shadow-lg space-y-4 ${
            isDragging ? 'border-amber-400 bg-amber-500/5' : 'border-amber-500/30'
          }`}
        >
          {/* Batch Queue Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {queue.length === 1
                      ? 'Selected Video Ready'
                      : `Batch Compression Queue (${queue.length} files)`}
                  </h4>
                  <span className="text-xs font-mono text-stone-400">
                    ({formatBytesToMB(totalQueueBytes)} MB total)
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Drop additional files anywhere in this box to append to the batch queue.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-200 border border-amber-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Files
              </button>
              <button
                type="button"
                onClick={handleLoadDemoClip}
                disabled={disabled || isLoadingDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 border border-stone-700 transition"
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                + Demo Clip
              </button>
              <button
                type="button"
                onClick={onClearQueue}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-xs font-medium text-stone-400 border border-stone-700 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Queue Items List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {queue.map((item, idx) => {
              const isSelectedForInspect = activeItemId === item.id;
              const savedPct =
                item.compressedBlob && item.file.size > 0
                  ? Math.max(
                      0,
                      Math.round(
                        ((item.file.size - item.compressedBlob.size) / item.file.size) * 100
                      )
                    )
                  : null;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition ${
                    isSelectedForInspect
                      ? 'bg-amber-950/30 border-amber-500/50'
                      : 'bg-[#0c0a09]/90 border-stone-800/90 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 font-mono text-xs text-amber-300">
                      {idx + 1}
                    </div>
                    <FileVideo className="w-5 h-5 text-amber-400 shrink-0 hidden sm:block" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate max-w-[220px] sm:max-w-xs">
                          {item.file.name}
                        </span>

                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-800 text-stone-300 border border-stone-700">
                            <Clock className="w-3 h-3 text-stone-400" />
                            Queued
                          </span>
                        )}
                        {item.status === 'processing' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Encoding
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Done {savedPct !== null ? `(-${savedPct}%)` : ''}
                          </span>
                        )}
                        {item.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Ban className="w-3 h-3" />
                            Cancelled
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 mt-0.5 text-xs text-stone-400 font-mono">
                        <span>{formatBytesToMB(item.file.size)} MB</span>
                        {item.compressedBlob && (
                          <>
                            <span className="text-emerald-400">
                              &rarr; {formatBytesToMB(item.compressedBlob.size)} MB
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDuration(item.duration)}</span>
                        <span>•</span>
                        <span className="uppercase">
                          {item.file.name.split('.').pop() || 'MP4'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.status === 'completed' && onSelectInspectItem && (
                      <button
                        type="button"
                        onClick={() => onSelectInspectItem(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Compare
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      disabled={disabled}
                      aria-label={`Remove ${item.file.name}`}
                      className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-stone-400 border border-stone-700 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {queue.some((q) => q.file.name.startsWith('sample')) && (
            <div className="pt-2 border-t border-stone-800/80 flex items-center gap-2 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Demo clip loaded from{' '}
                <code className="font-mono text-amber-200">/public/demo/sample.mp4</code> (3.0 MB,
                720p 30fps, 10s).
              </span>
            </div>
          )}
        </div>
      )}

      {validationError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs text-rose-300 flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
