# BGM の配置仕様

このディレクトリに以下のファイル名で MP3 を置くと、ゲームが自動的に再生する(コード変更不要)。
未配置のファイルは黙ってスキップされ、無音で進行する。再生管理は `lib/bgm.ts`。

| ファイル | 流れる場面 | ループ | 推奨 |
|---|---|---|---|
| `title.mp3` | タイトル/キャラ選択画面 | する | 60秒前後のシームレスループ |
| `battle.mp3` | バトル中(ゲージ0〜74) | する | 60〜90秒のシームレスループ |
| `battle-max.mp3` | バトル中(ゲージ75以上=Lv3域) | する | `battle.mp3` と同モチーフの高速アレンジだと切り替えが自然 |
| `finisher.mp3` | 必殺「黙れカス」演出(約3.4秒+リザルトへ) | しない | 10〜15秒のジングル。鳴り終わったら無音のまま |
| `result.mp3` | リザルト/コーチ講評画面 | する | 60秒前後のシームレスループ |

## 再生仕様(生成・編集時の注意)

- ループは `HTMLAudioElement.loop` によるファイル末尾→先頭の単純ループ。**末尾の無音とリバーブ尾はカットしておく**とつなぎ目が自然になる
- 曲の切り替えは約0.6秒のクロスフェード。イントロが長すぎると場面転換に乗り遅れる
- VOICEVOX のセリフ読み上げ中は自動で音量が35%に絞られる(ダッキング)ので、聞き取りやすさは気にしなくてよい
- 音量はコード側で全体調整済み。**-14 LUFS 程度に揃えておく**とバランスが取りやすい
- 効果音が Kenney.nl の CC0 で統一されているため、BGM も商用可・クレジット不要のライセンスであることを確認する

## 音楽生成AI用プロンプト(Suno / Udio / Stable Audio など)

歌詞欄は空、または `[Instrumental]` を指定して歌を入れないこと。

### title.mp3

> Instrumental, loopable BGM for a comedy office-battle video game menu screen. Light corporate kitsch: cheesy 90s Japanese TV variety show style, bossa nova lounge with cheap synth brass, electric piano, shaker, relaxed 95 BPM. Playful, slightly sarcastic mood, like elevator music hiding tension underneath. No vocals, clean 60-second seamless loop.

### battle.mp3

> Instrumental, loopable battle BGM for a comedic business-negotiation RPG. Funky office-rock: tight drum groove at 118 BPM, wah guitar, clavinet, punchy synth brass stabs, walking bassline. Energetic but restrained, "keeping your cool in a stressful meeting" tension. Occasional typewriter and phone-ring accents. No vocals, seamless loop.

### battle-max.mp3

> Instrumental, loopable high-tension BGM, escalation of a funky office-rock battle theme. Same motif but faster at 140 BPM, driving rock drums, distorted guitar riffs, urgent string ostinato, rising synth arpeggios. The feeling of patience about to snap, boiling anger held behind a polite smile. Dramatic but still slightly comedic. No vocals, seamless loop.

### finisher.mp3

> Short instrumental sting, 10–15 seconds, for a finishing move in a comedy game: a massive stamp slamming down. Sudden silence, then one huge taiko drum hit, epic orchestral brass fanfare bursting with exaggerated triumph, choir-like synth swell, ending with a decisive final chord and reverb tail. Over-the-top, cathartic, heroic parody. No vocals.

### result.mp3

> Instrumental, loopable result-screen BGM for a comedy game. Warm and satisfying afterglow: mid-tempo 100 BPM smooth jazz-funk, Rhodes electric piano, soft horns, laid-back drums, a hint of victory fanfare motif. The relief after finally saying what you always wanted to say at work. Slightly nostalgic, feel-good. No vocals, seamless loop.
