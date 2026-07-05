# イラスト外注用プロンプト集(全18カット・日英併記)

各カットの指示文です。**日本語**はイラストレーターへの発注文として、**英語**は画像生成AI(Midjourney / DALL·E / nano-banana 等)へのプロンプトとして、そのままコピペで使えます。
サイズ・形式などの共通仕様は [illustration-spec.md](./illustration-spec.md) を参照。

## 全カット共通の画風指定

> **日本語**: デフォルメの効いたコミカルな日本のアニメ調。太めのはっきりした主線、フラット気味の彩色、色数は絞る。バストアップ、正面〜やや斜め、背景透過。3キャラ・全表情で同一のタッチに統一すること。同一キャラの表情差分は輪郭・体位置を固定し、眉・目・口とエフェクトのみ変更(defeatedのみポーズ変更可)。
>
> **English (append to every prompt)**: comical Japanese anime style, exaggerated cartoon expression, bold clean outlines, flat cel shading, limited color palette, bust-up portrait facing slightly off-center, transparent background, game character sprite, consistent art style across a character set

---

## 1. 渋川 剛三(kessaisha)— 渋い決裁者

**ベース容姿(全表情共通)**
> **日本語**: 60代の日本人男性役員。白髪まじりのグレーのオールバック、太い眉、への字口、口ひげ。恰幅が良く、濃紺のスーツに白シャツ、金茶色のネクタイ。基本姿勢は腕組み。「で、それいくら儲かるの?」と言いそうな、値踏みするような渋い顔つき。
>
> **English (base)**: a stern Japanese executive in his 60s, gray slicked-back hair, thick bushy eyebrows, gray mustache, stocky build, navy blue suit with white shirt and amber necktie, arms crossed

| # | カット | 日本語指示 | English prompt(ベース+共通画風に追記) |
|---|---|---|---|
| 1 | `kessaisha/normal.png` | 平常。腕組みで相手を値踏みする渋い顔。眉はわずかに寄せ、口はへの字 | neutral stern expression, slightly furrowed brow, appraising skeptical look, closed flat mouth |
| 2 | `kessaisha/annoyed.png` | 不機嫌。半目でため息をつきそうな顔。眉間にしわ、口角を下げる | displeased half-lidded eyes, deep wrinkle between eyebrows, downturned mouth, unimpressed sigh |
| 3 | `kessaisha/angry.png` | 怒り。目を見開き一喝する顔。こめかみに青筋、口を開けて叱責 | angry wide-open glaring eyes, anime anger vein on temple, open mouth scolding loudly |
| 4 | `kessaisha/smug.png` | ドヤ顔。目を閉じてフッと鼻で笑う。片方の口角だけ上げ、勝ち誇る | smug closed eyes, one-sided smirk, condescending triumphant chuckle, chin slightly raised |
| 5 | `kessaisha/furious.png` | 激怒。顔を赤くして怒髪天。頭から湯気、目は血走り、大口で怒鳴る | furious red face, steam blowing from head, bloodshot bulging eyes, huge shouting mouth, multiple anger veins |
| 6 | `kessaisha/defeated.png` | 敗北。「黙れカス」を食らってのけぞって吹っ飛ぶ。白目または×目、口はゆがみ、腕組みが解けて狼狽。体を斜めに傾ける | defeated blown-away pose, leaning backward off-balance, swirly or X-shaped eyes, wobbly open mouth, arms uncrossed flailing, sweat drops, dizzy stars |

---

## 2. 無理矢 通(client)— 無茶を言うクライアント

**ベース容姿(全表情共通)**
> **日本語**: 40代の日本人男性会社員。茶髪の無造作ヘア、軽薄な笑顔、ノーネクタイでオレンジ〜レンガ色のジャケットに明るいシャツ。片手にスマホを持っていてもよい。「サクッとできるでしょ?」と悪気なく無茶を言う軽いノリの顔つき。
>
> **English (base)**: a breezy careless Japanese businessman in his 40s, messy brown hair, lightweight frivolous vibe, brick-orange casual jacket over open-collar shirt with no tie, optionally holding a smartphone

