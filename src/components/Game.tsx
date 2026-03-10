'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card } from './Card';
import { VictoryScreen } from './VictoryScreen';
import { InstagramButton } from './InstagramButton';
import {
  KATAKANA, DIFFICULTY, Difficulty, Katakana, NEON_COLORS,
  DifficultyConfig, getEffectiveDifficulty,
} from '@/data/katakana';
import {
  playFlip, playMatch, playFail, playUnflip, playWin, playReset,
  toggleMute,
} from '@/lib/sounds';

interface CardItem {
  id: number;
  katakana: Katakana;
}

interface HighScore {
  moves: number;
  time: number;
}

// ─── Timer component (isolated re-renders) ───────────
const Timer = memo(function Timer({
  running,
  onTimeRef,
}: {
  running: boolean;
  onTimeRef: React.MutableRefObject<number>;
}) {
  const [display, setDisplay] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      onTimeRef.current = 0;
      setDisplay(0);
      intervalRef.current = setInterval(() => {
        onTimeRef.current += 1;
        setDisplay(onTimeRef.current);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onTimeRef]);

  const mins = Math.floor(display / 60);
  const secs = display % 60;
  return <>{mins}:{secs.toString().padStart(2, '0')}</>;
});

// ─── Utilities ───────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateCards(config: DifficultyConfig): CardItem[] {
  const { pairs } = config;
  const shuffledKatakana = shuffleArray([...KATAKANA]);

  let selectedKatakana: Katakana[];
  if (pairs <= KATAKANA.length) {
    selectedKatakana = shuffledKatakana.slice(0, pairs);
  } else {
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

function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640;
}

// ─── Main Game ───────────────────────────────────────

