import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Mute Video Online — Remove Audio from MP4, MOV & WebM in Browser',
  description:
    'Strip background noise and remove the audio track (-an) from any MP4, MOV, or WebM video locally in your browser. Zero cloud uploads, instant processing, no watermarks.',
  alternates: {
    canonical: '/mute-video-online',
  },
  openGraph: {
    title: 'Remove Audio from Video in Browser — 100% Private & Instant',
    description:
      'Mute any MP4, MOV, or WebM video and reallocate 100% of the audio bitrate budget into sharper video quality — locally in WebAssembly.',
    url: 'https://bitvidforge.vercel.app/mute-video-online',
  },
};

export default function MuteVideoPage() {
  return (
    <CompressorStudio
      initialPreset="web"
      initialFormat="mp4-h264"
      initialMuteAudio={true}
      heroTitlePrefix="Remove Audio &"
      heroTitleHighlight="Mute Video Locally"
      heroDescription="Pre-configured with audio stripping (-an) enabled to remove unwanted background mic noise and reallocate +128 kbps directly into sharper video quality — zero uploads."
    />
  );
}
