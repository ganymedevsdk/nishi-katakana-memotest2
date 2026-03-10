'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card } from './Card';
import { VictoryScreen } from './VictoryScreen';
import { InstagramButton } from './InstagramButton';
import { KATAKANA, DIFFICULTY, Difficulty, Katakana, NEON_COLORS } from '@/data/katakana';
import {
  playFlip, playMatch, playFail, playUnflip, playWin, playReset,
  toggleMute, isMuted,
} from '@/lib/sounds';

interface CardItem {
  id: number;
  katakana: Katakana;
}

interface HighScore {
  moves: number;
  time: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCards(difficulty: Difficulty): CardItem[] {
  const { pairs } = DIFFICULTY[difficulty];
  const shuffledKatakana = shuffleArray([...KATAKANA]);

  let selectedKatakana: Katakana[];
  if (pairs <= KATAKANA.length) {
    selectedKatakana = shuffledKatakana.slice(0, pairs);
  } else {
    // For hard mode with 30 pairs: use all 46 + random extras (won't happen with 30, but safety)
    selectedKatakana = [...shuffledKatakana];
    while (selectedKatakana.length < pairs) {
      const extra = shuffledKatakana[Math.floor(Math.random() * shuffledKatakana.length)];
      selectedKatakana.push(extra);
    }
  }

  const cards: CardItem[] = [];
  selectedKatakana.forEach((katakana, index) => {
    cards.push({ id: index * 2, katakana });
    cards.push({ id: index * 2 + 1, katakana });
  });

  return shuffleArray(cards);
}

function getHighScores(): Record<Difficulty, HighScore | null> {
  if (typeof window === 'undefined') return { easy: null, medium: null, hard: null };
  try {
    const stored = localStorage.getItem('nishi-memotest-highscores');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { easy: null, medium: null, hard: null };
}

function saveHighScore(difficulty: Difficulty, moves: number, time: number) {
  const scores = getHighScores();
  const current = scores[difficulty];
  if (!current || moves < current.moves || (moves === current.moves && time < current.time)) {
    scores[difficulty] = { moves, time };
    try {
      localStorage.setItem('nishi-memotest-highscores', JSON.stringify(scores));
    } catch {}
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Katakana[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [highScores, setHighScores] = useState<Record<Difficulty, HighScore | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const [muted, setMutedState] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleToggleMute = useCallback(() => {
    const nowMuted = toggleMute();
    setMutedState(nowMuted);
  }, []);

  // Load high scores on mount
  useEffect(() => {
    setHighScores(getHighScores());
  }, []);

  // Timer
  useEffect(() => {
    if (gameStarted && !gameWon && !practiceMode) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    if (gameWon && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameStarted, gameWon, practiceMode]);

  const startNewGame = useCallback((diff: Difficulty, practice: boolean = false) => {
    playReset();
    setDifficulty(diff);
    setCards(generateCards(diff));
    setFlippedCards([]);
    setMatchedIds([]);
    setMatchedPairs([]);
    setMoves(0);
    setTime(0);
    setGameWon(false);
    setIsLocked(false);
    setGameStarted(true);
    setPracticeMode(practice);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Win detection
  useEffect(() => {
    if (gameStarted && matchedIds.length > 0) {
      const { pairs } = DIFFICULTY[difficulty];
      if (matchedIds.length === pairs * 2) {
        setGameWon(true);
        playWin();
        if (!practiceMode) {
          saveHighScore(difficulty, moves, time);
          setHighScores(getHighScores());
        }
      }
    }
  }, [matchedIds, difficulty, gameStarted, moves, time, practiceMode]);

  // Match logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsLocked(true);
      if (!practiceMode) setMoves((prev) => prev + 1);

      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard?.katakana.romaji === secondCard?.katakana.romaji) {
        playMatch();
        setMatchedIds((prev) => [...prev, first, second]);
        if (firstCard) {
          setMatchedPairs((prev) => [...prev, firstCard.katakana]);
        }
        setFlippedCards([]);
        setIsLocked(false);
      } else {
        playFail();
        setTimeout(() => {
          playUnflip();
          setFlippedCards([]);
          setIsLocked(false);
        }, 900);
      }
    }
  }, [flippedCards, cards, practiceMode]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    if (flippedCards.includes(id)) return;
    if (matchedIds.includes(id)) return;
    if (flippedCards.length >= 2) return;
    playFlip();
    setFlippedCards((prev) => [...prev, id]);
  };

  const neon = NEON_COLORS[difficulty];
  const { pairs, cols, label } = DIFFICULTY[difficulty];

  // =================== MENU SCREEN ===================
  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <Image
                src="/nishi-logo-card.png"
                alt="Nishi Nihongo Gakko"
                width={80}
                height={80}
                className="mx-auto mb-4"
                style={{ filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.4))' }}
                unoptimized
              />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold font-cyber tracking-wider mb-2">
              <span
                className="block"
                style={{
                  color: '#ff0033',
                  textShadow: '0 0 20px rgba(255, 0, 51, 0.5), 0 0 40px rgba(255, 0, 51, 0.3)',
                }}
              >
                KATAKANA
              </span>
              <span
                className="block text-3xl md:text-4xl"
                style={{
                  color: '#00d4ff',
                  textShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
                }}
              >
                MEMOTEST
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              西日本語学園 &middot; Nishi Nihongo Gakko
            </p>
          </motion.div>

          <div className="space-y-4">
            <p className="text-gray-300 text-center text-base mb-6">
              難易度を選んでください
              <br />
              <span className="text-xs text-gray-500">Elegí la dificultad</span>
            </p>

            {(Object.keys(DIFFICULTY) as Difficulty[]).map((diff, index) => {
              const diffNeon = NEON_COLORS[diff];
              const hs = highScores[diff];
              return (
                <motion.button
                  key={diff}
                  onClick={() => startNewGame(diff)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-5 rounded-xl bg-white/5 text-white text-lg font-medium
                           transition-all duration-300 text-left flex items-center justify-between"
                  style={{
                    border: `1.5px solid ${diffNeon.primary}40`,
                  }}
                >
                  <div>
                    <span className="font-cyber text-sm" style={{ color: diffNeon.primary }}>
                      {DIFFICULTY[diff].name}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      {DIFFICULTY[diff].label} &middot; {DIFFICULTY[diff].pairs} pares
                    </span>
                  </div>
                  {hs && (
                    <span className="text-gray-600 text-[10px]">
                      Mejor: {hs.moves}mov / {formatTime(hs.time)}
                    </span>
                  )}
                </motion.button>
              );
            })}

            {/* Practice mode button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <p className="text-gray-600 text-center text-[10px] uppercase tracking-wider mb-2">
                Modo práctica
              </p>
              <div className="flex gap-2">
                {(Object.keys(DIFFICULTY) as Difficulty[]).map((diff) => (
                  <button
                    key={`practice-${diff}`}
                    onClick={() => startNewGame(diff, true)}
                    className="flex-1 py-2 px-2 rounded-lg bg-white/3 border border-white/10 text-gray-500
                             hover:text-gray-300 hover:border-white/20 transition-colors text-xs"
                  >
                    {DIFFICULTY[diff].name}
                  </button>
                ))}
              </div>
              <p className="text-gray-700 text-center text-[9px] mt-1">
                Sin timer ni puntaje
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <InstagramButton />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // =================== GAME SCREEN ===================
  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-3 md:p-4 lg:p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl mx-auto mb-2 sm:mb-3 md:mb-4 flex-shrink-0"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold font-cyber truncate">
                <span style={{ color: '#ff0033' }}>KATAKANA</span>
                <span className="text-white"> MEMO</span>
              </h1>
              <p className="text-gray-600 text-[10px]">
                {DIFFICULTY[difficulty].name} &middot; {label} &middot; {pairs} pares
                {practiceMode && <span className="text-yellow-600 ml-1">(Práctica)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Stats */}
            {!practiceMode && (
              <>
                <div className="text-center hidden sm:block">
                  <p className="text-gray-600 text-[9px] uppercase tracking-wider">Tiempo</p>
                  <p className="text-base font-bold font-cyber" style={{ color: neon.primary }}>
                    {formatTime(time)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-[9px] uppercase tracking-wider">Intentos</p>
                  <p className="text-base font-bold font-cyber" style={{ color: neon.primary }}>
                    {moves}
                  </p>
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-gray-600 text-[9px] uppercase tracking-wider">Aciertos</p>
                  <p className="text-base font-bold font-cyber" style={{ color: neon.primary }}>
                    {matchedPairs.length}/{pairs}
                  </p>
                </div>
              </>
            )}

            {/* Mobile timer */}
            {!practiceMode && (
              <div className="text-center sm:hidden">
                <p className="text-sm font-bold font-cyber" style={{ color: neon.primary }}>
                  {formatTime(time)}
                </p>
              </div>
            )}

            {/* Instagram */}
            <div className="hidden lg:block">
              <InstagramButton />
            </div>

            {/* Mute toggle */}
            <button
              onClick={handleToggleMute}
              className="py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-gray-400
                       hover:text-white hover:border-white/20 transition-colors text-sm"
              title={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>

            {/* Menu button */}
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setGameStarted(false);
              }}
              className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-gray-400
                       hover:text-white hover:border-white/20 transition-colors text-xs"
            >
              Menu
            </button>
          </div>
        </div>
      </motion.header>

      {/* Card Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex items-start justify-center">
        <motion.div
          layout
          className="card-grid w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: difficulty === 'hard' ? '100%' : difficulty === 'medium' ? '52rem' : '28rem',
          }}
        >
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: Math.min(index * 0.015, 0.8) }}
              >
                <Card
                  katakana={card.katakana}
                  isFlipped={flippedCards.includes(card.id) || matchedIds.includes(card.id)}
                  isMatched={matchedIds.includes(card.id)}
                  onClick={() => handleCardClick(card.id)}
                  difficulty={difficulty}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Mobile footer with IG link */}
      <div className="lg:hidden flex justify-center mt-2 flex-shrink-0">
        <InstagramButton />
      </div>

      {/* Victory Screen */}
      <VictoryScreen
        isVisible={gameWon}
        moves={moves}
        time={time}
        matchedPairs={matchedPairs}
        difficulty={difficulty}
        bestScore={highScores[difficulty]}
        onPlayAgain={() => startNewGame(difficulty, practiceMode)}
        onChangeDifficulty={() => setGameStarted(false)}
      />
    </div>
  );
}
