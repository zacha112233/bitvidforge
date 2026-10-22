import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'YouTube to MP3 Audio Extractor & Trimmer (192 kbps) — BitVidForge',
  description:
    'Extract a clean 192 kbps stereo MP3 audio file from any permitted YouTube video or Shorts link. Includes built-in start/end timestamp trimming in WebAssembly.',
  alternates: {
    canonical: '/youtube-to-mp3',
  },
  openGraph: {
    title: 'YouTube to 192 kbps MP3 Audio Extractor & Trimmer — BitVidForge',
    description:
      'Import a permitted YouTube link into browser RAM, optionally trim start/end timestamps, and extract a 192 kbps stereo MP3.',
    url: 'https://bitvidforge.vercel.app/youtube-to-mp3',
  },
};

export default function YoutubeToMp3Page() {
  return (
    <CompressorStudio
      initialPreset="discord"
      initialFormat="mp3-audio"
      heroTitlePrefix="YouTube to"
      heroTitleHighlight="192 kbps MP3"
      heroDescription="Paste a permitted YouTube video or Shorts link, optionally trim start and end timestamps, and extract a clean 192 kbps stereo MP3 audio file in your browser."
    />
  );
}
