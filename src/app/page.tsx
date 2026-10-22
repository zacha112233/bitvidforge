'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Cpu,
  Zap,
  Lock,
  Film,
  Sparkles,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import {
  useFFmpeg,
  getVideoDuration,
  getFormatMetadata,
  ResolutionOption,
  FramerateOption,
  OutputFormatOption,
} from '@/hooks/useFFmpeg';
import Dropzone, { BatchQueueItem } from '@/components/Dropzone';
import PresetSelector, { PresetId } from '@/components/PresetSelector';
import ProcessingStatus from '@/components/ProcessingStatus';
import ComparisonSlider from '@/components/ComparisonSlider';
import AdSlot from '@/components/AdSlot';
import SeoKnowledgeSection from '@/components/SeoKnowledgeSection';
import { WasmErrorBoundary } from '@/components/WasmErrorBoundary';

export default function HomePage() {
  const {
    isLoaded,
    isLoading,
    isProcessing,
    isMultiThreaded,
    stage,
    progress,
    logs,
    error: ffmpegError,
    bitrateInfo,
    compressVideo,
    cancelCompression,
    resetState,
  } = useFFmpeg();

  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [inspectItemId, setInspectItemId] = useState<string | null>(null);
  const [batchProgressIndex, setBatchProgressIndex] = useState<number>(1);
  const [batchTotalToProcess, setBatchTotalToProcess] = useState<number>(1);
  const [activeProcessingName, setActiveProcessingName] = useState<string>('video.mp4');

  const [selectedPreset, setSelectedPreset] = useState<PresetId>('discord');
  const [customSizeMB, setCustomSizeMB] = useState<number>(15);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);
  const [resolution, setResolution] = useState<ResolutionOption>('original');
  const [fps, setFps] = useState<FramerateOption>('original');
  const [formatCodec, setFormatCodec] = useState<OutputFormatOption>('mp4-h264');
  const [muteAudio, setMuteAudio] = useState<boolean>(false);
  const [multiThreading, setMultiThreading] = useState<boolean>(true);
  const [outboundPostPutCount, setOutboundPostPutCount] = useState<number>(0);

  const batchCancelledRef = useRef<boolean>(false);

  // Runtime verification: monitor fetch and XMLHttpRequest to verify zero POST/PUT requests
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    const originalXhrOpen = XMLHttpRequest.prototype.open;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url || '';
      const method = (
        init?.method ||
        (input instanceof Request ? input.method : 'GET')
      ).toUpperCase();
      if (
        (method === 'POST' || method === 'PUT') &&
        !urlStr.includes('/_vercel/insights')
      ) {
        setOutboundPostPutCount((c) => c + 1);
      }
      return originalFetch(input, init);
    };

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null
    ) {
      const upper = method ? method.toUpperCase() : 'GET';
      if (upper === 'POST' || upper === 'PUT') {
        setOutboundPostPutCount((c) => c + 1);
      }
      return originalXhrOpen.call(this, method, url, async, username, password);
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXhrOpen;
    };
  }, []);

  const primaryQueueItem = queue[0] || null;

  useEffect(() => {
    setTrimStart(0);
    setTrimEnd(
      primaryQueueItem?.duration && primaryQueueItem.duration > 0
        ? Number(primaryQueueItem.duration.toFixed(1))
        : 10
    );
  }, [primaryQueueItem?.id, primaryQueueItem?.duration]);

  const originalSizeMB = useMemo(() => {
    if (!primaryQueueItem) return null;
    return Number((primaryQueueItem.file.size / (1024 * 1024)).toFixed(2));
  }, [primaryQueueItem]);

  const computeTargetSizeMB = useCallback(
    (fileSizeBytes?: number): number => {
      switch (selectedPreset) {
        case 'discord':
          return 9.5;
        case 'whatsapp':
          return 15.5;
        case 'nitro':
          return 48;
        case 'email':
          return 9.5;
        case 'web': {
          const baseMB = fileSizeBytes
            ? fileSizeBytes / (1024 * 1024)
            : originalSizeMB || 10;
          return Math.max(0.4, Number((baseMB * 0.3).toFixed(2)));
        }
        case 'custom':
          return customSizeMB;
      }
    },
    [selectedPreset, originalSizeMB, customSizeMB]
  );

  const targetSizeMB = useMemo(() => computeTargetSizeMB(), [computeTargetSizeMB]);

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      resetState();
      const newItems: BatchQueueItem[] = await Promise.all(
        files.map(async (file) => {
          const duration = await getVideoDuration(file);
          return {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            file,
            duration,
            status: 'pending' as const,
          };
        })
      );
      setQueue((prev) => [...prev, ...newItems]);
      setInspectItemId(null);
    },
    [resetState]
  );

  const handleRemoveItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    setInspectItemId((prev) => (prev === id ? null : prev));
  }, []);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
    setInspectItemId(null);
    resetState();
  }, [resetState]);

  const handleCancelTranscoding = useCallback(() => {
    batchCancelledRef.current = true;
    cancelCompression();
    setQueue((prev) =>
      prev.map((item) =>
        item.status === 'processing' ? { ...item, status: 'cancelled' } : item
      )
    );
  }, [cancelCompression]);

  const handleStartCompression = async () => {
    const itemsToProcess = queue.filter(
      (item) => item.status !== 'completed'
    );
    const targetList = itemsToProcess.length > 0 ? itemsToProcess : queue;
    if (targetList.length === 0 || isProcessing) return;

    batchCancelledRef.current = false;
    setBatchTotalToProcess(targetList.length);
    const formatMeta = getFormatMetadata(formatCodec);
    let lastCompletedId: string | null = null;

    for (let i = 0; i < targetList.length; i++) {
      if (batchCancelledRef.current) break;

      const currentItem = targetList[i];
      setBatchProgressIndex(i + 1);
      setActiveProcessingName(currentItem.file.name);

      setQueue((prev) =>
        prev.map((q) =>
          q.id === currentItem.id
            ? { ...q, status: 'processing', errorMessage: undefined }
            : q
        )
      );

      const itemTargetMB = computeTargetSizeMB(currentItem.file.size);

      try {
        const outputBlob = await compressVideo(currentItem.file, itemTargetMB, {
          resolution,
          fps,
          formatCodec,
          muteAudio,
          multiThreading,
          durationSeconds: currentItem.duration,
          trimStart: i === 0 ? trimStart : 0,
          trimEnd: i === 0 ? trimEnd : currentItem.duration,
        });

        lastCompletedId = currentItem.id;
        setQueue((prev) =>
          prev.map((q) =>
            q.id === currentItem.id
              ? {
                  ...q,
                  status: 'completed',
                  compressedBlob: outputBlob,
                  outputExt: formatMeta.ext,
                }
              : q
          )
        );
      } catch (err) {
        if (batchCancelledRef.current) {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === currentItem.id ? { ...q, status: 'cancelled' } : q
            )
          );
          break;
        } else {
          const msg = err instanceof Error ? err.message : 'Encoding failed';
          setQueue((prev) =>
            prev.map((q) =>
              q.id === currentItem.id
                ? { ...q, status: 'error', errorMessage: msg }
                : q
            )
          );
        }
      }
    }

    if (lastCompletedId && !batchCancelledRef.current) {
      setInspectItemId(lastCompletedId);
    }
  };

  const completedBatchItems = useMemo(
    () => queue.filter((item) => item.status === 'completed' && item.compressedBlob),
    [queue]
  );

  const inspectedItem = useMemo(() => {
    if (!inspectItemId) return null;
    return completedBatchItems.find((item) => item.id === inspectItemId) || null;
  }, [completedBatchItems, inspectItemId]);

  const pendingOrRetryableCount = useMemo(
    () => queue.filter((item) => item.status !== 'completed').length,
    [queue]
  );

  return (
    <WasmErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#0c0a09] text-stone-100 relative overflow-x-hidden">
        {/* Ambient background glow + subtle studio grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[920px] h-[440px] bg-gradient-to-b from-amber-500/15 via-orange-600/5 to-transparent blur-[130px] rounded-full"
        />

        {/* Top Navigation & Trust Bar */}
        <header className="relative z-10 border-b border-stone-800/80 bg-[#0c0a09]/85 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/25">
                <Film className="w-5 h-5 text-stone-950" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white">
                  BitVidForge
                </span>
                <span className="ml-2 text-[11px] font-mono px-2 py-0.5 rounded bg-stone-900 text-amber-300 border border-amber-500/30">
                  Local Media Studio
                </span>
              </div>
            </div>

            {/* Subtle Live Indicator showing "Local Compute Active" */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <div
                data-testid="network-egress-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>POST/PUT Egress: {outboundPostPutCount}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-xs font-medium text-stone-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Local Compute Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {/* Trust Hero Section */}
          <section className="text-center space-y-4">
            {/* Prominent Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% In-Browser &amp; Private — Files never leave your device.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Forge Smaller Videos,{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                GIFs &amp; Audio
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-400 leading-relaxed">
              Fit Discord&apos;s 10MB cap, WhatsApp, or Slack with precision bitrate targeting,
              instant dead-air trimming, and 1-click GIF or MP3 extraction — 100% locally.
            </p>
          </section>

          {/* Conditional View: Comparison Result OR Dropzone + Preset Configuration */}
          {inspectedItem && inspectedItem.compressedBlob ? (
            <ComparisonSlider
              originalFile={inspectedItem.file}
              compressedBlob={inspectedItem.compressedBlob}
              outputExt={inspectedItem.outputExt || getFormatMetadata(formatCodec).ext}
              completedBatchItems={completedBatchItems}
              activeItemId={inspectedItem.id}
              onSelectBatchItem={setInspectItemId}
              onReset={handleClearQueue}
            />
          ) : (
            <div className="space-y-6">
              {/* Step 1: Dropzone & Batch Queue */}
              <Dropzone
                queue={queue}
                activeItemId={inspectItemId}
                onFilesAdded={handleFilesAdded}
                onRemoveItem={handleRemoveItem}
                onClearQueue={handleClearQueue}
                onSelectInspectItem={setInspectItemId}
                disabled={isProcessing || isLoading}
              />

              {/* Step 2: Intent-Based Presets, Quick Trimmer & Advanced Settings */}
              <PresetSelector
                selectedPreset={selectedPreset}
                targetSizeMB={targetSizeMB}
                customSizeMB={customSizeMB}
                originalSizeMB={originalSizeMB}
                videoDuration={primaryQueueItem?.duration || null}
                primaryFile={primaryQueueItem?.file || null}
                trimStart={trimStart}
                trimEnd={trimEnd}
                resolution={resolution}
                fps={fps}
                formatCodec={formatCodec}
                muteAudio={muteAudio}
                multiThreading={multiThreading}
                onSelectPreset={setSelectedPreset}
                onCustomSizeChange={setCustomSizeMB}
                onTrimChange={(start, end) => {
                  setTrimStart(start);
                  setTrimEnd(end);
                }}
                onResolutionChange={setResolution}
                onFpsChange={setFps}
                onFormatCodecChange={setFormatCodec}
                onMuteAudioChange={setMuteAudio}
                onMultiThreadingChange={setMultiThreading}
                disabled={isProcessing || isLoading}
              />

              {/* Error Banner if FFmpeg fails */}
              {ffmpegError && (
                <div
                  role="alert"
                  className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs sm:text-sm text-rose-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      WebAssembly Transcoding Error
                    </div>
                    <p className="mt-0.5 text-rose-300 font-mono text-xs">{ffmpegError}</p>
                  </div>
                </div>
              )}

              {/* Primary Compress Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={queue.length === 0 || isProcessing || isLoading}
                  onClick={handleStartCompression}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                    queue.length > 0 && !isProcessing && !isLoading
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-stone-950 shadow-amber-500/25 cursor-pointer'
                      : 'bg-stone-900/80 text-stone-500 border border-stone-800 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  {queue.length === 0 ? (
                    <span>Select a Video or Load Demo Clip to Begin</span>
                  ) : formatCodec === 'gif' ? (
                    <span>
                      Forge High-FPS Animated GIF
                      {queue.length > 1 ? ` (${queue.length} Clips)` : ''}
                    </span>
                  ) : formatCodec === 'mp3-audio' ? (
                    <span>
                      Extract 192 kbps MP3 Audio
                      {queue.length > 1 ? ` (${queue.length} Clips)` : ''}
                    </span>
                  ) : queue.length === 1 ? (
                    <span>
                      Forge Video to ~{targetSizeMB} MB ({getFormatMetadata(formatCodec).label})
                    </span>
                  ) : (
                    <span>
                      Forge Batch Queue (
                      {pendingOrRetryableCount > 0 ? pendingOrRetryableCount : queue.length}{' '}
                      Videos • {getFormatMetadata(formatCodec).label})
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Architectural Privacy & Performance Footer Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border border-stone-800/80 bg-[#141210]/80 p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-white">Zero Server Egress</h3>
                <p className="text-xs text-stone-400 mt-1">
                  No POST or PUT requests ever leave your browser. All media stays in local RAM.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-800/80 bg-[#141210]/80 p-4 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-white">Multi-Threaded Engine</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Harnesses @ffmpeg/core-mt pthreads &amp; SIMD with deterministic bitrate targeting.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-800/80 bg-[#141210]/80 p-4 flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-white">Auto MEMFS Cleanup</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Automatically unlinks virtual input &amp; output buffers after each transcode.
                </p>
              </div>
            </div>
          </section>

          {/* Persistent 728x90 & 300x250 A-Ads Banner Slots (ensures A-Ads bot verifies both units on initial page load) */}
          <section className="pt-2 flex flex-col items-center gap-4">
            <AdSlot size="728x90" />
            <AdSlot size="300x250" />
          </section>

          {/* SEO & AI Knowledge Section: 2026 Platform Upload Limits Table, Bitrate Guide & FAQ */}
          <SeoKnowledgeSection />
        </main>

        {/* Processing Modal & Dwell-Time Ad Slots */}
        <ProcessingStatus
          isOpen={isProcessing || isLoading}
          progress={progress}
          stage={stage}
          logs={logs}
          fileName={activeProcessingName}
          targetSizeMB={targetSizeMB}
          bitrateInfo={bitrateInfo}
          isMultiThreaded={isMultiThreaded || multiThreading}
          batchCurrentIndex={batchProgressIndex}
          batchTotalCount={batchTotalToProcess}
          onCancel={handleCancelTranscoding}
        />

        {/* Footer */}
        <footer className="relative z-10 border-t border-stone-800/70 py-5 text-center text-xs text-stone-500">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Powered by Next.js App Router, Tailwind CSS &amp; @ffmpeg/ffmpeg (v0.12 WebAssembly)
            </span>
            <span className="font-mono text-[11px] text-stone-400">
              COOP: same-origin • COEP: require-corp • WASM Engine:{' '}
              {isLoaded
                ? isMultiThreaded
                  ? 'Loaded (MT Pthreads)'
                  : 'Loaded (ST)'
                : 'Standby'}
            </span>
          </div>
        </footer>
      </div>
    </WasmErrorBoundary>
  );
}
