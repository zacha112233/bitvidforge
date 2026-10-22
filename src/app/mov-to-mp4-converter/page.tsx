import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Convert MOV to MP4 in Browser (iPhone & Mac Screen Recordings) — No Upload',
  description:
    'Convert large Apple QuickTime (.mov) videos from iPhone or macOS into universal H.264 MP4 files locally in your browser. Shrink file size by 70% with zero server uploads.',
  alternates: {
    canonical: '/mov-to-mp4-converter',
  },
  openGraph: {
    title: 'Free MOV to MP4 Converter & Compressor — 100% In-Browser WebAssembly',
    description:
      'Convert iPhone and Mac .MOV recordings to universally compatible .MP4 files locally on your device with zero uploads.',
    url: 'https://bitvidforge.vercel.app/mov-to-mp4-converter',
  },
};

export default function MovToMp4Page() {
  return (
    <CompressorStudio
      initialPreset="web"
      initialFormat="mp4-h264"
      heroTitlePrefix="Convert MOV to"
      heroTitleHighlight="MP4 in Browser"
      heroDescription="Turn large iPhone and macOS QuickTime (.mov) screen recordings into universally compatible H.264 MP4 videos while shrinking file size by 70% — 100% locally with zero uploads."
    />
  );
}
