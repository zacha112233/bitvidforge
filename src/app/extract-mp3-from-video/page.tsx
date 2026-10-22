import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Extract MP3 Audio from Video in Browser — Free & Private (192kbps)',
  description:
    'Strip video and extract clean 192 kbps stereo MP3 audio from any MP4, MOV, or WebM file locally in your browser. Zero server uploads, no signups, instant download.',
  alternates: {
    canonical: '/extract-mp3-from-video',
  },
  openGraph: {
    title: 'Extract MP3 Audio from Video — 100% In-Browser WebAssembly',
    description:
      'Convert MP4, MOV, or WebM video files to 192 kbps stereo MP3 audio locally on your device in seconds.',
    url: 'https://bitvidforge.vercel.app/extract-mp3-from-video',
  },
};

export default function ExtractMp3Page() {
  return (
    <CompressorStudio
      initialPreset="discord"
      initialFormat="mp3-audio"
      heroTitlePrefix="Extract 192kbps"
      heroTitleHighlight="MP3 from Video"
      heroDescription="Strip the video stream and export a clean 192 kbps stereo MP3 audio file from any MP4, MOV, or WebM recording in seconds — 100% locally in your browser."
    />
  );
}
