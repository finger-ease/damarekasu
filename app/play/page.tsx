"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { SpeechBubble } from "@/components/SpeechBubble";
import { CatharsisGauge } from "@/components/CatharsisGauge";
import { DamareKasuButton } from "@/components/DamareKasuButton";
import { FinisherOverlay } from "@/components/FinisherOverlay";
import { ChatLog } from "@/components/ChatLog";
import { ChatInput } from "@/components/ChatInput";
import { ResultScreen } from "@/components/ResultScreen";
import { getCharacter } from "@/lib/characters";
import { GAUGE_MAX, calcScore, finisherLevel, gaugeGain, grantTitle, type GameStats } from "@/lib/game";
import { loadRecords, saveResult } from "@/lib/records";
import { sfx } from "@/lib/sfx";
import type { ChatMessage, Emotion, FeedbackResult, SessionResponse } from "@/lib/types";

export default function PlayPage() {
  return (
    <Suspense>
      <Game />
    </Suspense>
  );
}

type Phase = "opening" | "battle" | "finisher" | "result";

function Game() {
  const params = useSearchParams();
  const router = useRouter();
  const character = getCharacter(params.get("c") ?? "");
  const topic = params.get("topic") ?? "";

  const [phase, setPhase] = useState<Phase>("opening");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [emotion, setEmotion] = useState<Emotion>("normal");
  const [thinking, setThinking] = useState(false);
  const [gauge, setGauge] = useState(0);
  const [spiky, setSpiky] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const statsRef = useRef({ turns: 0, totalUnreasonableness: 0, totalPersuasionDamage: 0 });
  const gaugeRef = useRef(0);
  const startedRef = useRef(false);

  const applyTurn = useCallback((data: SessionResponse) => {
    sessionIdRef.current = data.sessionId;
    setMessages((prev) => [...prev, { role: "opponent", text: data.turn.reply, emotion: data.turn.emotion }]);
    setEmotion(data.turn.emotion);
    setSpiky(data.turn.unreasonableness >= 4);
    sfx.play(data.turn.unreasonableness >= 4 ? "spiky" : "reply");
    statsRef.current.totalUnreasonableness += data.turn.unreasonableness;
    statsRef.current.totalPersuasionDamage += data.turn.persuasionDamage;
    const prevLevel = finisherLevel(gaugeRef.current);
    gaugeRef.current = Math.min(GAUGE_MAX, gaugeRef.current + gaugeGain(data.turn));
    if (finisherLevel(gaugeRef.current) > prevLevel) sfx.play("levelup");
    setGauge(gaugeRef.current);
  }, []);

  // セッション開始(相手の第一声)
  useEffect(() => {
    if (!character || !topic || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterId: character.id, topic }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "セッション開始に失敗しました");
        applyTurn(data);
        setPhase("battle");
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [character, topic, applyTurn]);

  const send = useCallback(
    async (text: string) => {
      sfx.play("send");
      setMessages((prev) => [...prev, { role: "user", text }]);
      setThinking(true);
      setError(null);
      try {
        const res = await fetch("/api/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "送信に失敗しました");
        statsRef.current.turns += 1;
        applyTurn(data);
      } catch (e) {
        setError((e as Error).message);
        // 失敗したユーザー発言は取り消して再入力してもらう
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setThinking(false);
      }
    },
    [applyTurn],
  );

  const fireFinisher = useCallback(() => {
    if (!character) return;
    sfx.play("fire");
    const finalStats: GameStats = {
      ...statsRef.current,
      gauge: gaugeRef.current,
      level: finisherLevel(gaugeRef.current),
    };
    setStats(finalStats);
    setPhase("finisher");

    // 演出中に裏でフィードバックを取得しておく
    if (sessionIdRef.current) {
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "講評の取得に失敗しました");
          setFeedback(data);
        })
        .catch((e) => setFeedbackError((e as Error).message));
    }

    const prevBest = loadRecords()[character.id]?.bestScore ?? 0;
    const score = calcScore(finalStats);
    saveResult(character.id, score, finalStats.turns, grantTitle(finalStats));
    setIsNewRecord(score > prevBest && prevBest > 0);
  }, [character]);

  if (!character || !topic) {
    return (
      <main className="grid flex-1 place-items-center p-8">
        <div className="koma max-w-md p-8 text-center">
          <p className="mb-4 font-bold">対戦相手かお題が指定されていません。</p>
          <Link href="/" className="manga-display text-shu underline">
            相手を選びに戻る
          </Link>
        </div>
      </main>
    );
  }

  if (phase === "result" && stats) {
    return (
      <ResultScreen
        character={character}
        stats={stats}
        feedback={feedback}
        feedbackError={feedbackError}
        isNewRecord={isNewRecord}
        onRetry={() => {
          // 全状態を初期化するためリロード遷移
          router.refresh();
          window.location.href = `/play?c=${character.id}&topic=${encodeURIComponent(topic)}`;
        }}
      />
    );
  }

  const lastReply = [...messages].reverse().find((m) => m.role === "opponent")?.text ?? "";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-4">
      {/* HUD */}
      <header className="mb-2">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black tracking-widest text-ink/60">{character.title}</p>
            <h1 className="manga-display truncate text-2xl leading-tight" style={{ color: character.color }}>
              {character.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="koma px-3 py-1 font-mono text-xs font-bold !shadow-none">
              {statsRef.current.turns}ターン目
            </span>
            <button
              type="button"
              onClick={() => {
                sfx.play("open");
                setLogOpen(true);
              }}
              className="koma px-3 py-1 text-xs font-black !shadow-[3px_3px_0_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:!shadow-[2px_2px_0_0_var(--ink)]"
            >
              議事録
            </button>
          </div>
        </div>
        <CatharsisGauge gauge={gauge} />
      </header>

      {/* ステージ */}
      <section className="relative flex flex-1 flex-col items-center justify-end">
        <div className="z-10 mb-[-30px] self-start pl-2 md:pl-10">
          {phase === "opening" ? (
            <SpeechBubble thinking text="" />
          ) : (
            <SpeechBubble text={lastReply} thinking={thinking} spiky={spiky} />
          )}
        </div>
        <CharacterPortrait
          characterId={character.id}
          emotion={emotion}
          thinking={thinking || phase === "opening"}
          size={400}
        />

        {/* 印鑑ボタン */}
        <div className="absolute bottom-12 right-0 md:right-6">
          <DamareKasuButton
            level={finisherLevel(gauge)}
            disabled={phase === "opening" || thinking}
            onFire={fireFinisher}
          />
        </div>
      </section>

      {error && (
        <p role="alert" className="koma mb-2 border-shu p-3 text-sm font-bold text-shu !shadow-none">
          {error}
        </p>
      )}

      <footer className="pb-4">
        <ChatInput disabled={phase !== "battle" || thinking} onSend={send} />
        <p className="mt-2 text-center text-[11px] font-bold text-ink/50">
          真面目に打ち返すほどゲージが溜まる。我慢の限界が来たら、右の印鑑を押せ。
        </p>
      </footer>

      <ChatLog
        open={logOpen}
        onClose={() => {
          sfx.play("close");
          setLogOpen(false);
        }}
        messages={messages}
        opponentName={character.name}
      />

      {phase === "finisher" && stats && (
        <FinisherOverlay characterId={character.id} level={stats.level} onDone={() => setPhase("result")} />
      )}
    </main>
  );
}
