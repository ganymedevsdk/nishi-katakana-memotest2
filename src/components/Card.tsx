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
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0h1v1H0zm2 2h1v1H2z' fill='%23c9a84c' fill-opacity='0.06'/%3E%3C/svg%3E\")",
                borderRadius: '3px',
              }}
            />

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

            {/* [ukiyo-e] Sakura frame — geometric corner knots + angular branches */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <defs>
                {/* Reusable 5-petal sakura flower */}
                <g id="sakura-lg">
                  <ellipse rx="2.8" ry="1.3" fill="#FFB7C5" transform="rotate(0)  translate(1.8,0)"/>
                  <ellipse rx="2.8" ry="1.3" fill="#FFB7C5" transform="rotate(72) translate(1.8,0)"/>
                  <ellipse rx="2.8" ry="1.3" fill="#FFC8D6" transform="rotate(144) translate(1.8,0)"/>
                  <ellipse rx="2.8" ry="1.3" fill="#FFB7C5" transform="rotate(216) translate(1.8,0)"/>
                  <ellipse rx="2.8" ry="1.3" fill="#FFC8D6" transform="rotate(288) translate(1.8,0)"/>
                  <circle r="1.1" fill="#D4647C"/>
                </g>
                <g id="sakura-sm">
                  <ellipse rx="2" ry="0.9" fill="#FFB7C5" transform="rotate(0) translate(1.3,0)"/>
                  <ellipse rx="2" ry="0.9" fill="#FFC8D6" transform="rotate(72) translate(1.3,0)"/>
                  <ellipse rx="2" ry="0.9" fill="#FFB7C5" transform="rotate(144) translate(1.3,0)"/>
                  <ellipse rx="2" ry="0.9" fill="#FFC8D6" transform="rotate(216) translate(1.3,0)"/>
                  <ellipse rx="2" ry="0.9" fill="#FFB7C5" transform="rotate(288) translate(1.3,0)"/>
                  <circle r="0.8" fill="#D4647C"/>
                </g>
              </defs>

              {/* ═══ Inner border rectangle ═══ */}
              <rect x="9" y="9" width="82" height="82" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>

              {/* ═══ Geometric corner knots (Chinese fret / 回紋) ═══ */}
              {/* Top-left */}
              <path d="M9 20 H4 V4 H20 V9" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              <path d="M9 16 H7 V7 H16 V9" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              {/* Top-right */}
              <path d="M80 9 V4 H96 V20 H91" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              <path d="M84 9 V7 H93 V16 H91" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              {/* Bottom-left */}
              <path d="M9 80 H4 V96 H20 V91" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              <path d="M9 84 H7 V93 H16 V91" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              {/* Bottom-right */}
              <path d="M80 91 V96 H96 V80 H91" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>
              <path d="M84 91 V93 H93 V84 H91" fill="none" stroke="#8B4C3A" strokeWidth="0.8"/>

              {/* ═══ Sakura branch — top-left (angular, crossing frame) ═══ */}
              {/* Main branch */}
              <path d="M2 32 C4 26, 6 22, 10 17 L17 10 C22 6, 28 3, 38 2"
                fill="none" stroke="#3A3E20" strokeWidth="2.4" strokeLinecap="round"/>
              {/* Sub-branches */}
              <path d="M10 17 C7 13, 5 8, 6 3" fill="none" stroke="#3A3E20" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M17 10 C14 7, 13 3, 15 1" fill="none" stroke="#3A3E20" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M26 5 C28 2, 32 0, 35 1" fill="none" stroke="#3A3E20" strokeWidth="1" strokeLinecap="round"/>
              <path d="M5 25 C2 23, 1 20, 1 17" fill="none" stroke="#3A3E20" strokeWidth="1.2" strokeLinecap="round"/>
              {/* Flowers */}
              <use href="#sakura-lg" x="7" y="5" transform="rotate(15, 7, 5)"/>
              <use href="#sakura-lg" x="18" y="8" transform="rotate(-10, 18, 8)"/>
              <use href="#sakura-sm" x="30" y="3" transform="rotate(25, 30, 3)"/>
              <use href="#sakura-sm" x="3" y="18" transform="rotate(-20, 3, 18)"/>
              <use href="#sakura-lg" x="13" y="2" transform="rotate(5, 13, 2)"/>
              <use href="#sakura-sm" x="38" y="4" transform="rotate(40, 38, 4)"/>

              {/* ═══ Sakura branch — bottom-right (mirror, angular) ═══ */}
              {/* Main branch */}
              <path d="M98 68 C96 74, 94 78, 90 83 L83 90 C78 94, 72 97, 62 98"
                fill="none" stroke="#3A3E20" strokeWidth="2.4" strokeLinecap="round"/>
              {/* Sub-branches */}
              <path d="M90 83 C93 87, 95 92, 94 97" fill="none" stroke="#3A3E20" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M83 90 C86 93, 87 97, 85 99" fill="none" stroke="#3A3E20" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M74 95 C72 98, 68 100, 65 99" fill="none" stroke="#3A3E20" strokeWidth="1" strokeLinecap="round"/>
              <path d="M95 75 C98 77, 99 80, 99 83" fill="none" stroke="#3A3E20" strokeWidth="1.2" strokeLinecap="round"/>
              {/* Flowers */}
              <use href="#sakura-lg" x="93" y="95" transform="rotate(15, 93, 95)"/>
              <use href="#sakura-lg" x="82" y="92" transform="rotate(-10, 82, 92)"/>
              <use href="#sakura-sm" x="70" y="97" transform="rotate(25, 70, 97)"/>
              <use href="#sakura-sm" x="97" y="82" transform="rotate(-20, 97, 82)"/>
              <use href="#sakura-lg" x="87" y="98" transform="rotate(5, 87, 98)"/>
              <use href="#sakura-sm" x="62" y="96" transform="rotate(40, 62, 96)"/>
            </svg>

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

            {/* [ukiyo-e] Main katakana character — even larger for legibility */}
            <span
              className="leading-none select-none"
              style={{
                fontSize: 'clamp(2.4rem, 10vw, 4.6rem)',
                fontFamily: 'var(--font-serif-jp)',
                fontWeight: 700,
                color: 'var(--color-sumi-black)',
              }}
            >
              {katakana.char}
            </span>

            {/* Romaji below — slightly larger again */}
            <span
              className="mt-1 select-none"
              style={{
                fontSize: 'clamp(0.8rem, 2.6vw, 1.1rem)',
                fontFamily: 'var(--font-sans-jp)',
                fontWeight: 500,
                color: 'var(--color-sepia)',
              }}
            >
              {katakana.romaji}
            </span>
          </div>
        </div>
      </motion.div>

    </div>
  );
});
