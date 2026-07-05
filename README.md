# 黙れカス — 想定問答バトル

「渋い決裁者」「無茶を言うクライアント」「細かい経理」を演じるAIに提案をぶつけて、想定問答を本気で練習するローカルWebゲーム。
相手はターンを追うごとに理不尽さをエスカレートさせる。真面目に打ち返すほど**カタルシスゲージ**が溜まり、我慢の限界が来たら必殺の印鑑——**「黙れカス」**を叩き込んで撃退する(ゲーム終了)。終了後はAIコーチが、良かった返し・弱かった返し・実戦へのアドバイスを講評してくれる。

## 前提

- Node.js 20以上
- **Claude Code CLI**(`claude`)がインストール済みで、ログイン済みであること
  - このアプリはAPIキーを使わず、`claude -p`(ヘッドレスモード)を子プロセスとして呼び出す

## 起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

- 相手の応答には1ターンあたり数秒〜20秒程度かかる(手元のClaude Codeが演技を考えている時間)
- 使用モデルは環境変数 `DAMARE_MODEL` で変更可能(既定: `sonnet`)
- UIや演出のデバッグには `npm run dev:mock`(環境変数 `DAMARE_MOCK=1`)を使うと、LLMを呼ばずに固定パターンのモック応答が即座に返る

## 遊び方

1. 名刺から対戦相手を指名し、「件名」に今日通したい提案を書いて開戦
2. 相手の理不尽な打ち返しに、冷静に・具体的に反論する(良い返しほどゲージが溜まる)
3. 我慢の限界が来たら右下の印鑑を押す。ゲージLvが高いほど演出とスコア倍率が派手になる
4. 査定表で称号とスコアを確認し、コーチ講評を実戦に持ち帰る

## イラストの差し替え(外注)

現在の立ち絵はプレースホルダーSVG。外注イラスト(1024×1024 透過PNG)を
`public/characters/<キャラID>/<表情>.png` に置くだけで自動的に差し替わる(PNG優先・なければSVGにフォールバック)。

- 発注仕様: [docs/illustration-spec.md](docs/illustration-spec.md)
- 全18カットの発注プロンプト(日英): [docs/illustration-prompts.md](docs/illustration-prompts.md)

## 構成

- `lib/claude.ts` — `claude -p` のspawnラッパー(初回 `--system-prompt` / 継続 `--resume`)
- `lib/characters.ts` — キャラ定義とシステムプロンプト
- `lib/game.ts` — ゲージ計算・必殺レベル・称号判定
- `app/api/{session,message,feedback}` — ゲームAPI
- `app/page.tsx` / `app/play/page.tsx` — キャラ選択 / バトル〜リザルト
- `scripts/test-claude.ts` — ラッパー単体検証(`npx tsx scripts/test-claude.ts`)
- `scripts/gen-placeholders.mjs` — プレースホルダーSVG再生成
