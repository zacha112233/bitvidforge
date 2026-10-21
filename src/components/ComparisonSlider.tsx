'use client';

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Archive,
  Layers,
  Loader2,
} from 'lucide-react';
import { BatchQueueItem, formatBytesToMB } from './Dropzone';

interface ComparisonSliderProps {
  originalFile: File;
  compressedBlob: Blob;
  outputExt?: string;
  completedBatchItems?: BatchQueueItem[];
  activeItemId?: string | null;
  onSelectBatchItem?: (id: string) => void;
  onReset: () => void;
}

export default function ComparisonSlider({
  originalFile,
  compressedBlob,
  outputExt = '.mp4',
  completedBatchItems = [],
  activeItemId,
  onSelectBatchItem,
  onReset,
}: ComparisonSliderProps) {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);

  useEffect(() => {
    const origObjUrl = URL.createObjectURL(originalFile);
    const compObjUrl = URL.createObjectURL(compressedBlob);
    setOriginalUrl(origObjUrl);
    setCompressedUrl(compObjUrl);

    return () => {
      URL.revokeObjectURL(origObjUrl);
      URL.revokeObjectURL(compObjUrl);
    };
  }, [originalFile, compressedBlob]);

  const originalMB = formatBytesToMB(originalFile.size);
  const compressedMB = formatBytesToMB(compressedBlob.size);

  const rawSavedPct =
    originalFile.size > 0
      ? Math.round(((originalFile.size - compressedBlob.size) / originalFile.size) * 100)
      : 0;
  const savedPct = Math.max(0, rawSavedPct);

  const normalizedExt = outputExt.startsWith('.') ? outputExt : `.${outputExt}`;
  const formatUpper = normalizedExt.slice(1).toUpperCase();
  const outputFileName =
    originalFile.name.replace(/\.[^/.]+$/, '') + `-compressed${normalizedExt}`;

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    if (completedBatchItems.length === 0 || isZipping) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      completedBatchItems.forEach((item, index) => {
        if (!item.compressedBlob) return;
        const ext = item.outputExt || normalizedExt;
        const baseName = item.file.name.replace(/\.[^/.]+$/, '');
        const fileName = `${baseName}-compressed-${index + 1}${ext}`;
        zip.file(fileName, item.compressedBlob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `bitvidforge-batch-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      data-testid="comparison-view"
      className="rounded-3xl border border-amber-500/30 bg-[#141210] p-6 sm:p-8 shadow-2xl space-y-6"
    >
      {/* Multi-File Batch Selector Tabs (if batch > 1) */}
      {completedBatchItems.length > 1 && onSelectBatchItem && (
        <div className="rounded-2xl bg-[#0c0a09] border border-stone-800 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
              <Layers className="w-3.5 h-3.5" />
              Batch Completed ({completedBatchItems.length} videos) — Select file to compare:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {completedBatchItems.map((item, idx) => {
              const active = item.id === activeItemId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectBatchItem(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 border transition ${
                    active
                      ? 'bg-amber-500 text-stone-950 font-semibold border-amber-400'
                      : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  #{idx + 1} {item.file.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Compression Complete • Ready to Share
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white pt-1">
            {originalMB}MB &rarr; {compressedMB}MB ({savedPct}% saved)
          </h2>
          <p className="text-xs text-stone-400 font-mono">
            {originalMB}MB -&gt; {compressedMB}MB ({savedPct}% saved) • Local Memory Cleaned
          </p>
        </div>
      </div>

      {/* Side-by-Side Size Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="rounded-2xl bg-[#0c0a09] border border-stone-800 p-4">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
            Original Size
          </span>
          <div className="text-2xl font-extrabold text-stone-200 font-mono mt-1">
            {originalMB} MB
          </div>
          <span className="text-[11px] text-stone-500 truncate block mt-1">
            {originalFile.name}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{savedPct}% Saved</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-stone-500 mt-1.5 font-mono">
            Output Container: {formatUpper}
          </span>
        </div>

        <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/40 p-4">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 block">
            Compressed Size
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {compressedMB} MB
          </div>
          <span className="text-[11px] text-emerald-300/70 truncate block mt-1">
            {outputFileName}
          </span>
        </div>
      </div>

      {/* Side-by-Side Video Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl overflow-hidden bg-black border border-stone-800">
          <div className="px-3.5 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs font-mono">
            <span className="text-stone-300 font-semibold">Original Video</span>
            <span className="text-stone-400">{originalMB} MB</span>
          </div>
          {originalUrl && (
            <video
              src={originalUrl}
              controls
              muted
              playsInline
              className="w-full aspect-video object-contain"
            />
          )}
        </div>
        <div className="rounded-2xl overflow-hidden bg-black border border-emerald-500/30 flex flex-col">
          <div className="px-3.5 py-2.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-300 font-semibold">
              {normalizedExt === '.gif'
                ? 'Generated Animated GIF'
                : normalizedExt === '.mp3'
                ? 'Extracted MP3 Audio'
                : 'Compressed Video'}
            </span>
            <span className="text-emerald-400">{compressedMB} MB</span>
          </div>
          {compressedUrl && normalizedExt === '.gif' && (
            <img
              src={compressedUrl}
              alt="Compressed animated GIF preview"
              className="w-full aspect-video object-contain"
            />
          )}
          {compressedUrl && normalizedExt === '.mp3' && (
            <div className="w-full aspect-video flex flex-col items-center justify-center p-6 gap-4 bg-[#0c0a09]">
              <span className="text-xs font-mono text-amber-300">
                192 kbps Stereo MP3 Audio Stream Ready
              </span>
              <audio src={compressedUrl} controls className="w-full max-w-sm" />
            </div>
          )}
          {compressedUrl && normalizedExt !== '.gif' && normalizedExt !== '.mp3' && (
            <video
              src={compressedUrl}
              controls
              muted
              playsInline
              className="w-full aspect-video object-contain"
            />
          )}
        </div>
      </div>

      {/* Primary Download, Batch ZIP Download & Reset Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 transition"
        >
          <Download className="w-5 h-5" />
          Download Compressed {formatUpper}
        </button>

        {completedBatchItems.length > 1 && (
          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Packaging ZIP...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Download All ({completedBatchItems.length}) as ZIP
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm border border-stone-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Compress Another File
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>
          Generated locally on your device — zero bytes sent to any server.
        </span>
      </div>
    </div>
  );
}
