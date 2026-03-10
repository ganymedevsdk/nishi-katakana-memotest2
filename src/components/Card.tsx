'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Katakana, Difficulty, NEON_COLORS } from '@/data/katakana';

interface CardProps {
  katakana: Katakana;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  difficulty: Difficulty;
}

export function Card({ katakana, isFlipped, isMatched, onClick, difficulty }: CardProps) {
  const neon = NEON_COLORS[difficulty];

  return (
    <motion.div
      className="relative w-full aspect-square cursor-pointer perspective-1000"
      onClick={onClick}
      whileHover={isMatched ? undefined : { scale: 1.04 }}
      whileTap={isMatched ? undefined : { scale: 0.96 }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* BACK (face down) */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="w-full h-full relative card-washi"
            style={{
              border: `1.5px solid rgba(${difficulty === 'easy' ? '0,212,255' : difficulty === 'medium' ? '255,45,149' : '255,0,64'}, 0.25)`,
              borderRadius: '0.75rem',
              animation: `glow-pulse-${difficulty === 'easy' ? 'blue' : difficulty === 'medium' ? 'pink' : 'red'} 3s ease-in-out infinite`,
            }}
          >
            {/* Corner sumi-e brackets */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: neon.primary }} />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: neon.primary }} />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: neon.primary }} />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: neon.primary }} />
            </div>

            {/* Center logo — fills most of the card, clears corner brackets */}
            <div className="absolute inset-[10px] flex items-center justify-center">
              <Image
                src="/nishi-logo-card.png"
                alt="Nishi"
                width={200}
                height={200}
                className="opacity-85 drop-shadow-lg w-full h-full object-contain"
                style={{
                  filter: `drop-shadow(0 0 12px ${neon.glow})`,
                }}
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* FRONT (face up) */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-center card-front-washi rounded-xl relative"
            style={{
              border: `2px solid ${isMatched ? 'rgba(0,255,128,0.5)' : neon.primary}`,
              boxShadow: isMatched
                ? '0 0 20px rgba(0,255,128,0.3), inset 0 0 20px rgba(0,255,128,0.1)'
                : `0 0 15px ${neon.glow}`,
            }}
          >
            {/* Sumi-e ink wash effect in corners */}
            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-black/5 to-transparent rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-black/5 to-transparent rounded-br-xl" />

            <span
              className="font-bold text-gray-800 leading-none"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                fontFamily: "'Noto Sans JP', sans-serif",
                textShadow: isMatched ? '0 0 10px rgba(0,255,128,0.3)' : 'none',
              }}
            >
              {katakana.char}
            </span>
            <span
              className="mt-0.5 text-gray-500 font-medium"
              style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.875rem)' }}
            >
              {katakana.romaji}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
