'use client';

import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export type ResolutionOption = 'original' | '1080p' | '720p' | '480p';
export type FramerateOption = 'original' | 30 | 60;
export type OutputFormatOption = 'mp4-h264' | 'webm-vp9' | 'mp4-mpeg4';

export interface AdvancedCompressOptions {
  resolution?: ResolutionOption;
  fps?: FramerateOption;
  formatCodec?: OutputFormatOption;
  muteAudio?: boolean;
  multiThreading?: boolean;
  durationSeconds?: number;
}

export type ProcessingStage =
  | 'idle'
  | 'reading'
  | 'encoding'
  | 'packaging'
  | 'completed'
  | 'cancelled';

export interface BitrateMetadata {
  durationSeconds: number;
  targetSizeKilobits: number;
  audioBitrateKbps: number;
  videoBitrateKbps: number;
  threads: number;
  formatCodec: OutputFormatOption;
}

const UNPKG_CORE_ST_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
const UNPKG_CORE_MT_URL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
const DEFAULT_AUDIO_BITRATE_KBPS = 128;

export function getFormatMetadata(formatCodec: OutputFormatOption = 'mp4-h264'): {
  ext: string;
  mimeType: string;
  label: string;
  codecLabel: string;
} {
  switch (formatCodec) {
    case 'webm-vp9':
      return {
        ext: '.webm',
        mimeType: 'video/webm',
        label: 'WebM (VP9)',
        codecLabel: 'VP9 + Opus',
      };
    case 'mp4-mpeg4':
      return {
        ext: '.mp4',
        mimeType: 'video/mp4',
        label: 'MP4 (MPEG-4 Fast)',
        codecLabel: 'MPEG-4 + AAC',
      };
    case 'mp4-h264':
    default:
      return {
        ext: '.mp4',
        mimeType: 'video/mp4',
        label: 'MP4 (H.264)',
        codecLabel: 'H.264 + AAC',
      };
  }
}

