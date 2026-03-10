export const KATAKANA = [
  { char: 'ア', romaji: 'a' },
  { char: 'イ', romaji: 'i' },
  { char: 'ウ', romaji: 'u' },
  { char: 'エ', romaji: 'e' },
  { char: 'オ', romaji: 'o' },
  { char: 'カ', romaji: 'ka' },
  { char: 'キ', romaji: 'ki' },
  { char: 'ク', romaji: 'ku' },
  { char: 'ケ', romaji: 'ke' },
  { char: 'コ', romaji: 'ko' },
  { char: 'サ', romaji: 'sa' },
  { char: 'シ', romaji: 'shi' },
  { char: 'ス', romaji: 'su' },
  { char: 'セ', romaji: 'se' },
  { char: 'ソ', romaji: 'so' },
  { char: 'タ', romaji: 'ta' },
  { char: 'チ', romaji: 'chi' },
  { char: 'ツ', romaji: 'tsu' },
  { char: 'テ', romaji: 'te' },
  { char: 'ト', romaji: 'to' },
  { char: 'ナ', romaji: 'na' },
  { char: 'ニ', romaji: 'ni' },
  { char: 'ヌ', romaji: 'nu' },
  { char: 'ネ', romaji: 'ne' },
  { char: 'ノ', romaji: 'no' },
  { char: 'ハ', romaji: 'ha' },
  { char: 'ヒ', romaji: 'hi' },
  { char: 'フ', romaji: 'fu' },
  { char: 'ヘ', romaji: 'he' },
  { char: 'ホ', romaji: 'ho' },
  { char: 'マ', romaji: 'ma' },
  { char: 'ミ', romaji: 'mi' },
  { char: 'ム', romaji: 'mu' },
  { char: 'メ', romaji: 'me' },
  { char: 'モ', romaji: 'mo' },
  { char: 'ヤ', romaji: 'ya' },
  { char: 'ユ', romaji: 'yu' },
  { char: 'ヨ', romaji: 'yo' },
  { char: 'ラ', romaji: 'ra' },
  { char: 'リ', romaji: 'ri' },
  { char: 'ル', romaji: 'ru' },
  { char: 'レ', romaji: 're' },
  { char: 'ロ', romaji: 'ro' },
  { char: 'ワ', romaji: 'wa' },
  { char: 'ヲ', romaji: 'wo' },
  { char: 'ン', romaji: 'n' },
] as const;

export type Katakana = (typeof KATAKANA)[number];

export interface DifficultyConfig {
  pairs: number;
  cols: number;
  rows: number;
  name: string;
  label: string;
}

export const DIFFICULTY: Record<string, DifficultyConfig> = {
  easy: { pairs: 8, name: 'Fácil', cols: 4, rows: 4, label: '4×4' },
  medium: { pairs: 18, name: 'Medio', cols: 6, rows: 6, label: '6×6' },
  hard: { pairs: 30, name: 'Difícil', cols: 10, rows: 6, label: '10×6' },
};

// Mobile overrides (screen < 640px) — vertical layouts for portrait
export const DIFFICULTY_MOBILE_MEDIUM: DifficultyConfig = {
  pairs: 12, name: 'Medio', cols: 4, rows: 6, label: '4×6',
};

export const DIFFICULTY_MOBILE_HARD: DifficultyConfig = {
  pairs: 18, name: 'Difícil', cols: 6, rows: 6, label: '6×6',
};

export type Difficulty = 'easy' | 'medium' | 'hard';

/* [ukiyo-e] Palette per difficulty — replaces neon colors */
export const NEON_COLORS: Record<Difficulty, { primary: string; glow: string }> = {
  easy: { primary: '#3d8b83', glow: 'rgba(61, 139, 131, 0.4)' },     /* Nishi Teal */
  medium: { primary: '#1B4F72', glow: 'rgba(27, 79, 114, 0.4)' },    /* Hiroshige Blue */
  hard: { primary: '#C0392B', glow: 'rgba(192, 57, 43, 0.4)' },      /* Vermillion */
};

/** Returns the effective difficulty config, accounting for mobile screen size */
export function getEffectiveDifficulty(difficulty: Difficulty, isMobile: boolean): DifficultyConfig {
  if (isMobile) {
    if (difficulty === 'medium') return DIFFICULTY_MOBILE_MEDIUM;
    if (difficulty === 'hard') return DIFFICULTY_MOBILE_HARD;
  }
  return DIFFICULTY[difficulty];
}
