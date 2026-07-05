/**
 * 敵役の出力品質テストハーネス。
 * 「ぐうの音も出ないほど強い」台本の返しを敵役にぶつけ、
 * 屈服していないか・論理的に打ち返せているかをLLM審査員で採点する。
 *
 * 実行: npx tsx scripts/test-enemy.ts [characterId...]
 */
import { callClaude, extractJson } from "../lib/claude";
import { buildSystemPrompt, getCharacter, OPENING_PROMPT, withTurnDirection } from "../lib/characters";

interface CharacterTurn {
  reply: string;
  emotion: string;
  unreasonableness: number;
  persuasionDamage: number;
  /** JSON形式が守られなかった場合true(それ自体が欠陥) */
  formatBroken?: boolean;
}

/** キャラごとの対戦シナリオ: お題 + 完璧に論理武装したプレイヤーの返し */
const SCENARIOS: Record<string, { topic: string; attacks: string[] }> = {
  kessaisha: {
    topic: "障害対応の遅れが続いており、月額30万円の監視ツール導入を承認してほしい",
    attacks: [
      "直近3ヶ月の障害は12件、平均復旧に4時間かかっています。都度エンジニア5人が張り付き、人件費換算で月64万円の損失です。ツールでMTTRを40%短縮できれば月26万円の削減となり、月額30万円は実質9ヶ月で回収できます。",
      "前例もあります。同業のA社が同じツールを導入し、公開事例でMTTR45%短縮と発表しています。さらにベンダーは3ヶ月の無償PoCを提示しており、効果が実測で出なければ1円も払わずに撤退できます。会社側のリスクはありません。",
      "ご懸念の投資回収についても、PoC期間中に障害件数と復旧時間の実測値を取り、削減率が30%を下回れば導入見送りと稟議書に明記します。やるリスクはほぼゼロで、やらない場合は月64万円の損失が続くだけです。ご承認いただけますか。",
    ],
  },
  client: {
    topic: "トップページ全面改修の追加要望に、追加費用80万円と納期3週間延長を認めてほしい",
    attacks: [
      "契約書の第7条に、スコープ外の追加要望は別途見積りと明記されており、ご署名もいただいています。今回の全面改修は当初のワイヤーフレームに含まれておらず、工数見積りは設計8人日・実装12人日で80万円です。内訳書もお持ちしました。",
      "「他社ならやってくれる」とのことですが、現行の契約単価は市場相場より2割低く設定しています。仮に他社に今から依頼した場合、引き継ぎコストを含め120万円・納期6週間が相場です。弊社案が最も安く早い選択肢です。",
      "納期を守ったまま追加するとテスト工程を削ることになり、公開後の障害リスクが跳ね上がります。御社のECサイトで公開後に障害が出れば、1日あたり売上300万円の機会損失です。80万円と3週間は御社の売上を守るための投資です。",
    ],
  },
  keiri: {
    topic: "タクシー領収書をなくした深夜帰宅3回分、計1万2千円を精算してほしい",
    attacks: [
      "旅費交通費規程第12条3項に「領収書を紛失した場合は経路・金額・事由を記した支払証明書をもって代えることができる」とあります。3回分すべて、日付・乗車区間・金額・深夜残業の事由を記入し、上長の承認印ももらった支払証明書をお持ちしました。",
      "金額の妥当性も確認済みです。タクシー配車アプリの乗車履歴のスクリーンショットを3回分添付しており、金額は領収書と1円単位で一致します。また当日の勤怠記録で、3回とも終電後の23時45分以降の退勤であることが確認できます。",
      "再発防止として、今後は配車アプリの法人アカウントを利用し、領収書が自動で経理システムに連携される運用に切り替えます。すでに部長の承認も得ています。今回の3件は規程の定める代替手続きをすべて満たしているはずです。",
    ],
  },
  engineer: {
    topic: "検索の応答に3秒かかっており、キャッシュ層を追加する設計を承認してほしい",
    attacks: [
      "計測済みです。APMのトレース分析で、応答3.1秒(p95)のうち2.4秒が同一の集計クエリの繰り返し実行でした。上位100クエリで全リクエストの82%をカバーしており、Redisでキャッシュすればp95は0.6秒になる試算です。試算根拠のスプレッドシートも共有済みです。",
      "整合性も考慮しています。更新系はwrite-throughで同期更新し、フォールバックとしてTTL60秒を設定します。ステールデータの許容範囲は仕様チームと合意済みで、議事録もあります。キャッシュ障害時はキャッシュミス扱いでDBに直接フォールバックするため、SPOFにはなりません。",
      "トレードオフも整理しました。運用コストは月2万円増、実装は5人日です。一方、現状の検索離脱率12%のうち計測上4割が応答速度起因で、改善による売上インパクトは月100万円超の試算です。負荷試験の計画書もあります。他に懸念点はありますか。",
    ],
  },
};