| # | カット | 日本語指示 | English prompt(ベース+共通画風に追記) |
|---|---|---|---|
| 7 | `client/normal.png` | 平常。ヘラヘラした人懐っこい笑顔。目は軽く弧を描き、悪気ゼロ | friendly careless grin, cheerful innocent-looking eyes, easygoing salesman smile |
| 8 | `client/annoyed.png` | 不機嫌。「えー、できないの?」と不服そうに口をとがらせ、眉を下げる | pouting dissatisfied face, puckered lips, raised inner eyebrows, childish complaint expression |
| 9 | `client/angry.png` | 怒り。「他社さんはやってくれるって言ってたけどなあ?」と目を細めて圧をかける。笑っているのに目が笑っていない | narrowed pressuring eyes with fake smile, passive-aggressive glare, one eyebrow raised, vein on temple |
| 10 | `client/smug.png` | ドヤ顔。「いいこと思いついちゃった」と人差し指を立てて満面のひらめき顔。キラキラエフェクト | smug bright-idea face, index finger raised, sparkling eyes, self-satisfied beaming grin, sparkle effects |
| 11 | `client/furious.png` | 激怒。「聞いてないよ!」と子供のようにキレて頭を抱える寸前。口を大きく開け、汗が飛ぶ | childish tantrum rage, wide open shouting mouth, flying sweat drops, hands raised in panic, comically overwhelmed |
| 12 | `client/defeated.png` | 敗北。吹っ飛んでスマホを取り落とす。×目、口はへにゃへにゃ、体を斜めに傾ける | defeated blown-away pose, dropping his smartphone, X-shaped eyes, wobbly mouth, leaning backward off-balance, dizzy stars |

---

## 3. 重箱 隅子(keiri)— 細かい経理

**ベース容姿(全表情共通)**
> **日本語**: 年齢不詳の日本人女性事務員。黒髪のきっちりしたボブカット、スクエア眼鏡、深緑〜ティール色のカーディガンに白ブラウス。姿勢が良く、無表情の圧がある。眼鏡をクイッと上げる仕草が似合う。声を荒げず静かに詰めるタイプ。
>
> **English (base)**: a Japanese female accountant of indeterminate age, precise black bob haircut, square glasses, dark teal cardigan over white blouse, perfect posture, quietly intimidating aura

| # | カット | 日本語指示 | English prompt(ベース+共通画風に追記) |
|---|---|---|---|
| 13 | `keiri/normal.png` | 平常。無表情でじっと見る。眼鏡の奥の目が冷たい。書類を持っていてもよい | expressionless cold stare through glasses, calm unreadable face, optionally holding a document |
| 14 | `keiri/annoyed.png` | 不機嫌。眼鏡をクイッと中指で上げながら半目。「規程をご存知ですか?」の顔 | pushing up glasses with middle finger, half-lidded judging eyes, faint frown, quiet disapproval |
| 15 | `keiri/angry.png` | 怒り。眼鏡が白く光り目が見えない。口元は笑っていない微笑。静かな怒り | glasses glowing opaque white hiding eyes, thin unsmiling smile, quietly terrifying aura, dark shadow over face |
| 16 | `keiri/smug.png` | ドヤ顔。領収書の不備を見つけた瞬間。口角だけ上げ、眼鏡がキラリ | subtle triumphant smirk, glint flashing on glasses corner, holding up a receipt as evidence, satisfied narrow eyes |
| 17 | `keiri/furious.png` | 激怒。無表情のまま周囲に般若のオーラ。眼鏡が光り、背後に暗黒。声なき怒りの最終形態 | expressionless face with terrifying demonic aura behind, glowing white glasses, dark ominous energy, silent ultimate anger |
| 18 | `keiri/defeated.png` | 敗北。眼鏡がずれ落ち、初めて素の慌てた表情。書類が舞い、体を斜めに傾ける | defeated blown-away pose, glasses slipping off crooked, first-time flustered bare expression, papers scattering in air, leaning backward, dizzy stars |

---

## 発注時のチェックリスト

- [ ] 18カットすべて同一タッチか
- [ ] 同一キャラの表情差分で輪郭・体位置が固定されているか(defeated以外)
- [ ] 1024×1024・背景透過PNGか
- [ ] ファイル名が `<キャラID>/<表情>.png` になっているか
