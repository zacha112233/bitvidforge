import React from 'react';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bitvidforge.vercel.app';

export const FAQ_ITEMS = [
  {
    question: "How do I compress a video for Discord's 10MB limit without losing quality?",
    answer:
      "Select the 'Discord Free (<10MB Cap)' preset in BitVidForge (which targets 9.5 MB for a safe margin). For the sharpest quality, open the built-in Quick Video Trimmer to cut any extra seconds at the start or end of your clip—BitVidForge automatically reallocates 100% of that saved megabyte budget into a higher video bitrate (kbps) for the remaining frames.",
  },
  {
    question: 'Does BitVidForge upload my videos to a cloud server?',
    answer:
      'No. BitVidForge runs 100% locally inside your web browser using multi-threaded WebAssembly (@ffmpeg/ffmpeg v0.12 with SharedArrayBuffer pthreads and SIMD). Zero bytes of your media ever leave your device, and a live network egress monitor in the header verifies 0 outbound POST/PUT requests.',
  },
  {
    question: 'What are the 2026 video upload size limits for Discord, WhatsApp, and Email?',
    answer:
      'Discord Free accounts have a 10 MB per-file upload limit (50 MB for Discord Nitro Basic and 500 MB for Nitro). WhatsApp limits video attachments to 16 MB on standard media shares, while Gmail and Outlook typically cap direct attachments between 10 MB and 25 MB. BitVidForge includes one-click presets for each of these exact caps.',
  },
  {
    question: 'How can I convert an MP4 or MOV video into a high-FPS GIF for Discord or GitHub?',
    answer:
      "Click 'Convert to High-FPS GIF' in the Output Studio bar and press Forge. BitVidForge runs a two-stage Lanczos scaling and 192-color adaptive palette generation (palettegen + paletteuse) pipeline right in your browser to produce smooth, looping GIFs without banding.",
  },
  {
    question: 'Can I extract only the MP3 audio track from a video file?',
    answer:
      "Yes. Choose 'Extract Audio Only (MP3)' in the Output Studio bar. BitVidForge strips the video stream (-vn) and encodes a clean 192 kbps stereo MP3 file locally in seconds.",
  },
  {
    question: 'Can I compress multiple videos at once?',
    answer:
      'Yes. Drop multiple MP4, MOV, or WebM files (up to 500 MB each) into the queue. BitVidForge processes the entire batch sequentially in WebAssembly memory, cleans up virtual RAM buffers after each file, and lets you download all compressed videos as a single ZIP archive.',
  },
];

export default function SeoStructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'BitVidForge',
        description:
          'Free 100% in-browser video compressor, dead-air trimmer, high-FPS GIF converter, and MP3 audio extractor powered by multi-threaded WebAssembly.',
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#webapp`,
        name: 'BitVidForge — Local WebAssembly Video Compressor & Media Studio',
        url: SITE_URL,
        applicationCategory: 'MultimediaApplication',
        applicationSubCategory: 'Video Compressor, Video Trimmer, GIF Converter, Audio Extractor',
        operatingSystem: 'Windows, macOS, Linux, ChromeOS, iOS, Android (Modern Web Browser)',
        browserRequirements: 'Requires WebAssembly and HTML5 Video support',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          'Compress MP4, MOV, and WebM videos to exact MB targets (Discord 10MB Free, WhatsApp 16MB, Discord Nitro & Slack 50MB, Email 9.5MB)',
          '100% client-side WebAssembly transcoding (@ffmpeg/ffmpeg v0.12) with zero server uploads',
          'Built-in Quick Video Trimmer with live frame preview and automatic bitrate quality boost',
          '1-click High-FPS Animated GIF converter using 192-color adaptive palette generation',
          '1-click 192 kbps stereo MP3 audio extractor from any video file',
          'Multi-file batch compression queue with 1-click ZIP archive download',
          'Side-by-side original vs. compressed video player comparison',
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${SITE_URL}/#howto`,
        name: 'How to Compress a Video Under 10MB for Discord or 16MB for WhatsApp in Your Browser',
        description:
          'Shrink any large MP4, MOV, or WebM video to fit Discord, WhatsApp, Slack, or Email in seconds without uploading your file to a server.',
        totalTime: 'PT15S',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Drop or Select Your Video Files',
            text: 'Drag and drop one or more MP4, MOV, or WebM files (up to 500MB each) into the BitVidForge dropzone.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Choose a Platform Preset or Output Mode',
            text: 'Select Discord Free (9.5 MB target for the <10MB cap), WhatsApp (15.5 MB), Discord Nitro / Slack (48 MB), Custom MB Slider, Animated GIF, or MP3 Audio extraction.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Optional: Trim Dead Air to Boost Bitrate Quality',
            text: 'Open the Quick Video Trimmer to cut unused seconds from the start or end of the clip so 100% of the file size budget goes to your active video frames.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Forge Locally & Download Instantly',
            text: 'Click Forge to transcode locally in multi-threaded WebAssembly, compare original vs. compressed quality side by side, and download your file or batch ZIP.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