/**
 * Extracts duration in seconds from a video File using an off-DOM HTML5 video element.
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve(10);
    }, 4000);

    video.onloadedmetadata = () => {
      window.clearTimeout(timeoutId);
      const duration =
        Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10;
      cleanup();
      resolve(duration);
    };

    video.onerror = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      resolve(10);
    };

    video.src = objectUrl;
  });
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedModeRef = useRef<'mt' | 'st' | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMultiThreaded, setIsMultiThreaded] = useState<boolean>(false);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bitrateInfo, setBitrateInfo] = useState<BitrateMetadata | null>(null);

  const appendLog = useCallback((message: string) => {
    setLogs((prev) => [...prev.slice(-149), message]);
  }, []);

  const createConfiguredFFmpeg = useCallback(() => {
    const instance = new FFmpeg();
    instance.on('log', ({ message }) => {
      appendLog(message);
    });
    instance.on('progress', ({ progress: rawProgress }) => {
      const clamped = Math.max(
        0,
        Math.min(1, Number.isFinite(rawProgress) ? rawProgress : 0)
      );
      const pct = Math.round(clamped * 100);
      setProgress((prev) => Math.min(96, Math.max(prev, pct)));
    });
    return instance;
  }, [appendLog]);

  const load = useCallback(
    async (preferMultiThread: boolean = true): Promise<{ ffmpeg: FFmpeg; mtActive: boolean }> => {
      const canUseMT =
        preferMultiThread &&
        typeof window !== 'undefined' &&
        typeof SharedArrayBuffer !== 'undefined' &&
        Boolean(window.crossOriginIsolated);

      const desiredMode: 'mt' | 'st' = canUseMT ? 'mt' : 'st';

      if (
        ffmpegRef.current &&
        ffmpegRef.current.loaded &&
        loadedModeRef.current === desiredMode
      ) {
        setIsLoaded(true);
        setIsMultiThreaded(desiredMode === 'mt');
        return { ffmpeg: ffmpegRef.current, mtActive: desiredMode === 'mt' };
      }

      if (ffmpegRef.current) {
        try {
          ffmpegRef.current.terminate();
        } catch {
          // ignore
        }
        ffmpegRef.current = null;
        loadedModeRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

        // Create an absolute Blob URL for classWorkerURL so Webpack's `file://` import.meta.url base is bypassed
        const classWorkerURL = await toBlobURL(
          `${origin}/ffmpeg/worker.js`,
          'text/javascript'
        );

        if (canUseMT) {
          appendLog(
            '[System] Loading Multi-Threaded FFmpeg WebAssembly core (@ffmpeg/core-mt)...'
          );
          try {
            const mtFFmpeg = createConfiguredFFmpeg();
            let coreURL: string;
            let wasmURL: string;
            let workerURL: string;

            try {
              coreURL = await toBlobURL(
                `${UNPKG_CORE_MT_URL}/ffmpeg-core.js`,
                'text/javascript'
              );
              wasmURL = await toBlobURL(
                `${UNPKG_CORE_MT_URL}/ffmpeg-core.wasm`,
                'application/wasm'
              );
              workerURL = await toBlobURL(
                `${UNPKG_CORE_MT_URL}/ffmpeg-core.worker.js`,
                'text/javascript'
              );
              appendLog('[System] Loaded @ffmpeg/core-mt ESM via unpkg CDN Blob URLs.');
            } catch {
              appendLog(
                '[System] External CDN unreachable; loading local /ffmpeg-mt core via toBlobURL...'
              );
              coreURL = await toBlobURL(
                `${origin}/ffmpeg-mt/ffmpeg-core.js`,
                'text/javascript'
              );
              wasmURL = await toBlobURL(
                `${origin}/ffmpeg-mt/ffmpeg-core.wasm`,
                'application/wasm'
              );
              workerURL = await toBlobURL(
                `${origin}/ffmpeg-mt/ffmpeg-core.worker.js`,
                'text/javascript'
              );
            }

            await mtFFmpeg.load({
              coreURL,
              wasmURL,
              workerURL,
              classWorkerURL,
            });

            ffmpegRef.current = mtFFmpeg;
            loadedModeRef.current = 'mt';
            setIsMultiThreaded(true);
            setIsLoaded(true);
            appendLog(
              '[System] Multi-Threaded FFmpeg WebAssembly engine ready (Pthreads + SIMD).'
            );
            return { ffmpeg: mtFFmpeg, mtActive: true };
          } catch (mtErr) {
            appendLog(
              `[System] Multi-threaded initialization fallback (${mtErr instanceof Error ? mtErr.message : 'switching to ST'})...`
            );
          }
        }

        appendLog('[System] Initializing Single-Threaded FFmpeg WebAssembly core...');
        const stFFmpeg = createConfiguredFFmpeg();
        let coreURL: string;
        let wasmURL: string;

        try {
          coreURL = await toBlobURL(
            `${UNPKG_CORE_ST_URL}/ffmpeg-core.js`,
            'text/javascript'
          );
          wasmURL = await toBlobURL(
            `${UNPKG_CORE_ST_URL}/ffmpeg-core.wasm`,
            'application/wasm'
          );
          appendLog('[System] Loaded @ffmpeg/core ESM via unpkg CDN Blob URLs.');
        } catch {
          appendLog(
            '[System] External CDN unreachable; loading local /ffmpeg core via toBlobURL...'
          );
          coreURL = await toBlobURL(
            `${origin}/ffmpeg/ffmpeg-core.js`,
            'text/javascript'
          );
          wasmURL = await toBlobURL(
            `${origin}/ffmpeg/ffmpeg-core.wasm`,
            'application/wasm'
          );
        }

        await stFFmpeg.load({
          coreURL,
          wasmURL,
          classWorkerURL,
        });

        ffmpegRef.current = stFFmpeg;
        loadedModeRef.current = 'st';
        setIsMultiThreaded(false);
        setIsLoaded(true);
        appendLog('[System] Single-Threaded FFmpeg WebAssembly engine ready.');
        return { ffmpeg: stFFmpeg, mtActive: false };
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to initialize FFmpeg WebAssembly.';
        setError(msg);
        appendLog(`[Error] ${msg}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [appendLog, createConfiguredFFmpeg]
  );

  const cancelCompression = useCallback(() => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (ffmpegRef.current) {
      try {
        ffmpegRef.current.terminate();
      } catch {
        // ignore termination error
      }
      ffmpegRef.current = null;
      loadedModeRef.current = null;
    }
    setIsLoaded(false);
    setIsLoading(false);
    setIsProcessing(false);
    setStage('cancelled');
    setProgress(0);
    appendLog('[Cancel] Transcoding aborted by user — WebAssembly worker terminated.');
  }, [appendLog]);

  const compressVideo = useCallback(
    async (
      file: File,
      targetSizeMB: number,
      options?: AdvancedCompressOptions
    ): Promise<Blob> => {
      isCancelledRef.current = false;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setError(null);
      setIsProcessing(true);
      setProgress(2);
      setStage('reading');
      setLogs([]);

      const preferMT = options?.multiThreading !== false;
      const formatCodec: OutputFormatOption = options?.formatCodec || 'mp4-h264';
      const formatMeta = getFormatMetadata(formatCodec);
      const muteAudio = Boolean(options?.muteAudio);

      const { ffmpeg, mtActive } = await load(preferMT);

      const extMatch = file.name.match(/\.[0-9a-z]+$/i);
      const inputExt = extMatch ? extMatch[0].toLowerCase() : '.mp4';
      const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const inputFileName = `input_${uniqueId}${inputExt}`;
      const outputFileName = `output_${uniqueId}${formatMeta.ext}`;

      try {
        appendLog(
          `[FS] Reading local file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`
        );

        const durationSeconds =
          options?.durationSeconds && options.durationSeconds > 0
            ? options.durationSeconds
            : await getVideoDuration(file);

        // Formula: Target Bitrate (kbps) = (Target Size in Kilobits / Video Duration in Seconds) - Audio Bitrate (128 kbps)
        const audioBitrateKbps = muteAudio ? 0 : DEFAULT_AUDIO_BITRATE_KBPS;
        const targetSizeKilobits = targetSizeMB * 1024 * 8;
        const rawVideoBitrateKbps = Math.floor(
          targetSizeKilobits / durationSeconds - audioBitrateKbps
        );
        const videoBitrateKbps = Math.max(100, rawVideoBitrateKbps);
        const maxrateKbps = Math.floor(videoBitrateKbps * 1.15);
        const bufsizeKbps = Math.floor(videoBitrateKbps * 2);

        const threadCount = mtActive
          ? Math.min(
              4,
              typeof navigator !== 'undefined' && navigator.hardwareConcurrency
                ? navigator.hardwareConcurrency
                : 4
            )
          : 1;

        setBitrateInfo({
          durationSeconds,
          targetSizeKilobits,
          audioBitrateKbps,
          videoBitrateKbps,
          threads: threadCount,
          formatCodec,
        });

        appendLog(
          `[Bitrate] Duration: ${durationSeconds.toFixed(2)}s | Target: ${targetSizeMB.toFixed(2)} MB (${Math.round(targetSizeKilobits)} kb)`
        );
        appendLog(
          `[Bitrate] Formula: (${Math.round(targetSizeKilobits)} kb / ${durationSeconds.toFixed(2)}s) - ${audioBitrateKbps} kbps = ${videoBitrateKbps} kbps video`
        );
        appendLog(
          `[Engine] Mode: ${mtActive ? `Multi-Threaded (${threadCount} threads)` : 'Single-Threaded'} | Output: ${formatMeta.label}`
        );

        const fileData = await fetchFile(file);
        await ffmpeg.writeFile(inputFileName, fileData, {
          signal: abortController.signal,
        });
        setProgress(10);

        setStage('encoding');
        appendLog(`[Transcode] Encoding ${formatMeta.codecLabel} via WebAssembly...`);

        const ffmpegArgs: string[] = ['-i', inputFileName];

        if (mtActive && threadCount > 1) {
          ffmpegArgs.push('-threads', String(threadCount));
        }

        // Resolution downscale filter
        if (options?.resolution && options.resolution !== 'original') {
          const heightMap: Record<Exclude<ResolutionOption, 'original'>, number> = {
            '1080p': 1080,
            '720p': 720,
            '480p': 480,
          };
          const targetHeight = heightMap[options.resolution];
          ffmpegArgs.push('-vf', `scale=-2:${targetHeight}`);
          appendLog(
            `[Filter] Downscaling resolution to ${options.resolution} (scale=-2:${targetHeight})`
          );
        }

        // Framerate cap
        if (options?.fps && options.fps !== 'original') {
          ffmpegArgs.push('-r', String(options.fps));
          appendLog(`[Filter] Limiting framerate to ${options.fps} fps`);
        }

        // Codec-specific encoding flags
        if (formatCodec === 'webm-vp9') {
          ffmpegArgs.push(
            '-c:v',
            'libvpx-vp9',
            '-b:v',
            `${videoBitrateKbps}k`,
            '-maxrate',
            `${maxrateKbps}k`,
            '-bufsize',
            `${bufsizeKbps}k`,
            '-deadline',
            'realtime',
            '-cpu-used',
            '8',
            '-row-mt',
            '1',
            '-pix_fmt',
            'yuv420p'
          );
          if (muteAudio) {
            ffmpegArgs.push('-an');
          } else {
            ffmpegArgs.push('-c:a', 'libopus', '-b:a', `${audioBitrateKbps}k`);
          }
          ffmpegArgs.push(outputFileName);
        } else if (formatCodec === 'mp4-mpeg4') {
          ffmpegArgs.push(
            '-c:v',
            'mpeg4',
            '-b:v',
            `${videoBitrateKbps}k`,
            '-maxrate',
            `${maxrateKbps}k`,
            '-bufsize',
            `${bufsizeKbps}k`,
            '-pix_fmt',
            'yuv420p'
          );
          if (muteAudio) {
            ffmpegArgs.push('-an');
          } else {
            ffmpegArgs.push('-c:a', 'aac', '-b:a', `${audioBitrateKbps}k`);
          }
          ffmpegArgs.push('-movflags', '+faststart', outputFileName);
        } else {
          // Default: mp4-h264
          ffmpegArgs.push(
            '-c:v',
            'libx264',
            '-preset',
            'ultrafast',
            '-b:v',
            `${videoBitrateKbps}k`,
            '-maxrate',
            `${maxrateKbps}k`,
            '-bufsize',
            `${bufsizeKbps}k`,
            '-pix_fmt',
            'yuv420p'
          );
          if (muteAudio) {
            ffmpegArgs.push('-an');
          } else {
            ffmpegArgs.push('-c:a', 'aac', '-b:a', `${audioBitrateKbps}k`);
          }
          ffmpegArgs.push('-movflags', '+faststart', outputFileName);
        }

        const exitCode = await ffmpeg.exec(ffmpegArgs, -1, {
          signal: abortController.signal,
        });
        if (exitCode !== 0) {
          throw new Error(`FFmpeg exited with code ${exitCode}`);
        }

        setStage('packaging');
        setProgress(98);
        appendLog(
          `[Package] Packaging ${formatMeta.ext.toUpperCase().slice(1)} container & reading from virtual FS...`
        );

        const outputData = await ffmpeg.readFile(outputFileName, 'binary', {
          signal: abortController.signal,
        });
        const uint8Array =
          outputData instanceof Uint8Array
            ? outputData
            : new TextEncoder().encode(outputData as string);

        const outputBlob = new Blob([uint8Array.slice().buffer], {
          type: formatMeta.mimeType,
        });

        setProgress(100);
        setStage('completed');
        appendLog(
          `[Complete] Output ready: ${(outputBlob.size / (1024 * 1024)).toFixed(2)} MB (${formatMeta.label})`
        );

        return outputBlob;
      } catch (err) {
        if (
          isCancelledRef.current ||
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.message.toLowerCase().includes('terminated'))
        ) {
          setStage('cancelled');
          throw new Error('Transcoding cancelled by user.');
        }
        const msg =
          err instanceof Error ? err.message : 'An error occurred during video compression.';
        setError(msg);
        appendLog(`[Error] ${msg}`);
        setStage('idle');
        throw err;
      } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
        if (ffmpegRef.current && ffmpegRef.current.loaded) {
          try {
            await ffmpegRef.current.deleteFile(inputFileName);
            appendLog(`[Cleanup] Deleted virtual file: ${inputFileName}`);
          } catch {
            // Ignore if input file was not written
          }
          try {
            await ffmpegRef.current.deleteFile(outputFileName);
            appendLog(`[Cleanup] Deleted virtual file: ${outputFileName}`);
          } catch {
            // Ignore if output file was not created
          }
        }
      }
    },
    [load, appendLog]
  );

  const resetState = useCallback(() => {
    setProgress(0);
    setStage('idle');
    setError(null);
    setLogs([]);
    setBitrateInfo(null);
  }, []);

  return {
    isLoaded,
    isLoading,
    isProcessing,
    isMultiThreaded,
    stage,
    progress,
    logs,
    error,
    bitrateInfo,
    load,
    compressVideo,
    cancelCompression,
    resetState,
  };
}
