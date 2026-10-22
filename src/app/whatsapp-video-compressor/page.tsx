import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Free WhatsApp Video Compressor (Under 16MB) — Instant In-Browser',
  description:
    'Compress MP4, MOV, and WebM videos under WhatsApp’s 16MB media limit (15.5 MB target) right on your phone or computer. 100% private WebAssembly with zero cloud uploads.',
  alternates: {
    canonical: '/whatsapp-video-compressor',
  },
  openGraph: {
    title: 'WhatsApp 16MB Video Compressor — 100% Private In-Browser',
    description:
      'Shrink mobile and desktop videos to fit WhatsApp’s 16MB limit in seconds without uploading files to any server.',
    url: 'https://bitvidforge.vercel.app/whatsapp-video-compressor',
  },
};

export default function WhatsAppCompressorPage() {
  return (
    <CompressorStudio
      initialPreset="whatsapp"
      initialFormat="mp4-h264"
      heroTitlePrefix="WhatsApp 16MB"
      heroTitleHighlight="Video Compressor"
      heroDescription="Pre-configured to 15.5 MB so large phone recordings and desktop clips send smoothly on WhatsApp without failing the 16MB media limit — 100% locally in your browser."
    />
  );
}
