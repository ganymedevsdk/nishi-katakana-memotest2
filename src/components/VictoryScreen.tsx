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
  const neon = NEON_COLORS[difficulty];
  const { pairs } = DIFFICULTY[difficulty];

  const perfectScore = pairs;
  const efficiency = Math.max(0, Math.round((perfectScore / moves) * 100));

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#00d4ff', '#ff2d95', '#ff0033', '#b829dd', '#00ff80'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
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
        colors,
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
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative w-full max-w-lg rounded-2xl p-6 md:p-8 my-4"
            style={{
              background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
              border: `1px solid ${neon.primary}40`,
              boxShadow: `0 0 40px ${neon.glow}, 0 0 80px ${neon.glow}`,
            }}
          >
            {/* Victory title */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center mb-6"
            >
              <h2
                className="text-3xl md:text-4xl font-bold font-cyber mb-2"
                style={{
                  color: neon.primary,
                  textShadow: `0 0 20px ${neon.glow}, 0 0 40px ${neon.glow}`,
                }}
              >
                勝利!
              </h2>
              <p className="text-xl text-white font-bold">
                ¡Dominaste los katakana!
              </p>
              <p className="text-gray-400 text-sm mt-1">お疲れ様でした!</p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Tiempo</p>
                <p className="text-xl font-bold text-white font-cyber">{formatTime(time)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Intentos</p>
                <p className="text-xl font-bold text-white font-cyber">{moves}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Eficiencia</p>
                <p className="text-xl font-bold font-cyber" style={{ color: neon.primary }}>
                  {efficiency}%
                </p>
              </div>
            </motion.div>

            {/* Best score */}
            {bestScore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-4 text-xs text-gray-500"
              >
                Mejor: {bestScore.moves} intentos en {formatTime(bestScore.time)}
                {moves <= bestScore.moves && time <= bestScore.time && (
                  <span className="ml-2 text-green-400 font-bold">¡Nuevo récord!</span>
                )}
              </motion.div>
            )}

            {/* Discovered pairs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 text-center">
                Pares descubiertos ({matchedPairs.length})
              </p>
              <div
                className="grid gap-1.5 max-h-40 overflow-y-auto pr-1"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                }}
              >
                {matchedPairs.map((k, i) => (
                  <motion.div
                    key={`${k.romaji}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.03 }}
                    className="text-center p-1.5 rounded-md bg-white/5 border border-white/10"
                  >
                    <span className="text-lg font-bold text-white">{k.char}</span>
                    <p className="text-[10px] text-gray-400">{k.romaji}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPlayAgain}
                className="w-full py-3 px-6 rounded-xl text-white font-bold font-cyber text-sm transition-all"
                style={{
                  background: `linear-gradient(135deg, ${neon.primary}, ${neon.primary}cc)`,
                  boxShadow: `0 0 20px ${neon.glow}`,
                }}
              >
                Jugar de nuevo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onChangeDifficulty}
                className="w-full py-3 px-6 rounded-xl border border-gray-700 text-gray-300 font-medium text-sm
                         hover:border-gray-500 hover:text-white transition-colors"
              >
                Cambiar nivel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
