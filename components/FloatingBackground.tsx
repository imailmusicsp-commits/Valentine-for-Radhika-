import React, { useMemo } from 'react';

const EMOJIS = ['❤️', '🌸', '✨', '💖', '🌹', '💕'];

export const FloatingBackground: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: `${Math.random() * 100}vw`,
      animationDuration: `${10 + Math.random() * 15}s`,
      animationDelay: `${-Math.random() * 15}s`,
      fontSize: `${1 + Math.random() * 1.5}rem`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-[-10vh] animate-float-up opacity-0"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            fontSize: p.fontSize,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};
