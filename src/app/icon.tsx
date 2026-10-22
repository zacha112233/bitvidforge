import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
          color: '#0c0a09',
          fontSize: 34,
          fontWeight: 900,
          fontFamily: 'sans-serif',
        }}
      >
        BF
      </div>
    ),
    {
      ...size,
    }
  );
}
