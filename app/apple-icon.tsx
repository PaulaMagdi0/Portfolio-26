import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgb(10, 10, 10)',
        color: 'rgb(212, 165, 116)',
        fontFamily: 'Georgia, serif',
        fontWeight: 400,
        fontSize: 132,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        borderRadius: 36,
      }}
    >
      P
    </div>,
    { ...size },
  );
}
