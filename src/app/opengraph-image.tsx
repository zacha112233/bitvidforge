import { ImageResponse } from 'next/og';

export const alt =
  'BitVidForge — Free In-Browser Video Compressor for Discord 10MB, WhatsApp & Slack';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0c0a09',
          padding: '64px 72px',
          color: '#f5f5f4',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0c0a09',
                fontSize: '28px',
                fontWeight: 900,
              }}
            >
              BF
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
                BitVidForge
              </span>
              <span style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 600 }}>
                100% In-Browser WebAssembly Media Studio
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            0 Bytes Uploaded • Zero Cloud Queue
          </div>
        </div>

        {/* Center Hero Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 1.08,
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Forge Smaller Videos,</span>
            <span style={{ color: '#fbbf24' }}>High-FPS GIFs &amp; MP3 Audio</span>
          </div>
          <div style={{ fontSize: '26px', color: '#a8a29e', lineHeight: 1.4 }}>
            Hit Discord&apos;s 10MB cap, WhatsApp 16MB, or Slack 50MB on the first try with
            built-in dead-air video trimming &amp; multi-threaded FFmpeg.wasm.
          </div>
        </div>

        {/* Bottom Feature Pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            'Discord Free (<10MB)',
            'WhatsApp (<16MB)',
            'Built-In Video Trimmer',
            '1-Click GIF & MP3',
            'Batch ZIP Export',
          ].map((pill) => (
            <div
              key={pill}
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                backgroundColor: '#1c1917',
                border: '1px solid #44403c',
                color: '#fde68a',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
