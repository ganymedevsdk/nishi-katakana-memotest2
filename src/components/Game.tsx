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

// ─── Difficulty label colors ─────────────────────────
const DIFF_LABELS: Record<Difficulty, { jp: string; color: string }> = {
  easy:   { jp: '初級', color: 'var(--color-nishi-teal)' },
  medium: { jp: '中級', color: 'var(--color-hiroshige-blue)' },
  hard:   { jp: '上級', color: 'var(--color-vermillion)' },
};

// ─── Main Game ───────────────────────────────────────

export function Game() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isMobile, setIsMobile] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [matchedPairs, setMatchedPairs] = useState<Katakana[]>([]);
  const [failingIds, setFailingIds] = useState<Set<number>>(new Set());
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

  const [activeConfig, setActiveConfig] = useState<DifficultyConfig>(DIFFICULTY.easy);

  useEffect(() => {
    const check = () => setIsMobile(checkIsMobile());
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setHighScores(getHighScores());
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const compute = () => {
      const container = gridRef.current;
      if (!container) return;

      const { rows, cols } = activeConfig;
      const availH = container.clientHeight;
      const availW = container.clientWidth;
      const isMobileView = window.innerWidth < 640;
      const gap = isMobileView
        ? (activeConfig.cols >= 6 ? 4 : 6)
        : window.innerWidth < 1024 ? 10 : 12;

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
    setFailingIds(new Set());
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

  // Match logic with fail animation
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
        // [ukiyo-e] Trigger fail shake animation
        setFailingIds(new Set([first, second]));
        setTimeout(() => {
          setFailingIds(new Set());
        }, 400);
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

  const colors = NEON_COLORS[difficulty];
  const { pairs, cols, label } = activeConfig;

  // =================== MENU SCREEN ===================
  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          {/* [ukiyo-e] Header with logo only */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 relative"
          >
            <div className="relative flex flex-col items-center">
              {/* Nishi logo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-3"
              >
                <Image
                  src="/nishi-logo-card.png"
                  alt="Nishi Nihongo Gakko"
                  width={70}
                  height={70}
                  className="mx-auto"
                  unoptimized
                />
              </motion.div>
            </div>

            {/* [ukiyo-e] Title */}
            <h1 className="font-ukiyo mb-1" style={{ letterSpacing: '0.1em' }}>
              <span
                className="block text-3xl md:text-4xl"
                style={{ color: 'var(--color-sumi-black)', fontWeight: 700 }}
              >
                カタカナ
              </span>
              <span
                className="block text-xl md:text-2xl mt-0.5"
                style={{ color: 'var(--color-nishi-teal)', fontWeight: 400 }}
              >
                MEMOTEST
              </span>
            </h1>
            <p style={{ color: 'var(--color-sepia)' }} className="text-xs mt-1">
              西日本語学校 &middot; Nishi Nihongo Gakko
            </p>
          </motion.div>

          {/* [ukiyo-e] Seigaiha divider */}
          <div className="seigaiha-border-sm mb-6" />

          <div className="space-y-3">
            <p className="text-center text-sm mb-4" style={{ color: 'var(--color-sumi-black)' }}>
              <span className="font-ukiyo">難易度を選んでください</span>
              <br />
              <span className="text-xs" style={{ color: 'var(--color-sepia)' }}>Elegí la dificultad</span>
            </p>

            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, index) => {
              const diffLabel = DIFF_LABELS[diff];
              const hs = highScores[diff];
              const config = getEffectiveDifficulty(diff, isMobile);
              return (
                <motion.button
                  key={diff}
                  onClick={() => startNewGame(diff)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-4 text-left flex items-center justify-between btn-woodblock"
                >
                  <div>
                    <span className="font-ukiyo text-sm" style={{ color: diffLabel.color, fontWeight: 700 }}>
                      {diffLabel.jp} &middot; {config.name}
                    </span>
                    <span className="text-[11px] ml-2" style={{ color: 'var(--color-sepia)' }}>
                      {config.label} &middot; {config.pairs} pares
                    </span>
                  </div>
                  {hs && (
                    <span className="text-[10px]" style={{ color: 'var(--color-sepia)' }}>
                      {hs.moves}mov / {formatTime(hs.time)}
                    </span>
                  )}
                </motion.button>
              );
            })}

            {/* Practice mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="pt-3"
            >
              <p className="text-center text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--color-sepia)' }}>
                練習モード &middot; Modo práctica
              </p>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                  const config = getEffectiveDifficulty(diff, isMobile);
                  const diffLabel = DIFF_LABELS[diff];
                  return (
                    <button
                      key={`practice-${diff}`}
                      onClick={() => startNewGame(diff, true)}
                      className="flex-1 py-2 px-2 transition-colors text-xs"
                      style={{
                        background: 'var(--color-washi-warm)',
                        border: '1.5px solid var(--color-sumi-black)',
                        borderRadius: '3px',
                        boxShadow: '2px 2px 0 var(--color-sumi-black)',
                        color: diffLabel.color,
                        fontWeight: 500,
                      }}
                    >
                      {config.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[9px] mt-1.5" style={{ color: 'var(--color-sepia)' }}>
                Sin timer ni puntaje
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex justify-center"
          >
            <InstagramButton />
          </motion.div>

          {/* [ukiyo-e] Bottom seigaiha wave footer */}
          <div className="seigaiha-border mt-6" />
        </motion.div>
      </div>
    );
  }

  const isMobileHard = isMobile && difficulty === 'hard';

  // =================== GAME SCREEN ===================
  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${isMobileHard ? 'p-1' : 'p-2 sm:p-3 md:p-4 lg:p-5'}`}>
      {/* [ukiyo-e] Game header */}
      <header className={`w-full max-w-7xl mx-auto flex-shrink-0 ${isMobileHard ? 'mb-0.5' : 'mb-1 sm:mb-2'}`}>
        <div className="flex items-center justify-between gap-2">
          {/* Left: title + info */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Small seal badge */}
            <div
              className="hidden sm:flex items-center justify-center flex-shrink-0"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '1.5px solid var(--color-sumi-black)',
                background: 'var(--color-washi-cream)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-serif-jp)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-sumi-black)' }}>西</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold font-ukiyo truncate" style={{ fontWeight: 700 }}>
                <span style={{ color: 'var(--color-sumi-black)' }}>カタカナ</span>
                <span style={{ color: 'var(--color-nishi-teal)' }}> MEMO</span>
              </h1>
              <p className="text-[9px] md:text-[10px]" style={{ color: 'var(--color-sepia)' }}>
                {activeConfig.name} &middot; {label} &middot; {pairs} pares
                {practiceMode && <span style={{ color: 'var(--color-ochre)' }} className="ml-1">(練習)</span>}
              </p>
            </div>
          </div>

          {/* Right: stats + controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {!practiceMode && (
              <>
                <div className="text-center stat-pill hidden sm:block">
                  <p className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--color-sepia)' }}>時間</p>
                  <p className="text-sm font-bold font-ukiyo" style={{ color: colors.primary, fontWeight: 700 }}>
                    <Timer running={timerRunning} onTimeRef={timeRef} />
                  </p>
                </div>
                <div className="text-center stat-pill">
                  <p className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--color-sepia)' }}>回数</p>
                  <p className="text-sm font-bold font-ukiyo" style={{ color: colors.primary, fontWeight: 700 }}>
                    {moves}
                  </p>
                </div>
                <div className="text-center stat-pill hidden md:block">
                  <p className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--color-sepia)' }}>正解</p>
                  <p className="text-sm font-bold font-ukiyo" style={{ color: colors.primary, fontWeight: 700 }}>
                    {matchedPairs.length}/{pairs}
                  </p>
                </div>
              </>
            )}

            {/* Mobile timer */}
            {!practiceMode && (
              <div className="text-center sm:hidden stat-pill">
                <p className="text-xs font-bold font-ukiyo" style={{ color: colors.primary, fontWeight: 700 }}>
                  <Timer running={timerRunning} onTimeRef={timeRef} />
                </p>
              </div>
            )}

            <div className="hidden lg:block">
              <InstagramButton />
            </div>

            <button
              onClick={handleToggleMute}
              className="btn-woodblock !p-1.5 !shadow-none"
              style={{ boxShadow: '2px 2px 0 var(--color-sumi-black)' }}
              title={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-sepia)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-sepia)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setGameStarted(false)}
              className="btn-woodblock !py-1 !px-2.5 text-[11px]"
              style={{ boxShadow: '2px 2px 0 var(--color-sumi-black)', color: 'var(--color-sepia)' }}
            >
              戻る
            </button>
          </div>
        </div>

        {/* Thin seigaiha under header on desktop */}
        <div className="seigaiha-border-sm mt-1.5 hidden md:block" />
      </header>

      {/* Card Grid */}
      <main
        ref={gridRef}
        className={`flex-1 w-full max-w-7xl mx-auto flex justify-center min-h-0 overflow-hidden ${isMobileHard ? 'items-center' : 'items-start md:items-center'}`}
      >
        <div
          className="card-grid w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: gridMaxWidth || '100%',
            ...(isMobileHard ? { gap: '4px' } : {}),
          }}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              katakana={card.katakana}
              isFlipped={flippedSet.has(card.id) || matchedIds.has(card.id)}
              isMatched={matchedIds.has(card.id)}
              isFailing={failingIds.has(card.id)}
              onClick={() => handleCardClick(card.id)}
              difficulty={difficulty}
              isCompact={isMobile && difficulty === 'hard'}
            />
          ))}
        </div>
      </main>

      {/* [ukiyo-e] Bottom area: IG + seigaiha footer (hidden on mobile hard for max grid space) */}
      {!isMobileHard && (
        <div className="flex-shrink-0 mt-1">
          <div className="lg:hidden flex justify-center mb-1">
            <InstagramButton />
          </div>
          <div className="seigaiha-border-sm" />
        </div>
      )}

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
