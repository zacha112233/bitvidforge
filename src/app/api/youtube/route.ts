import { NextRequest } from 'next/server';

export const runtime = 'edge';

const MAX_YOUTUBE_BYTES = 250 * 1024 * 1024; // 250 MB safety cap for in-browser WASM RAM
const RANGE_CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB range chunks to avoid YouTube CDN throttling

interface YouTubeFormat {
  itag: number;
  url?: string;
  mimeType?: string;
  qualityLabel?: string;
  bitrate?: number;
  contentLength?: string;
  width?: number;
  height?: number;
  audioQuality?: string;
}

interface InnerTubePlayerResponse {
  playabilityStatus?: {
    status?: string;
    reason?: string;
  };
  videoDetails?: {
    videoId?: string;
    title?: string;
    lengthSeconds?: string;
    author?: string;
    isLiveContent?: boolean;
  };
  streamingData?: {
    formats?: YouTubeFormat[];
    adaptiveFormats?: YouTubeFormat[];
  };
}

function extractYouTubeId(rawInput: string): string | null {
  const input = rawInput.trim();
  if (!input) return null;

  // Direct 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const normalized =
      input.startsWith('http://') || input.startsWith('https://')
        ? input
        : `https://${input}`;
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (
      host === 'youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;

      const parts = url.pathname.split('/').filter(Boolean);
      if (
        parts.length >= 2 &&
        ['shorts', 'embed', 'live', 'v', 'clips'].includes(parts[0])
      ) {
        const candidate = parts[1];
        if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) return candidate;
      }
    }
  } catch {
    // Fall through to regex
  }

  const regexMatch = input.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return regexMatch ? regexMatch[1] : null;
}