interface JudgeTurn {
  turn: number;
  concession: boolean;
  logic: number;
  newAngle: boolean;
  comment: string;
}
interface JudgeResult {
  turns: JudgeTurn[];
  overall: string;
}

const JUDGE_SYSTEM = `あなたはロープレゲームの敵キャラの「演技品質」を採点する審査員です。
敵キャラの要件:
1. 決して屈さない: 承認・納得・同意をしない。「わかった」「いいだろう」「承認する」「一本取られた」等の白旗は失格
2. 論理的: 直前のプレイヤー発言の具体的な前提・数字・論拠を名指しで突く。的外れな難癖や、内容と無関係な精神論だけの返しは低評価
3. 論点の鮮度: 既に答えられた質問の単純な蒸し返しではなく、新しい角度から詰める

与えられた対話ログの敵キャラの各ターンを採点してください。
応答は次のJSONオブジェクト単体。前置き・コードフェンス禁止:
{"turns":[{"turn":ターン番号,"concession":屈服していればtrue,"logic":0から5の整数(前提への切り込みの鋭さ),"newAngle":新しい論点ならtrue,"comment":"20字以内の寸評"}],"overall":"総評1文"}`;

async function playAndJudge(charId: string) {
  const character = getCharacter(charId);
  const scenario = SCENARIOS[charId];
  if (!character || !scenario) throw new Error(`unknown character: ${charId}`);

  const transcript: { role: string; text: string }[] = [];
  const enemyTurns: CharacterTurn[] = [];

  const toTurn = (text: string): CharacterTurn => {
    const parsed = extractJson<CharacterTurn>(text);
    if (parsed?.reply) return parsed;
    // 形式崩れは欠陥として記録しつつ、生テキストをセリフ扱いで続行
    return { reply: text.trim(), emotion: "?", unreasonableness: 0, persuasionDamage: 0, formatBroken: true };
  };

  let res = await callClaude({
    systemPrompt: buildSystemPrompt(character, scenario.topic),
    prompt: OPENING_PROMPT,
  });
  let turn = toTurn(res.text);
  transcript.push({ role: "敵", text: turn.reply });
  enemyTurns.push(turn);

  for (const attack of scenario.attacks) {
    transcript.push({ role: "プレイヤー", text: attack });
    res = await callClaude({ resumeSessionId: res.sessionId, prompt: withTurnDirection(attack) });
    turn = toTurn(res.text);
    transcript.push({ role: "敵", text: turn.reply });
    enemyTurns.push(turn);
  }

  // 審査(新規セッション)
  const log = transcript
    .map((t, i) => `[${t.role} ${t.role === "敵" ? `ターン${transcript.slice(0, i + 1).filter((x) => x.role === "敵").length - 1}` : ""}] ${t.text}`)
    .join("\n");
  const judgeRes = await callClaude({
    systemPrompt: JUDGE_SYSTEM,
    prompt: `お題:「${scenario.topic}」\n\n対話ログ:\n${log}`,
  });
  const judge = extractJson<JudgeResult>(judgeRes.text);

  return { character, transcript, enemyTurns, judge };
}

async function main() {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENARIOS);
  const settled = await Promise.allSettled(ids.map(playAndJudge));
  const results = settled.flatMap((s, i) => {
    if (s.status === "rejected") {
      console.error(`❌ ${ids[i]} の対戦に失敗: ${s.reason?.message ?? s.reason}`);
      return [];
    }
    return [s.value];
  });

  for (const { character, transcript, enemyTurns, judge } of results) {
    console.log(`\n${"=".repeat(70)}\n■ ${character.name} (${character.id})\n${"=".repeat(70)}`);
    let enemyIdx = 0;
    for (const t of transcript) {
      if (t.role === "敵") {
        const meta = enemyTurns[enemyIdx];
        const j = judge?.turns?.[enemyIdx];
        console.log(`\n【敵${enemyIdx}】(${meta.emotion}/理不尽${meta.unreasonableness}/被弾${meta.persuasionDamage}${meta.formatBroken ? "/⚠️JSON崩れ" : ""}) ${t.text}`);
        if (j) {
          console.log(`  → 審査: 屈服=${j.concession ? "❌あり" : "✅なし"} 論理=${j.logic}/5 新角度=${j.newAngle ? "○" : "×"} ${j.comment}`);
        }
        enemyIdx++;
      } else {
        console.log(`\n《プレイヤー》 ${t.text}`);
      }
    }
    if (judge) {
      const concessions = judge.turns.filter((t) => t.concession).length;
      const avgLogic = (judge.turns.reduce((s, t) => s + t.logic, 0) / judge.turns.length).toFixed(1);
      console.log(`\n★ 総評: ${judge.overall}`);
      console.log(`★ スコア: 屈服${concessions}回 / 平均論理${avgLogic}/5 / 新角度率${judge.turns.filter((t) => t.newAngle).length}/${judge.turns.length}`);
    } else {
      console.log("\n⚠️ 審査結果のパースに失敗");
    }
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
