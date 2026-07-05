/**
 * lib/claude.ts の単体検証スクリプト。
 * 実行: npx tsx scripts/test-claude.ts
 */
import { callClaude, extractJson } from "../lib/claude";

const SYSTEM_PROMPT = `あなたはロープレゲームの敵キャラ「渋い決裁者」です。役を絶対に降りないでください。
ユーザーの提案に対し、渋く懐疑的に打ち返してください。

応答は必ず次のJSONオブジェクトのみを出力してください。前置き・コードフェンス禁止:
{"reply": "セリフ(日本語)", "emotion": "normal|annoyed|angry|smug|furious", "unreasonableness": 1から5の整数, "persuasionDamage": 0から10の整数}`;

interface CharacterTurn {
  reply: string;
  emotion: string;
  unreasonableness: number;
  persuasionDamage: number;
}

async function main() {
  console.log("=== ターン1 (初回: --system-prompt) ===");
  const t0 = Date.now();
  const first = await callClaude({
    systemPrompt: SYSTEM_PROMPT,
    prompt: "新しい社内チャットツールの導入を提案します。月額50万円ですが生産性が上がります。",
  });
  console.log(`所要: ${((Date.now() - t0) / 1000).toFixed(1)}s / sessionId: ${first.sessionId}`);
  console.log("raw:", first.text);
  const turn1 = extractJson<CharacterTurn>(first.text);
  console.log("parsed:", turn1);
  if (!turn1?.reply) throw new Error("ターン1のJSONパースに失敗");

  console.log("\n=== ターン2 (--resume で文脈維持) ===");
  const t1 = Date.now();
  const second = await callClaude({
    resumeSessionId: first.sessionId,
    prompt: "初期費用は無料で、3ヶ月の無料トライアルもあります。まず試してみませんか?",
  });
  console.log(`所要: ${((Date.now() - t1) / 1000).toFixed(1)}s / sessionId: ${second.sessionId}`);
  console.log("raw:", second.text);
  const turn2 = extractJson<CharacterTurn>(second.text);
  console.log("parsed:", turn2);
  if (!turn2?.reply) throw new Error("ターン2のJSONパースに失敗");

  // 文脈維持の簡易確認: ターン2の返答が成立していればOK(目視確認)
  console.log("\n=== フィードバック (--resume でキャラ解除) ===");
  const t2 = Date.now();
  const feedback = await callClaude({
    resumeSessionId: second.sessionId,
    prompt: "【ロープレ終了】キャラを解いてください。ここまでのユーザーの返しを講評し、良かった点・弱かった点を1つずつ、プレーンテキストで簡潔に述べてください。",
  });
  console.log(`所要: ${((Date.now() - t2) / 1000).toFixed(1)}s`);
  console.log("feedback:", feedback.text);

  console.log("\n✅ 全チェック通過");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