async function fetchVisitorData(): Promise<string | undefined> {
  try {
    const res = await fetch('https://www.youtube.com/sw.js_data', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return undefined;
    const text = await res.text();
    const match = text.match(/"(Cg[a-zA-Z0-9_%-]+)"/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

const CLIENT_PROFILES = [
  {
    clientName: 'ANDROID',
    clientVersion: '20.03.32',
    androidSdkVersion: 34,
    osName: 'Android',
    osVersion: '14',
    userAgent: 'com.google.android.youtube/20.03.32 (Linux; U; Android 14) gzip',
  },
  {
    clientName: 'ANDROID_TESTSUITE',
    clientVersion: '1.9',
    androidSdkVersion: 30,
    osName: 'Android',
    osVersion: '11',
    userAgent: 'com.google.android.youtube/1.9 (Linux; U; Android 11) gzip',
  },
  {
    clientName: 'IOS',
    clientVersion: '20.03.02',
    deviceMake: 'Apple',
    deviceModel: 'iPhone16,2',
    osName: 'iPhone',
    osVersion: '18.2.1.22C161',
    userAgent:
      'com.google.ios.youtube/20.03.02 (iPhone16,2; U; CPU iOS 18_2_1 like Mac OS X;)',
  },
];

function sanitizeFilename(title: string, videoId: string): string {
  const cleaned = title
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64);
  return cleaned || `youtube_${videoId}`;
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url') || '';
  const videoId = extractYouTubeId(rawUrl);

  if (!videoId) {
    return Response.json(
      {
        error:
          'Invalid YouTube URL. Please paste a valid youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/... link.',
      },
      { status: 400 }
    );
  }

  try {
    const visitorData = await fetchVisitorData();
    let selectedFormat: YouTubeFormat | null = null;
    let selectedUserAgent = CLIENT_PROFILES[0].userAgent;
    let videoTitle = `youtube_${videoId}`;
    let lengthSeconds = '0';
    let author = '';
    let lastReason = 'Could not resolve playable MP4 stream for this YouTube video.';

    for (const profile of CLIENT_PROFILES) {
      const playerRes = await fetch(
        'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': profile.userAgent,
            ...(visitorData ? { 'X-Goog-Visitor-Id': visitorData } : {}),
          },
          body: JSON.stringify({
            videoId,
            contentCheckOk: true,
            racyCheckOk: true,
            context: {
              client: {
                clientName: profile.clientName,
                clientVersion: profile.clientVersion,
                androidSdkVersion: profile.androidSdkVersion,
                deviceMake: profile.deviceMake,
                deviceModel: profile.deviceModel,
                osName: profile.osName,
                osVersion: profile.osVersion,
                visitorData,
                hl: 'en',
                gl: 'US',
              },
            },
          }),
        }
      );

      if (!playerRes.ok) continue;
      const data = (await playerRes.json()) as InnerTubePlayerResponse;

      if (data.videoDetails?.isLiveContent) {
        return Response.json(
          {
            error:
              'Live streams cannot be imported directly. Please use a standard uploaded YouTube video or Short.',
          },
          { status: 422 }
        );
      }

      if (data.playabilityStatus?.status !== 'OK') {
        if (data.playabilityStatus?.reason) {
          lastReason = data.playabilityStatus.reason;
        }
        continue;
      }

      videoTitle = data.videoDetails?.title || videoTitle;
      lengthSeconds = data.videoDetails?.lengthSeconds || '0';
      author = data.videoDetails?.author || '';

      // Prefer pre-muxed MP4 formats (contains both H.264 video + AAC audio so MP3 extraction, GIF, and video compression all work seamlessly)
      const muxedMp4s = (data.streamingData?.formats || []).filter(
        (f) => f.url && f.mimeType?.includes('video/mp4')
      );

      if (muxedMp4s.length > 0) {
        // Pick highest resolution muxed MP4
        muxedMp4s.sort((a, b) => (b.height || 0) - (a.height || 0));
        selectedFormat = muxedMp4s[0];
        selectedUserAgent = profile.userAgent;
        break;
      }

      // Fallback: adaptive H.264 MP4 up to 720p
      const adaptiveMp4s = (data.streamingData?.adaptiveFormats || []).filter(
        (f) =>
          f.url &&
          f.mimeType?.includes('video/mp4') &&
          f.mimeType?.includes('avc1') &&
          (f.height || 0) <= 720
      );
      if (adaptiveMp4s.length > 0) {
        adaptiveMp4s.sort((a, b) => (b.height || 0) - (a.height || 0));
        selectedFormat = adaptiveMp4s[0];
        selectedUserAgent = profile.userAgent;
        break;
      }
    }

    if (!selectedFormat || !selectedFormat.url) {
      return Response.json(
        {
          error: `${lastReason} (Note: Private, age-restricted, or region-locked videos cannot be imported.)`,
        },
        { status: 422 }
      );
    }

    const streamUrl = selectedFormat.url;

    // Probe total byte length using a 2-byte range request
    const probeRes = await fetch(streamUrl, {
      headers: {
        'User-Agent': selectedUserAgent,
        Range: 'bytes=0-1',
      },
    });

    if (!probeRes.ok && probeRes.status !== 206) {
      return Response.json(
        {
          error: `Upstream video stream returned HTTP ${probeRes.status}. Please try another link.`,
        },
        { status: 502 }
      );
    }

    await probeRes.arrayBuffer();
    const contentRange = probeRes.headers.get('content-range') || '';
    const rangeTotalMatch = contentRange.match(/\/(\d+)$/);
    const totalBytes = rangeTotalMatch
      ? parseInt(rangeTotalMatch[1], 10)
      : parseInt(selectedFormat.contentLength || '0', 10);

    if (!totalBytes || Number.isNaN(totalBytes)) {
      return Response.json(
        { error: 'Unable to determine YouTube video stream size.' },
        { status: 502 }
      );
    }

    if (totalBytes > MAX_YOUTUBE_BYTES) {
      const sizeMB = (totalBytes / (1024 * 1024)).toFixed(1);
      return Response.json(
        {
          error: `This YouTube video is ${sizeMB} MB, which exceeds the 250 MB in-browser memory cap for direct URL imports.`,
        },
        { status: 413 }
      );
    }

    const safeFileBase = sanitizeFilename(videoTitle, videoId);

    // Stream video in 8MB byte-range chunks to prevent YouTube CDN bandwidth throttling
    let currentOffset = 0;
    const readableStream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (currentOffset >= totalBytes) {
          controller.close();
          return;
        }

        const endByte = Math.min(
          currentOffset + RANGE_CHUNK_SIZE - 1,
          totalBytes - 1
        );

        try {
          const chunkRes = await fetch(streamUrl, {
            headers: {
              'User-Agent': selectedUserAgent,
              Range: `bytes=${currentOffset}-${endByte}`,
            },
          });

          if (!chunkRes.ok && chunkRes.status !== 206) {
            controller.error(
              new Error(`Stream chunk failed with status ${chunkRes.status}`)
            );
            return;
          }

          if (!chunkRes.body) {
            const buf = new Uint8Array(await chunkRes.arrayBuffer());
            currentOffset += buf.byteLength;
            controller.enqueue(buf);
            if (currentOffset >= totalBytes) {
              controller.close();
            }
            return;
          }

          const reader = chunkRes.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              currentOffset += value.byteLength;
              controller.enqueue(value);
            }
          }

          if (currentOffset >= totalBytes) {
            controller.close();
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(totalBytes),
        'Content-Disposition': `attachment; filename="${safeFileBase}.mp4"`,
        'X-Video-Title': encodeURIComponent(videoTitle),
        'X-Video-Filename': encodeURIComponent(`${safeFileBase}.mp4`),
        'X-Video-Duration': String(lengthSeconds),
        'X-Video-Author': encodeURIComponent(author),
        'X-Video-Id': videoId,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unexpected error while importing YouTube video.',
      },
      { status: 500 }
    );
  }
}
