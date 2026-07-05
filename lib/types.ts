export const EMOTIONS = ["normal", "annoyed", "angry", "smug", "furious"] as const;
export type Emotion = (typeof EMOTIONS)[number];
/** 立ち絵は上記5種+黙れカスを食らった後の defeated */
export type PortraitEmotion = Emotion | "defeated";

/** 相手キャラの1ターン分の構造化応答 */
export interface OpponentTurn {
  reply: string;
  emotion: Emotion;
  /** このセリフの理不尽度 1-5 */
  unreasonableness: number;
  /** 直前のユーザーの返しの的確さ 0-10 */
  persuasionDamage: number;
}

export interface SessionResponse {
  sessionId: string;
  turn: OpponentTurn;
}

/** お題自動生成APIのレスポンス */
export interface TopicResponse {
  topics: string[];
}

export interface FeedbackResult {
  summary: string;
  good: string[];
  weak: string[];
  advice: string[];
}

export interface ChatMessage {
  role: "user" | "opponent";
  text: string;
  emotion?: Emotion;
}
