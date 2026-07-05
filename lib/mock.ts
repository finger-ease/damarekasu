import { FEEDBACK_PROMPT, TOPIC_GENERATION_PROMPT } from "./characters";
import type { ClaudeCallResult } from "./claude";
import { EMOTIONS, type FeedbackResult, type OpponentTurn, type TopicResponse } from "./types";

/**
 * DAMARE_MOCK=1 のときに callClaude の代わりに使うモック実装。
 * claude -p を起動せず、即座に固定パターンの応答を返す(UI・演出デバッグ用)。
 */

// ローディング表示も確認できるよう、わずかに待つ
const MOCK_DELAY_MS = 300;

// ターン数はセッションIDに埋め込む(mock-xxxx-t3 = 3ターン返答済み)。サーバー側の状態を持たない
const TURN_RE = /-t(\d+)$/;

const MOCK_REPLIES = [
  "は?何を言っているのかね。話にならんよ。",
  "そういう甘い考えだから駄目なんだ。数字は?根拠は?",
  "ほう、言うようになったじゃないか。だがまだまだだな。",
  "もういい!君と話していると時間の無駄だ!",
  "……ふん。まあ、続けたまえ。",
];

export async function mockCallClaude(opts: {
  prompt: string;
  resumeSessionId?: string;
}): Promise<ClaudeCallResult> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

  if (opts.prompt === TOPIC_GENERATION_PROMPT) {
    const topics: TopicResponse = {
      topics: [
        "【モック】障害対応の遅れが続いており、月額30万円の監視ツール導入を承認してほしい",
        "【モック】問い合わせが前年比5割増のため、来期予算を300万円増やしてほしい",
        "【モック】デザイン確認の戻しが2週間止まっており、納期を2週間延ばしてもらいたい",
        "【モック】タクシー領収書をなくした深夜帰宅3回分、計1万2千円を精算してほしい",
        "【モック】検索の応答に3秒かかっており、キャッシュ層を追加する設計を承認してほしい",
      ],
    };
    return { sessionId: newSessionId(1), text: JSON.stringify(topics) };
  }

  if (opts.prompt === FEEDBACK_PROMPT) {
    const feedback: FeedbackResult = {
      summary: "【モック】これはモックモードの講評です。実際のやり取りは評価していません。",
      good: ["【モック】相手の論点に正面から答えていた", "【モック】具体的な数字を出して切り返せていた"],
      weak: ["【モック】感情的になる場面があった", "【モック】結論を先に言えていなかった"],
      advice: ["【モック】まず結論、次に根拠の順で話す", "【モック】相手の指摘を一度受け止めてから反論する"],
    };
    return { sessionId: opts.resumeSessionId ?? newSessionId(1), text: JSON.stringify(feedback) };
  }

  // 対戦ターン: 表情を巡回させ、ターンが進むほど理不尽度・ダメージを上げる
  // (ゲージが4〜5ターンで最大に達し、必殺技レベル3まで確認できる配分)
  const turnIndex = opts.resumeSessionId ? parseTurn(opts.resumeSessionId) : 0;
  const turn: OpponentTurn = {
    reply: `【モック】ターン${turnIndex + 1}: ${MOCK_REPLIES[turnIndex % MOCK_REPLIES.length]}`,
    emotion: EMOTIONS[turnIndex % EMOTIONS.length],
    unreasonableness: Math.min(5, 1 + turnIndex),
    persuasionDamage: turnIndex === 0 ? 0 : Math.min(10, 3 + turnIndex * 2),
  };
  return { sessionId: newSessionId(turnIndex + 1), text: JSON.stringify(turn) };
}

function parseTurn(sessionId: string): number {
  const m = TURN_RE.exec(sessionId);
  return m ? Number(m[1]) : 0;
}

function newSessionId(turn: number): string {
  return `mock-${Math.random().toString(36).slice(2, 8)}-t${turn}`;
}
