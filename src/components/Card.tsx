'use client';

import { memo } from 'react';
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

const flipTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] } as const;

export const Card = memo(function Card({ katakana, isFlipped, isMatched, onClick, difficulty }: CardProps) {
  const neon = NEON_COLORS[difficulty];
  const borderColor = `${neon.primary}40`;

  return (
    <div
      className="relative w-full aspect-square cursor-pointer perspective-1000"
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d will-change-transform"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={flipTransition}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* BACK (face down) */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="w-full h-full relative card-washi rounded-xl"
            style={{ border: `1.5px solid ${borderColor}` }}
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
                className="opacity-85 w-full h-full object-contain"
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
            }}
          >
            {/* Sumi-e ink wash effect in corners */}
            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-black/5 to-transparent rounded-tl-xl" />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-black/5 to-transparent rounded-br-xl" />

            <span
              className="font-bold text-gray-800 leading-none"
              style={{
                fontSize: 'clamp(1.6rem, 7vw, 3.5rem)',
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              {katakana.char}
            </span>
            <span
              className="mt-0.5 text-gray-500 font-medium"
              style={{ fontSize: 'clamp(0.6rem, 2.5vw, 1rem)' }}
            >
              {katakana.romaji}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