export function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isMobile, setIsMobile] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [matchedPairs, setMatchedPairs] = useState<Katakana[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [highScores, setHighScores] = useState<Record<Difficulty, HighScore | null>>({
    easy: null, medium: null, hard: null,
  });

  const timeRef = useRef(0);
  const timerRunning = gameStarted && !gameWon && !practiceMode;
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridMaxWidth, setGridMaxWidth] = useState<string | undefined>(undefined);

  // The effective config for current game (accounts for mobile)
  const [activeConfig, setActiveConfig] = useState<DifficultyConfig>(DIFFICULTY.easy);

  // Detect mobile on mount + resize
  useEffect(() => {
    const check = () => setIsMobile(checkIsMobile());
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load high scores
  useEffect(() => {
    setHighScores(getHighScores());
  }, []);

  // ─── Compute optimal grid size to fill viewport ───
  useEffect(() => {
    if (!gameStarted) return;

    const compute = () => {
      const container = gridRef.current?.parentElement;
      if (!container) return;

      const { rows, cols } = activeConfig;
      const availH = container.clientHeight;
      const availW = container.clientWidth;
      const gap = window.innerWidth < 640 ? 8 : window.innerWidth < 1024 ? 10 : 12;

      const maxCardFromH = (availH - gap * (rows - 1)) / rows;
      const maxCardFromW = (availW - gap * (cols - 1)) / cols;
      const cardSize = Math.floor(Math.min(maxCardFromH, maxCardFromW));
      const totalW = cardSize * cols + gap * (cols - 1);

      setGridMaxWidth(`${totalW}px`);
    };

    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    const orientHandler = () => setTimeout(compute, 100);
    window.addEventListener('orientationchange', orientHandler);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', orientHandler);
    };
  }, [gameStarted, activeConfig]);

  const handleToggleMute = useCallback(() => {
    const nowMuted = toggleMute();
    setMutedState(nowMuted);
  }, []);

  const startNewGame = useCallback((diff: Difficulty, practice: boolean = false) => {
    playReset();
    const mobile = checkIsMobile();
    const config = getEffectiveDifficulty(diff, mobile);
    setDifficulty(diff);
    setIsMobile(mobile);
    setActiveConfig(config);
    setCards(generateCards(config));
    setFlippedCards([]);
    setMatchedIds(new Set());
    setMatchedPairs([]);
    setMoves(0);
    setGameWon(false);
    setIsLocked(false);
    setGameStarted(true);
    setPracticeMode(practice);
    setGridMaxWidth(undefined);
    timeRef.current = 0;
  }, []);

  // Win detection
  useEffect(() => {
    if (gameStarted && matchedIds.size > 0) {
      const { pairs } = activeConfig;
      if (matchedIds.size === pairs * 2) {
        setGameWon(true);
        playWin();
        if (!practiceMode) {
          saveHighScore(difficulty, moves, timeRef.current);
          setHighScores(getHighScores());
        }
      }
    }
  }, [matchedIds, activeConfig, difficulty, gameStarted, moves, practiceMode]);

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
        setMatchedIds((prev) => new Set([...prev, first, second]));
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

  const handleCardClick = useCallback((id: number) => {
    setIsLocked((locked) => {
      if (locked) return locked;
      setFlippedCards((prev) => {
        if (prev.length >= 2) return prev;
        if (prev.includes(id)) return prev;
        setMatchedIds((matched) => {
          if (matched.has(id)) return matched;
          playFlip();
          return matched;
        });
        return [...prev, id];
      });
      return locked;
    });
  }, []);

  const flippedSet = useMemo(() => new Set(flippedCards), [flippedCards]);

  const neon = NEON_COLORS[difficulty];
  const { pairs, cols, label } = activeConfig;

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

            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, index) => {
              const diffNeon = NEON_COLORS[diff];
              const hs = highScores[diff];
              const config = getEffectiveDifficulty(diff, isMobile);
              return (
                <motion.button
                  key={diff}
                  onClick={() => startNewGame(diff)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-5 rounded-xl bg-white/5 text-white text-lg font-medium
                           transition-all duration-300 text-left flex items-center justify-between"
                  style={{
                    border: `1.5px solid ${diffNeon.primary}40`,
                  }}
                >
                  <div>
                    <span className="font-cyber text-sm" style={{ color: diffNeon.primary }}>
                      {config.name}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      {config.label} &middot; {config.pairs} pares
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
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                  const config = getEffectiveDifficulty(diff, isMobile);
                  return (
                    <button
                      key={`practice-${diff}`}
                      onClick={() => startNewGame(diff, true)}
                      className="flex-1 py-2 px-2 rounded-lg bg-white/3 border border-white/10 text-gray-500
                               hover:text-gray-300 hover:border-white/20 transition-colors text-xs"
                    >
                      {config.name}
                    </button>
                  );
                })}
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
    <div className="h-[100dvh] flex flex-col p-2 sm:p-3 md:p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto mb-1 sm:mb-2 md:mb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold font-cyber truncate">
                <span style={{ color: '#ff0033' }}>KATAKANA</span>
                <span className="text-white"> MEMO</span>
              </h1>
              <p className="text-gray-600 text-[10px]">
                {activeConfig.name} &middot; {label} &middot; {pairs} pares
                {practiceMode && <span className="text-yellow-600 ml-1">(Práctica)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {!practiceMode && (
              <>
                <div className="text-center hidden sm:block">
                  <p className="text-gray-600 text-[9px] uppercase tracking-wider">Tiempo</p>
                  <p className="text-base font-bold font-cyber" style={{ color: neon.primary }}>
                    <Timer running={timerRunning} onTimeRef={timeRef} />
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

            {!practiceMode && (
              <div className="text-center sm:hidden">
                <p className="text-sm font-bold font-cyber" style={{ color: neon.primary }}>
                  <Timer running={timerRunning} onTimeRef={timeRef} />
                </p>
              </div>
            )}

            <div className="hidden lg:block">
              <InstagramButton />
            </div>

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

            <button
              onClick={() => setGameStarted(false)}
              className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-gray-400
                       hover:text-white hover:border-white/20 transition-colors text-xs"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Card Grid */}
      <main ref={gridRef} className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center min-h-0 overflow-hidden">
        <div
          className="card-grid w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: gridMaxWidth || '100%',
          }}
        >
          {cards.map((card) => (
            <div key={card.id}>
              <Card
                katakana={card.katakana}
                isFlipped={flippedSet.has(card.id) || matchedIds.has(card.id)}
                isMatched={matchedIds.has(card.id)}
                onClick={() => handleCardClick(card.id)}
                difficulty={difficulty}
              />
            </div>
          ))}
        </div>
      </main>

      <div className="lg:hidden flex justify-center mt-1 flex-shrink-0">
        <InstagramButton />
      </div>

      <VictoryScreen
        isVisible={gameWon}
        moves={moves}
        time={timeRef.current}
        matchedPairs={matchedPairs}
        difficulty={difficulty}
        bestScore={highScores[difficulty]}
        onPlayAgain={() => startNewGame(difficulty, practiceMode)}
        onChangeDifficulty={() => setGameStarted(false)}
      />
    </div>
  );
}
