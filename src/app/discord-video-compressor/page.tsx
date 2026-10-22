import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Free Discord Video Compressor (Under 10MB & 50MB Nitro) — No Upload',
  description:
    'Shrink any MP4, MOV, or WebM video to fit Discord’s 10MB free upload limit (9.5 MB safe target) or 50MB Nitro cap in seconds. 100% private in-browser WebAssembly video compressor & trimmer.',
  alternates: {
    canonical: '/discord-video-compressor',
  },
  openGraph: {
    title: 'Free Discord 10MB Video Compressor — Instant & 100% In-Browser',
    description:
      'Compress large gameplay clips and recordings under 10MB for Discord with zero server uploads and built-in dead-air trimming.',
    url: 'https://bitvidforge.vercel.app/discord-video-compressor',
  },
};

export default function DiscordCompressorPage() {
  return (
    <CompressorStudio
      initialPreset="discord"
      initialFormat="mp4-h264"
      heroTitlePrefix="Discord 10MB"
      heroTitleHighlight="Video Compressor"
      heroDescription="Automatically targets 9.5 MB so your MP4, MOV, or WebM clips pass Discord's 10MB free upload limit on the first try — with built-in dead-air trimming and zero server uploads."
    />
  );
}
