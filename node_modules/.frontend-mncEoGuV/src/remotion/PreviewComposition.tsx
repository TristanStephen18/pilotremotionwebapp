import React from 'react';
// import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from '@remotion/player';
// import type {PreviewInputProps} from './types';
import type {PreviewInputProps} from './type';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrame, interpolate, Easing} from 'remotion';

const bgStyle = (bgType: 'color' | 'image' | 'video', bgValue: string): React.CSSProperties => {
  if (bgType === 'color') return { backgroundColor: bgValue || '#111827' };
  if (bgType === 'image') return { backgroundImage: `url(${bgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  return {}; // video handled separately
};

export const PreviewComposition: React.FC<PreviewInputProps> = ({text, fontFamily, bgType, bgValue}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 30], [60, 0], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{...bgStyle(bgType, bgValue)}}>
      {bgType === 'video' && bgValue ? (
        <video
          src={bgValue}
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.15))'}} />
      <AbsoluteFill style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{
          transform: `translateY(${y}px)`,
          opacity,
          color: 'white',
          fontFamily,
          textAlign: 'center',
          padding: '24px',
          lineHeight: 1.4,
          maxWidth: 900,
          textShadow: '0 6px 40px rgba(0,0,0,0.65)',
          fontSize: 48,
          fontWeight: 700,
        }}>
          {text || 'Your video text will appear here.'}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
