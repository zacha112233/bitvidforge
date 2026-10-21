'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Cpu,
  Terminal,
  ShieldCheck,
  XCircle,
  Layers,
} from 'lucide-react';
import { BitrateMetadata, ProcessingStage } from '@/hooks/useFFmpeg';
import AdSlot from './AdSlot';

interface ProcessingStatusProps {
  isOpen: boolean;
  progress: number;
  stage: ProcessingStage;
  logs: string[];
  fileName: string;
  targetSizeMB: number;
  bitrateInfo: BitrateMetadata | null;
  isMultiThreaded?: boolean;
  batchCurrentIndex?: number;
  batchTotalCount?: number;
  onCancel?: () => void;
}

export default function ProcessingStatus({
  isOpen,
  progress,
  stage,
  logs,
  fileName,
  targetSizeMB,
  bitrateInfo,
  isMultiThreaded = false,
  batchCurrentIndex = 1,
  batchTotalCount = 1,
  onCancel,
}: ProcessingStatusProps) {
  if (!isOpen) return null;

  const isGif = bitrateInfo?.formatCodec === 'gif';
  const isMp3 = bitrateInfo?.formatCodec === 'mp3-audio';

  const steps: {
    id: ProcessingStage;
    label: string;
    detail: string;
  }[] = [
    {
      id: 'reading',
      label: 'Reading local file',
      detail: 'Mounting media buffer into isolated FFmpeg MEMFS virtual memory',
    },
    {
      id: 'encoding',
      label: isGif
        ? 'Generating Adaptive Palette & High-FPS GIF'
        : isMp3
        ? 'Extracting 192 kbps MP3 Audio Stream'
        : 'Encoding Video via WebAssembly',
      detail: bitrateInfo
        ? isGif
          ? `192-color Lanczos palette generation & dithering (${bitrateInfo.threads} WASM thread${bitrateInfo.threads > 1 ? 's' : ''})`
          : isMp3
          ? `Stripping video track (-vn) & encoding 192 kbps stereo MP3`
          : `Target bitrate: ${bitrateInfo.videoBitrateKbps} kbps video + ${bitrateInfo.audioBitrateKbps} kbps audio (${bitrateInfo.threads} WASM thread${bitrateInfo.threads > 1 ? 's' : ''})`
        : 'Transcoding media stream in browser worker thread',
    },
    {
      id: 'packaging',
      label: isGif ? 'Packaging Animated GIF' : isMp3 ? 'Packaging MP3 Audio' : 'Packaging Media Container',
      detail: 'Muxing output container & purging virtual filesystem',
    },
  ];

  const stageOrder: Record<ProcessingStage, number> = {
    idle: 0,
    cancelled: 0,
    reading: 1,
    encoding: 2,
    packaging: 3,
    completed: 4,
  };

  const currentRank = stageOrder[stage] || 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="w-full max-w-5xl rounded-3xl border border-amber-500/30 bg-[#0f0d0b] p-5 sm:p-7 shadow-[0_0_70px_-15px_rgba(245,158,11,0.3)] my-auto space-y-6">
        {/* Top 728x90 Standardized Leaderboard Sponsor / Ad Space (A-Ads Ready) */}
        <div className="w-full flex justify-center">
          <AdSlot size="728x90" />
        </div>

        {/* Main Dwell-Time Grid: Progress & Checklist + Adjacent 300x250 Sponsor Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Progress Bar, Percentage Readout, Sequential Checklist, and Live WASM Logs */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-stone-800 bg-[#141210] p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                    <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        id="processing-modal-title"
                        className="text-base sm:text-lg font-bold text-white truncate"
                      >
                        Transcoding in Browser WASM
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {isMultiThreaded ? 'Multi-Thread Pthreads' : 'Single-Thread'}
                      </span>
                      {batchTotalCount > 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                          <Layers className="w-3 h-3" />
                          Batch {batchCurrentIndex} / {batchTotalCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 truncate mt-0.5">
                      {fileName} → Target {targetSizeMB} MB
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    data-testid="progress-percentage"
                    className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400"
                  >
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3.5 rounded-full bg-stone-900 border border-stone-800 overflow-hidden p-0.5">
                <div
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ width: `${Math.max(4, progress)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Sequential Status Checklist */}
            <div className="space-y-2.5">
              {steps.map((step, index) => {
                const stepRank = index + 1;
                const isDone = currentRank > stepRank;
                const isCurrent = currentRank === stepRank;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : isDone
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-stone-200'
                        : 'bg-stone-900/40 border-stone-800/70 text-stone-500'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{step.label}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{step.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Real-time FFmpeg WASM Console Output & Cancel Action */}
            <div className="space-y-3">
              <div className="rounded-xl bg-[#080706] border border-stone-800/90 p-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>FFmpeg.wasm Real-Time Stream</span>
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    0 Bytes Uploaded
                  </span>
                </div>
                <div className="h-20 overflow-y-auto font-mono text-[11px] text-stone-400 space-y-0.5 pr-1">
                  {logs.length === 0 ? (
                    <div className="text-stone-600">Allocating WebAssembly threads...</div>
                  ) : (
                    logs.slice(-6).map((line, i) => (
                      <div key={i} className="truncate">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {onCancel && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onCancel}
                    data-testid="cancel-transcode-btn"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Transcoding
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Standardized 300x250 Medium Rectangle Sponsor / Ad Space (A-Ads Ready) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-stone-800 bg-[#141210] p-5">
            <AdSlot size="300x250" />
            <p className="text-[11px] text-stone-500 mt-3 text-center max-w-[300px]">
              Keep this tab open while WebAssembly finishes encoding your video locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
