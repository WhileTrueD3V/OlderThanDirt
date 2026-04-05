import { ImageResponse } from 'next/og';

export const alt = 'OlderThanDirt — Timeline Ordering Game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 50%, #0d1520 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(167,139,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* ⏳ icon */}
        <div style={{ fontSize: 80, marginBottom: 24, filter: 'drop-shadow(0 0 24px rgba(167,139,250,0.6))' }}>
          ⏳
        </div>

        {/* Title */}
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: 'white',
          letterSpacing: '-2px',
          marginBottom: 16,
          textShadow: '0 0 40px rgba(167,139,250,0.4)',
        }}>
          OlderThanDirt
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 26,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 48,
        }}>
          How well do you know what came first?
        </div>

        {/* Sample cards row */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['🍕', '🚀', '📺', '💡', '🎸'].map((emoji, i) => (
            <div key={i} style={{
              width: 72, height: 72,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              backdropFilter: 'blur(10px)',
            }}>
              {emoji}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
