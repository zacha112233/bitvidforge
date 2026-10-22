import type { Metadata } from 'next';
import { CompressorStudio } from '@/app/page';

export const metadata: Metadata = {
  title: 'Compress Video for Email Attachments (Gmail & Outlook <10MB) Free',
  description:
    'Shrink large MP4, MOV, and WebM videos under 10MB so they attach directly to Gmail, Outlook, and Apple Mail without cloud links. 100% private in-browser compression.',
  alternates: {
    canonical: '/compress-video-for-email',
  },
  openGraph: {
    title: 'Compress Video for Email Attachments (<10MB) — Zero Upload',
    description:
      'Make any video small enough to send as a direct Gmail or Outlook attachment in seconds — 100% private on your device.',
    url: 'https://bitvidforge.vercel.app/compress-video-for-email',
  },
};

export default function EmailCompressorPage() {
  return (
    <CompressorStudio
      initialPreset="email"
      initialFormat="mp4-h264"
      heroTitlePrefix="Shrink Videos for"
      heroTitleHighlight="Email Attachments"
      heroDescription="Targets a safe 9.5 MB cap so your MP4, MOV, or WebM recordings attach directly to Gmail, Outlook, and Apple Mail — with zero cloud uploads required."
    />
  );
}
