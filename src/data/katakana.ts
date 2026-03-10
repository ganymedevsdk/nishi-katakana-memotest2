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

export const DIFFICULTY = {
  easy: { pairs: 8, name: 'Fácil', cols: 4, rows: 4, label: '4×4' },
  medium: { pairs: 18, name: 'Medio', cols: 6, rows: 6, label: '6×6' },
  hard: { pairs: 30, name: 'Difícil', cols: 10, rows: 6, label: '10×6' },
} as const;

export type Difficulty = keyof typeof DIFFICULTY;

export const NEON_COLORS: Record<Difficulty, { primary: string; glow: string }> = {
  easy: { primary: '#00d4ff', glow: 'rgba(0, 212, 255, 0.6)' },
  medium: { primary: '#ff2d95', glow: 'rgba(255, 45, 149, 0.6)' },
  hard: { primary: '#ff0040', glow: 'rgba(255, 0, 64, 0.6)' },
};
