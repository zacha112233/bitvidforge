'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Mail,
  Globe,
  Sliders,
  ChevronDown,
  ChevronUp,
  Settings2,
  Gauge,
  Cpu,
  Volume2,
  VolumeX,
  FileCode2,
  Scissors,
  Sparkles,
  Music,
  Image as ImageIcon,
  Zap,
  RotateCcw,
} from 'lucide-react';
import {
  FramerateOption,
  OutputFormatOption,
  ResolutionOption,
  getFormatMetadata,
} from '@/hooks/useFFmpeg';
import { formatDuration } from './Dropzone';

export type PresetId =
  | 'discord'
  | 'whatsapp'
  | 'nitro'
  | 'email'
  | 'web'
  | 'custom';

interface PresetSelectorProps {
  selectedPreset: PresetId;
  targetSizeMB: number;
  customSizeMB: number;
  originalSizeMB: number | null;
  videoDuration: number | null;
  primaryFile?: File | null;
  trimStart: number;
  trimEnd: number;
  resolution: ResolutionOption;
  fps: FramerateOption;
  formatCodec: OutputFormatOption;
  muteAudio: boolean;
  multiThreading: boolean;
  onSelectPreset: (preset: PresetId) => void;
  onCustomSizeChange: (sizeMB: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onResolutionChange: (res: ResolutionOption) => void;
  onFpsChange: (fps: FramerateOption) => void;
  onFormatCodecChange: (formatCodec: OutputFormatOption) => void;
  onMuteAudioChange: (mute: boolean) => void;
  onMultiThreadingChange: (mt: boolean) => void;
  disabled?: boolean;
}

export default function PresetSelector({
  selectedPreset,
  targetSizeMB,
  customSizeMB,
  originalSizeMB,
  videoDuration,
  primaryFile = null,
  trimStart,
  trimEnd,
  resolution,
  fps,
  formatCodec,
  muteAudio,
  multiThreading,
  onSelectPreset,
  onCustomSizeChange,
  onTrimChange,
  onResolutionChange,
  onFpsChange,
  onFormatCodecChange,
  onMuteAudioChange,
  onMultiThreadingChange,
  disabled = false,
}: PresetSelectorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [trimmerOpen, setTrimmerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!primaryFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(primaryFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [primaryFile]);

  const maxDuration =
    videoDuration && videoDuration > 0 ? Number(videoDuration.toFixed(1)) : 10;
  const effectiveTrimEnd =
    trimEnd > trimStart && trimEnd <= maxDuration ? trimEnd : maxDuration;
  const trimmedDurationSec = Math.max(0.5, effectiveTrimEnd - trimStart);
  const isTrimActive =
    trimStart > 0.05 || effectiveTrimEnd < maxDuration - 0.05;
  const bitrateBoostPct =
    isTrimActive && maxDuration > trimmedDurationSec
      ? Math.round(((maxDuration - trimmedDurationSec) / trimmedDurationSec) * 100)
      : 0;

  const webTargetMB = originalSizeMB
    ? Math.max(0.5, Number((originalSizeMB * 0.3).toFixed(2)))
    : 3.0;

  const targetKilobits = targetSizeMB * 1024 * 8;
  const audioKbps = muteAudio || formatCodec === 'gif' ? 0 : 128;
  const estimatedVideoKbps = Math.max(
    100,
    Math.floor(targetKilobits / trimmedDurationSec - audioKbps)
  );

  const formatMeta = getFormatMetadata(formatCodec);

  const presets: {
    id: PresetId;
    label: string;
    sublabel: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'discord',
      label: 'Discord Free',
      sublabel: '9.5 MB Target (<10MB Cap)',
      badge: '2026 Limit',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp / Chat',
      sublabel: '15.5 MB Target (<16MB)',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'nitro',
      label: 'Discord Nitro / Slack',
      sublabel: '48 MB Target (<50MB)',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'email',
      label: 'Email Attachment',
      sublabel: '9.5 MB Safe Cap',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: 'web',
      label: 'Web Optimized',
      sublabel: originalSizeMB
        ? `70% Smaller (${webTargetMB} MB)`
        : '70% Reduction Target',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'custom',
      label: 'Custom Slider',
      sublabel: `${customSizeMB} MB Target`,
      icon: <Sliders className="w-4 h-4" />,
    },
  ];

  const resolutions: { value: ResolutionOption; label: string; desc: string }[] = [
    { value: 'original', label: 'Original', desc: 'Keep source scale' },
    { value: '1080p', label: '1080p', desc: 'Full HD (scale=-2:1080)' },
    { value: '720p', label: '720p', desc: 'HD Ready (scale=-2:720)' },
    { value: '480p', label: '480p', desc: 'SD Compact (scale=-2:480)' },
  ];

  const framerates: { value: FramerateOption; label: string }[] = [
    { value: 'original', label: 'Original FPS' },
    { value: 30, label: '30 fps' },
    { value: 60, label: '60 fps' },
  ];

  const formatOptions: {
    value: OutputFormatOption;
    label: string;
    codec: string;
    desc: string;
    badge?: string;
  }[] = [
    {
      value: 'mp4-h264',
      label: 'MP4 (H.264)',
      codec: 'libx264 + AAC',
      desc: 'Best universal compatibility',
    },
    {
      value: 'webm-vp9',
      label: 'WebM (VP9)',
      codec: 'libvpx-vp9 + Opus',
      desc: 'Royalty-free modern web video',
    },
    {
      value: 'mp4-mpeg4',
      label: 'MP4 (MPEG-4)',
      codec: 'mpeg4 + AAC',
      desc: 'Ultra-fast lightweight transcode',
    },
    {
      value: 'gif',
      label: 'Animated GIF',
      codec: 'PaletteGen 192-Color',
      desc: 'High-FPS loop for Discord, GitHub & Slack',
      badge: 'Standout',
    },
    {
      value: 'mp3-audio',
      label: 'Extract MP3 Audio',
      codec: '192kbps Stereo MP3',
      desc: 'Strip video & save audio track only',
      badge: 'Audio Only',
    },
  ];

  const seekPreview = (timeSec: number) => {
    if (videoPreviewRef.current && Number.isFinite(timeSec)) {
      try {
        videoPreviewRef.current.currentTime = timeSec;
      } catch {
        // ignore seek errors before metadata loaded
      }
    }
  };

  return (
    <div className="rounded-2xl border border-stone-800/90 bg-[#141210] p-5 sm:p-6 shadow-lg space-y-5">
      {/* Top Header + Live Bitrate Estimator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-300">
            Platform Target &amp; Output Studio
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Updated for 2026 platform size caps, or switch to 1-click GIF / MP3 extraction.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 text-xs font-mono text-amber-300">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          {formatCodec === 'mp3-audio' ? (
            <span>Output: 192 kbps MP3 Audio</span>
          ) : formatCodec === 'gif' ? (
            <span>Output: 192-Color Adaptive GIF</span>
          ) : (
            <>
              <span>Target: {targetSizeMB} MB</span>
              <span className="text-stone-600">|</span>
              <span>~{estimatedVideoKbps} kbps VBR</span>
            </>
          )}
        </div>
      </div>

      {/* 1-Click Quick Output Mode Switcher (Video vs High-FPS GIF vs MP3 Audio) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-[#0c0a09] border border-stone-800/80">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (formatCodec === 'gif' || formatCodec === 'mp3-audio') {
              onFormatCodecChange('mp4-h264');
            }
          }}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            formatCodec !== 'gif' && formatCodec !== 'mp3-audio'
              ? 'bg-stone-800 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-amber-400" />
            <span>Compress Video (MP4/WebM)</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-300">
            H.264 / VP9
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onFormatCodecChange('gif')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            formatCodec === 'gif'
              ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-200 border border-amber-400/50 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Convert to High-FPS GIF</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
            PaletteGen
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onFormatCodecChange('mp3-audio')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            formatCodec === 'mp3-audio'
              ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-200 border border-amber-400/50 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            <span>Extract Audio Only (MP3)</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
            192k MP3
          </span>
        </button>
      </div>

      {/* Six Segmented Platform Preset Buttons */}
      <div
        role="tablist"
        aria-label="Compression Presets"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-[#0c0a09] border border-stone-800/80"
      >
        {presets.map((preset) => {
          const isActive = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              onClick={() => onSelectPreset(preset.id)}
              className={`flex flex-col items-start justify-between p-3.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-amber-500/25 border border-amber-300/50'
                  : 'bg-transparent hover:bg-stone-800/60 text-stone-300 border border-transparent'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-full flex items-center justify-between gap-2 font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <span className={isActive ? 'text-stone-950' : 'text-amber-400'}>
                    {preset.icon}
                  </span>
                  <span>{preset.label}</span>
                </div>
                {preset.badge && (
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-stone-950/20 text-stone-950'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {preset.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-mono ${
                  isActive ? 'text-stone-900 font-semibold' : 'text-stone-400'
                }`}
              >
                {preset.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Custom Slider (1MB to 100MB) */}
      {selectedPreset === 'custom' && (
        <div className="rounded-xl bg-[#0c0a09]/90 border border-amber-500/30 p-4 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <label
              htmlFor="custom-size-slider"
              className="text-xs font-semibold uppercase tracking-wider text-amber-300"
            >
              Custom Target File Size
            </label>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 font-mono text-sm font-bold">
              {customSizeMB} MB
            </span>
          </div>
          <input
            id="custom-size-slider"
            type="range"
            min={1}
            max={100}
            step={0.5}
            value={customSizeMB}
            disabled={disabled}
            onChange={(e) => onCustomSizeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] font-mono text-stone-500">
            <span>1 MB (Ultra Compact)</span>
            <span>25 MB</span>
            <span>50 MB</span>
            <span>75 MB</span>
            <span>100 MB (High Bitrate)</span>
          </div>
        </div>
      )}

      {/* Quick Start/End Video Trimmer Accordion */}
      <div className="border-t border-stone-800/80 pt-3">
        <button
          type="button"
          onClick={() => setTrimmerOpen((prev) => !prev)}
          aria-expanded={trimmerOpen}
          className="w-full flex items-center justify-between py-2 text-xs sm:text-sm font-medium text-stone-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2 flex-wrap">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Quick Video Trimmer (Cut Start / End Dead Air)</span>
            {isTrimActive ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                {formatDuration(trimStart)} &rarr; {formatDuration(effectiveTrimEnd)} (+
                {bitrateBoostPct}% Bitrate Boost)
              </span>
            ) : (
              <span className="text-xs text-stone-500 font-mono">
                (Full Clip • {formatDuration(maxDuration)})
              </span>
            )}
          </span>
          {trimmerOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
          )}
        </button>

        {trimmerOpen && (
          <div className="mt-3 rounded-xl bg-[#0c0a09] border border-stone-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-stone-400">
                Trimming dead air before encoding concentrates your entire MB budget into the
                action frames.
              </p>
              {isTrimActive && (
                <button
                  type="button"
                  onClick={() => onTrimChange(0, maxDuration)}
                  className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 hover:text-amber-200 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Trim
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {previewUrl && (
                <div className="md:col-span-5 rounded-xl overflow-hidden bg-black border border-stone-800">
                  <video
                    ref={videoPreviewRef}
                    src={previewUrl}
                    muted
                    playsInline
                    controls
                    className="w-full aspect-video object-contain"
                  />
                </div>
              )}

              <div
                className={`${
                  previewUrl ? 'md:col-span-7' : 'md:col-span-12'
                } space-y-4`}
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <label htmlFor="trim-start-slider" className="text-stone-300">
                      Start Cut Time
                    </label>
                    <span className="text-amber-300 font-bold">
                      {trimStart.toFixed(1)}s ({formatDuration(trimStart)})
                    </span>
                  </div>
                  <input
                    id="trim-start-slider"
                    type="range"
                    min={0}
                    max={Math.max(0, effectiveTrimEnd - 0.5)}
                    step={0.1}
                    value={trimStart}
                    disabled={disabled}
                    onChange={(e) => {
                      const nextStart = parseFloat(e.target.value);
                      onTrimChange(nextStart, effectiveTrimEnd);
                      seekPreview(nextStart);
                    }}
                    className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <label htmlFor="trim-end-slider" className="text-stone-300">
                      End Cut Time
                    </label>
                    <span className="text-amber-300 font-bold">
                      {effectiveTrimEnd.toFixed(1)}s ({formatDuration(effectiveTrimEnd)})
                    </span>
                  </div>
                  <input
                    id="trim-end-slider"
                    type="range"
                    min={Math.min(maxDuration, trimStart + 0.5)}
                    max={maxDuration}
                    step={0.1}
                    value={effectiveTrimEnd}
                    disabled={disabled}
                    onChange={(e) => {
                      const nextEnd = parseFloat(e.target.value);
                      onTrimChange(trimStart, nextEnd);
                      seekPreview(nextEnd);
                    }}
                    className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-mono text-stone-400">
                  <span>
                    Active Clip Length:{' '}
                    <strong className="text-white">{trimmedDurationSec.toFixed(1)}s</strong> /{' '}
                    {maxDuration.toFixed(1)}s
                  </span>
                  {bitrateBoostPct > 0 && (
                    <span className="text-emerald-400 font-semibold">
                      +{bitrateBoostPct}% higher video kbps!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion for Advanced Settings */}
      <div className="border-t border-stone-800/80 pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          aria-expanded={advancedOpen}
          className="w-full flex items-center justify-between py-2 text-xs sm:text-sm font-medium text-stone-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2 flex-wrap">
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span>Advanced Settings</span>
            <span className="text-xs text-stone-500 font-mono">
              ({formatMeta.label} •{' '}
              {resolution === 'original' ? 'Original Res' : resolution} •{' '}
              {fps === 'original' ? 'Original FPS' : `${fps}fps`} •{' '}
              {multiThreading ? 'Multi-Thread WASM' : 'Single-Thread'})
            </span>
          </span>
          {advancedOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
          )}
        </button>

        {advancedOpen && (
          <div className="mt-3 pt-4 border-t border-stone-800/60 space-y-5">
            {/* Row 1: Output Format & Codec Selector */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Output Format &amp; Video Codec</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {formatOptions.map((item) => {
                  const active = formatCodec === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onFormatCodecChange(item.value)}
                      className={`p-3 rounded-xl border text-left transition ${
                        active
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                          : 'bg-[#0c0a09] border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-300">
                          {item.codec}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Resolution Downscale & Framerate Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
                  Resolution Downscale
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {resolutions.map((item) => {
                    const active = resolution === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onResolutionChange(item.value)}
                        className={`px-3 py-2 rounded-xl border text-left transition ${
                          active
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-[#0c0a09] border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[10px] text-stone-400 truncate mt-0.5">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
                  Framerate Limit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {framerates.map((item) => {
                    const active = fps === item.value;
                    return (
                      <button
                        key={String(item.value)}
                        type="button"
                        disabled={disabled}
                        onClick={() => onFpsChange(item.value)}
                        className={`px-3 py-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                          active
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-[#0c0a09] border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: Multi-Threading Engine Toggle & Audio Track Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-800/60">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onMultiThreadingChange(!multiThreading)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                  multiThreading
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-[#0c0a09] border-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      multiThreading
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      Multi-Threaded WebAssembly (@ffmpeg/core-mt)
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Uses SharedArrayBuffer pthreads for parallel CPU encoding
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    multiThreading
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {multiThreading ? 'Enabled' : 'Single-Core'}
                </span>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onMuteAudioChange(!muteAudio)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                  muteAudio
                    ? 'bg-orange-500/10 border-orange-500/40 text-white'
                    : 'bg-[#0c0a09] border-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      muteAudio
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-stone-800 text-amber-400'
                    }`}
                  >
                    {muteAudio ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      {muteAudio ? 'Mute / Strip Audio Track (-an)' : 'Include Audio Track (128 kbps)'}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {muteAudio
                        ? 'Reallocates +128 kbps budget directly to video quality'
                        : 'Encodes stereo AAC/Opus audio alongside video'}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    muteAudio
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {muteAudio ? 'Muted' : '128k Audio'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
