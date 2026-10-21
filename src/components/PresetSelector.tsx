'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  FramerateOption,
  OutputFormatOption,
  ResolutionOption,
  getFormatMetadata,
} from '@/hooks/useFFmpeg';

export type PresetId = 'discord' | 'email' | 'web' | 'custom';

interface PresetSelectorProps {
  selectedPreset: PresetId;
  targetSizeMB: number;
  customSizeMB: number;
  originalSizeMB: number | null;
  videoDuration: number | null;
  resolution: ResolutionOption;
  fps: FramerateOption;
  formatCodec: OutputFormatOption;
  muteAudio: boolean;
  multiThreading: boolean;
  onSelectPreset: (preset: PresetId) => void;
  onCustomSizeChange: (sizeMB: number) => void;
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
  resolution,
  fps,
  formatCodec,
  muteAudio,
  multiThreading,
  onSelectPreset,
  onCustomSizeChange,
  onResolutionChange,
  onFpsChange,
  onFormatCodecChange,
  onMuteAudioChange,
  onMultiThreadingChange,
  disabled = false,
}: PresetSelectorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const webTargetMB = originalSizeMB
    ? Math.max(0.5, Number((originalSizeMB * 0.3).toFixed(2)))
    : 3.0;

  const durationSec = videoDuration && videoDuration > 0 ? videoDuration : 10;
  const targetKilobits = targetSizeMB * 1024 * 8;
  const audioKbps = muteAudio ? 0 : 128;
  const estimatedVideoKbps = Math.max(
    100,
    Math.floor(targetKilobits / durationSec - audioKbps)
  );

  const formatMeta = getFormatMetadata(formatCodec);

  const presets: {
    id: PresetId;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'discord',
      label: 'Discord / Slack',
      sublabel: '24 MB Target',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'email',
      label: 'Email Attachment',
      sublabel: '9.5 MB Target',
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: 'web',
      label: 'Web Optimized',
      sublabel: originalSizeMB ? `70% Reduction (${webTargetMB} MB)` : '70% Reduction Target',
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
  ];

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#11151f] p-5 sm:p-6 shadow-lg space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Intent-Based Target Preset
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select how you plan to share the video or dial in a custom size cap.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-indigo-300">
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span>Target: {targetSizeMB} MB</span>
          <span className="text-slate-600">|</span>
          <span>~{estimatedVideoKbps} kbps VBR</span>
        </div>
      </div>

      {/* Four Segmented Pill Buttons */}
      <div
        role="tablist"
        aria-label="Compression Presets"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-[#090b10] border border-slate-800/80"
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/40'
                  : 'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-transparent'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className={isActive ? 'text-white' : 'text-indigo-400'}>
                  {preset.icon}
                </span>
                <span>{preset.label}</span>
              </div>
              <span
                className={`text-xs mt-1.5 font-mono ${
                  isActive ? 'text-indigo-100' : 'text-slate-400'
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
        <div className="rounded-xl bg-[#090b10]/90 border border-indigo-500/30 p-4 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <label
              htmlFor="custom-size-slider"
              className="text-xs font-semibold uppercase tracking-wider text-indigo-300"
            >
              Custom Target File Size
            </label>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 font-mono text-sm font-bold">
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
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>1 MB (Ultra Compact)</span>
            <span>25 MB</span>
            <span>50 MB</span>
            <span>75 MB</span>
            <span>100 MB (High Bitrate)</span>
          </div>
        </div>
      )}

      {/* Accordion for Advanced Settings */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          aria-expanded={advancedOpen}
          className="w-full flex items-center justify-between py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition"
        >
          <span className="flex items-center gap-2 flex-wrap">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <span>Advanced Settings</span>
            <span className="text-xs text-slate-500 font-mono">
              ({formatMeta.label} •{' '}
              {resolution === 'original' ? 'Original Res' : resolution} •{' '}
              {fps === 'original' ? 'Original FPS' : `${fps}fps`} •{' '}
              {multiThreading ? 'Multi-Thread WASM' : 'Single-Thread'})
            </span>
          </span>
          {advancedOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {advancedOpen && (
          <div className="mt-3 pt-4 border-t border-slate-800/60 space-y-5">
            {/* Row 1: Output Format & Codec Selector */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
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
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-[#090b10] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                          {item.codec}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Resolution Downscale & Framerate Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
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
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-[#090b10] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
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
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-[#090b10] border-slate-800 text-slate-300 hover:border-slate-700'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onMultiThreadingChange(!multiThreading)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                  multiThreading
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-[#090b10] border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      multiThreading
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      Multi-Threaded WebAssembly (@ffmpeg/core-mt)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Uses SharedArrayBuffer pthreads for parallel CPU encoding
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    multiThreading
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
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
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-[#090b10] border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      muteAudio
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-indigo-400'
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
                    <div className="text-[11px] text-slate-400">
                      {muteAudio
                        ? 'Reallocates +128 kbps budget directly to video quality'
                        : 'Encodes stereo AAC/Opus audio alongside video'}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    muteAudio
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
