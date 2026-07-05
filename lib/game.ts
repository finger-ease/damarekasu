import { EMOTIONS, type Emotion, type OpponentTurn } from "./types";

export const GAUGE_MAX = 100;

/** カタルシスゲージの増加量: 理不尽を浴びるほど+良い返しをするほど溜まる */
export function gaugeGain(turn: OpponentTurn): number {
  return Math.round(turn.unreasonableness * 4 + turn.persuasionDamage * 1.5);
}

export type FinisherLevel = 1 | 2 | 3;

export function finisherLevel(gauge: number): FinisherLevel {
  if (gauge >= 75) return 3;
  if (gauge >= 40) return 2;
  return 1;
}

export const FINISHER_LABEL: Record<FinisherLevel, string> = {
  1: "黙れカス",
  2: "黙れカス!!",
  3: "黙れカス!!!",
};

/** モデルが規定外のemotionを返すことがあるため正規化する */
export function normalizeTurn(raw: Partial<OpponentTurn> & { reply?: string }, fallbackText: string): OpponentTurn {
  const emotion: Emotion = EMOTIONS.includes(raw.emotion as Emotion)
    ? (raw.emotion as Emotion)
    : "annoyed";
  return {
    reply: typeof raw.reply === "string" && raw.reply.trim() ? raw.reply : fallbackText,
    emotion,
    unreasonableness: clamp(Math.round(Number(raw.unreasonableness) || 1), 1, 5),
    persuasionDamage: clamp(Math.round(Number(raw.persuasionDamage) || 0), 0, 10),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export interface GameStats {
  /** ユーザーが打ち返した回数 */
  turns: number;
  /** 浴びた理不尽の合計 */
  totalUnreasonableness: number;
  /** 与えた説得ダメージの合計 */
  totalPersuasionDamage: number;
  /** 発動時のゲージ */
  gauge: number;
  level: FinisherLevel;
}

export function calcScore(stats: GameStats): number {
  const base =
    stats.turns * 100 +
    stats.totalUnreasonableness * 20 +
    stats.totalPersuasionDamage * 30;
  const multiplier = { 1: 1, 2: 1.5, 3: 2 }[stats.level];
  return Math.round(base * multiplier);
}

/** 称号判定: 耐久ターン数×発動レベル */
export function grantTitle(stats: GameStats): string {
  if (stats.turns === 0) return "瞬間湯沸かし器";
  if (stats.turns <= 2) return stats.level >= 2 ? "早撃ちガンマン" : "堪忍袋ゼロ";
  if (stats.turns <= 5) {
    if (stats.level === 3) return "計算されたブチギレ";
    return stats.totalPersuasionDamage >= 15 ? "論客見習い" : "短気は損気";
  }
  if (stats.turns <= 9) {
    if (stats.level === 3) return "忍耐の暗殺者";
    return stats.totalPersuasionDamage >= 30 ? "歴戦の交渉人" : "我慢の営業マン";
  }
  return stats.level === 3 ? "仏の顔も十度まで" : "仏の交渉人";
}
