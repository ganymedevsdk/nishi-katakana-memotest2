'use client';

import { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Katakana, Difficulty, NEON_COLORS } from '@/data/katakana';

interface CardProps {
  katakana: Katakana;
  isFlipped: boolean;
  isMatched: boolean;
  isFailing: boolean;
  onClick: () => void;
  difficulty: Difficulty;
}

const flipTransition = { duration: 0.45, ease: [0.4, 0, 0.2, 1] } as const;

/* [ukiyo-e] Hanko seal — small red 西 stamp for card corners */
function HankoSeal({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const posClasses: Record<string, string> = {
    'top-left': 'top-[6px] left-[6px]',
    'top-right': 'top-[6px] right-[6px]',
    'bottom-left': 'bottom-[6px] left-[6px]',
    'bottom-right': 'bottom-[6px] right-[6px]',
  };
  return (
    <span
      className={`absolute ${posClasses[position]} flex items-center justify-center pointer-events-none`}
      style={{
        width: 'clamp(14px, 3vw, 20px)',
        height: 'clamp(14px, 3vw, 20px)',
        background: 'var(--color-vermillion)',
        borderRadius: '2px',
        fontSize: 'clamp(0.45rem, 1.2vw, 0.6rem)',
        fontFamily: 'var(--font-serif-jp)',
        color: 'white',
        lineHeight: 1,
        opacity: 0.85,
      }}
      aria-hidden="true"
    >
      西
    </span>
  );
}

export const Card = memo(function Card({ katakana, isFlipped, isMatched, isFailing, onClick, difficulty }: CardProps) {
  const colors = NEON_COLORS[difficulty];
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevMatched = useRef(isMatched);

  /* [ukiyo-e] Trigger match pulse animation only on transition to matched */
  useEffect(() => {
    if (isMatched && !prevMatched.current && wrapperRef.current) {
      wrapperRef.current.classList.add('card-match-animate');
      const timer = setTimeout(() => {
        wrapperRef.current?.classList.remove('card-match-animate');
      }, 600);
      return () => clearTimeout(timer);
    }
    prevMatched.current = isMatched;
  }, [isMatched]);

  /* [ukiyo-e] Double-frame card style matching moodboard:
     - Outer: 2.5px sumi-black border with woodblock shadow
     - Inner: 1px ochre/gold border (via inset box-shadow)
     - Matched: moss-green border with ochre inner */
  const cardFrameStyle = isMatched
    ? {
        border: '2.5px solid var(--color-moss-green)',
        boxShadow: '3px 3px 0 var(--color-moss-green), inset 0 0 0 3px var(--color-ochre)',
      }
    : {
        border: '2.5px solid var(--color-sumi-black)',
        boxShadow: '3px 3px 0 var(--color-sumi-black), inset 0 0 0 3px var(--color-ochre)',
      };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full aspect-square cursor-pointer perspective-800 card-hover-lift ${isFailing ? 'card-fail-shake' : ''}`}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={flipTransition}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* ═══ BACK (face down) — [ukiyo-e] woodblock cartela ═══ */}
        <div
          className="absolute inset-0 backface-hidden overflow-hidden"
          style={{ backfaceVisibility: 'hidden', borderRadius: '3px' }}
        >
          <div
            className="w-full h-full relative"
            style={{
              ...cardFrameStyle,
              borderRadius: '3px',
              background: 'var(--color-washi-warm)',
            }}
          >
            {/* [ukiyo-e] Subtle washi fiber texture on back */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0h1v1H0zm2 2h1v1H2z' fill='%23c9a84c' fill-opacity='0.06'/%3E%3C/svg%3E\")",
                borderRadius: '3px',
              }}
            />

            {/* [sumi-e] Watermark kanji — rotated 西 in ink wash */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              aria-hidden="true"
            >
              <span
                style={{
                  fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
                  fontFamily: 'var(--font-serif-jp)',
                  color: 'var(--color-ink-wash-light)',
                  transform: 'rotate(-15deg)',
                  fontWeight: 700,
                }}
              >
                西
              </span>
            </div>

            {/* Center Nishi logo */}
            <div className="absolute inset-[15%] flex items-center justify-center">
              <Image
                src="/nishi-logo-card.png"
                alt="Nishi"
                width={200}
                height={200}
                className="w-full h-full object-contain"
                style={{ opacity: 0.8 }}
                unoptimized
              />
            </div>

            {/* [ukiyo-e] Corner hanko seals — matching moodboard */}
            <HankoSeal position="top-left" />
            <HankoSeal position="top-right" />
            <HankoSeal position="bottom-left" />
            <HankoSeal position="bottom-right" />
          </div>
        </div>

        {/* ═══ FRONT (face up) — [ukiyo-e] revealed katakana ═══ */}
        <div
          className="absolute inset-0 backface-hidden flex items-center justify-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '3px',
          }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-center relative"
            style={{
              ...cardFrameStyle,
              borderRadius: '3px',
              background: 'radial-gradient(ellipse at 40% 35%, #F5EDD6 0%, #EDE0C4 100%)',
            }}
          >
            {/* [sumi-e] Subtle ink wash in corners */}
            <div
              className="absolute top-0 left-0 w-2/5 h-2/5 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 0% 0%, rgba(26,16,8,0.04) 0%, transparent 70%)',
                borderRadius: '3px 0 0 0',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-2/5 h-2/5 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 100% 100%, rgba(26,16,8,0.04) 0%, transparent 70%)',
                borderRadius: '0 0 3px 0',
              }}
            />

            {/* [ukiyo-e] Main katakana character — large and bold like moodboard */}
            <span
              className="leading-none select-none"
              style={{
                fontSize: 'clamp(1.8rem, 8vw, 3.8rem)',
                fontFamily: 'var(--font-serif-jp)',
                fontWeight: 700,
                color: 'var(--color-sumi-black)',
              }}
            >
              {katakana.char}
            </span>

            {/* Romaji below — subtle sepia */}
            <span
              className="mt-0.5 select-none"
              style={{
                fontSize: 'clamp(0.55rem, 2vw, 0.9rem)',
                fontFamily: 'var(--font-sans-jp)',
                fontWeight: 500,
                color: 'var(--color-sepia)',
              }}
            >
              {katakana.romaji}
            </span>

            {/* [ukiyo-e] Single hanko on revealed face */}
            <HankoSeal position="bottom-right" />
          </div>
        </div>
      </motion.div>

    </div>
  );
});
