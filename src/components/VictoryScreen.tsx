'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Katakana, Difficulty, DIFFICULTY, NEON_COLORS } from '@/data/katakana';

interface VictoryScreenProps {
  isVisible: boolean;
  moves: number;
  time: number;
  matchedPairs: Katakana[];
  difficulty: Difficulty;
  bestScore: { moves: number; time: number } | null;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VictoryScreen({
  isVisible,
  moves,
  time,
  matchedPairs,
  difficulty,
  bestScore,
  onPlayAgain,
  onChangeDifficulty,
}: VictoryScreenProps) {
  const hasConfettiFired = useRef(false);
  const colors = NEON_COLORS[difficulty];
  const { pairs } = DIFFICULTY[difficulty];

  const perfectScore = pairs;
  const efficiency = Math.max(0, Math.round((perfectScore / moves) * 100));

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const confettiColors = ['#3d8b83', '#C0392B', '#C9A84C', '#1B4F72', '#4A6741', '#F5EDD6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: confettiColors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: confettiColors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: confettiColors,
      });
    }, 500);
  }, []);

  useEffect(() => {
    if (isVisible && !hasConfettiFired.current) {
      hasConfettiFired.current = true;
      fireConfetti();
    }
    if (!isVisible) {
      hasConfettiFired.current = false;
    }
  }, [isVisible, fireConfetti]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto"
          style={{ background: 'rgba(26, 16, 8, 0.7)' }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="relative w-full max-w-lg my-4 p-5 md:p-7"
            style={{
              background: 'var(--color-washi-cream)',
              border: '2.5px solid var(--color-sumi-black)',
              borderRadius: '3px',
              boxShadow: '5px 5px 0 var(--color-sumi-black), inset 0 0 0 3px var(--color-ochre)',
            }}
          >
            {/* [ukiyo-e] Victory title with seal */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="text-center mb-5"
            >
              {/* Small seal */}
              <div className="mx-auto mb-2 seal-badge" style={{ width: 48, height: 48 }}>
                <span style={{ fontFamily: 'var(--font-serif-jp)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-vermillion)' }}>
                  勝
                </span>
              </div>
              <h2
                className="text-2xl md:text-3xl font-ukiyo mb-1"
                style={{ color: colors.primary, fontWeight: 700 }}
              >
                勝利!
              </h2>
              <p className="text-lg font-bold" style={{ color: 'var(--color-sumi-black)' }}>
                ¡Dominaste los katakana!
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-sepia)' }}>お疲れ様でした!</p>
            </motion.div>

            {/* [ukiyo-e] Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-3 gap-2 mb-5"
            >
              {[
                { label: '時間', value: formatTime(time) },
                { label: '回数', value: String(moves) },
                { label: '効率', value: `${efficiency}%`, accent: true },
              ].map((stat) => (
                <div key={stat.label} className="text-center stat-pill py-2.5">
                  <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-sepia)' }}>
                    {stat.label}
                  </p>
                  <p
                    className="text-lg font-bold font-ukiyo"
                    style={{ color: stat.accent ? colors.primary : 'var(--color-sumi-black)', fontWeight: 700 }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Best score */}
            {bestScore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-center mb-4 text-xs"
                style={{ color: 'var(--color-sepia)' }}
              >
                Mejor: {bestScore.moves} intentos en {formatTime(bestScore.time)}
                {moves <= bestScore.moves && time <= bestScore.time && (
                  <span className="ml-2 font-bold" style={{ color: 'var(--color-moss-green)' }}>¡Nuevo récord!</span>
                )}
              </motion.div>
            )}

            {/* Discovered pairs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-5"
            >
              <p className="text-[10px] uppercase tracking-wider mb-2 text-center" style={{ color: 'var(--color-sepia)' }}>
                発見したペア ({matchedPairs.length})
              </p>
              <div
                className="grid gap-1.5 max-h-36 overflow-y-auto pr-1"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                }}
              >
                {matchedPairs.map((k, i) => (
                  <motion.div
                    key={`${k.romaji}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.025 }}
                    className="text-center p-1 stat-pill"
                  >
                    <span className="text-base font-bold font-ukiyo" style={{ color: 'var(--color-sumi-black)', fontWeight: 700 }}>
                      {k.char}
                    </span>
                    <p className="text-[9px]" style={{ color: 'var(--color-sepia)' }}>{k.romaji}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Seigaiha divider */}
            <div className="seigaiha-border-sm mb-4" />

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onPlayAgain}
                className="w-full py-3 px-5 font-bold font-ukiyo text-sm btn-woodblock btn-primary"
              >
                もう一回 &middot; Jugar de nuevo
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onChangeDifficulty}
                className="w-full py-3 px-5 font-medium text-sm btn-woodblock"
                style={{ color: 'var(--color-sepia)' }}
              >
                レベル変更 &middot; Cambiar nivel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
