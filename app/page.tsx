"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { bgm } from "@/lib/bgm";
import { CHARACTERS, type Character } from "@/lib/characters";
import { loadRecords, type CharacterRecord } from "@/lib/records";
import { sfx } from "@/lib/sfx";
import type { TopicResponse } from "@/lib/types";

export default function SelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Character | null>(null);
  const [topic, setTopic] = useState("");
  const [records, setRecords] = useState<Record<string, CharacterRecord>>({});
  const [generating, setGenerating] = useState(false);
  // 1回のfetchで5件生成し、残りをキャラ別にプールして連打を即時化する
  const topicPoolRef = useRef<{ characterId: string; topics: string[] } | null>(null);
  const selectedRef = useRef<Character | null>(null);

  useEffect(() => {
    setRecords(loadRecords());
    // 初回ロード時は自動再生ポリシーで保留され、最初のクリックで鳴り出す
    bgm.play("title");
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const start = () => {
    if (!selected || !topic.trim()) return;
    sfx.play("start");
    router.push(`/play?c=${selected.id}&topic=${encodeURIComponent(topic.trim())}`);
  };

  const generateTopic = async () => {
    if (!selected || generating) return;
    sfx.play("click");

    const pool = topicPoolRef.current;
    if (pool && pool.characterId === selected.id && pool.topics.length > 0) {
      setTopic(pool.topics.shift()!);
      sfx.play("select");
      return;
    }

    const character = selected;
    setGenerating(true);
    try {
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: character.id }),
      });
      if (!res.ok) throw new Error("お題を生成できませんでした");
      const data: TopicResponse = await res.json();
      const [first, ...rest] = data.topics;
      if (!first) throw new Error("お題を生成できませんでした");
      // 生成待ちの間にキャラを切り替えていたら破棄
      if (selectedRef.current?.id !== character.id) return;
      topicPoolRef.current = { characterId: character.id, topics: rest };
      setTopic(first);
      sfx.play("select");
    } catch {
      // 失敗しても定型例から選んで必ず埋める
      if (selectedRef.current?.id !== character.id) return;
      const candidates = character.topicExamples.filter((t) => t !== topic);
      const list = candidates.length > 0 ? candidates : character.topicExamples;
      setTopic(list[Math.floor(Math.random() * list.length)]);
      sfx.play("select");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <header className="mb-10 text-center">
        <p className="mb-1 text-xs font-black tracking-[0.5em] text-ink/60">想 定 問 答 バ ト ル</p>
        <motion.h1
          className="manga-display text-6xl md:text-8xl"
          initial={{ scale: 2.4, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ type: "spring", stiffness: 260, damping: 15 }}
          style={{ textShadow: "5px 5px 0 var(--tone), 9px 9px 0 var(--shu)" }}
        >
          黙れカス
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-relaxed text-ink/70">
          面倒な相手に提案をぶつけて、想定問答を本気で練習。
          <br />
          我慢の限界が来たら——必殺の印鑑を叩き込め。
        </p>
      </header>

      {/* 名刺風キャラカード */}
      <section aria-label="対戦相手を選ぶ" className="mb-10 grid gap-6 md:grid-cols-3">
        {CHARACTERS.map((c, i) => {
          const record = records[c.id];
          const isSelected = selected?.id === c.id;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => {
                sfx.play("select");
                setSelected(c);
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6, rotate: -0.5 }}
              className="koma relative p-4 text-left outline-offset-4 focus-visible:outline-4 focus-visible:outline-shu"
              style={
                isSelected
                  ? { boxShadow: `8px 8px 0 0 ${c.color}`, borderColor: c.color, borderWidth: 4 }
                  : undefined
              }
              aria-pressed={isSelected}
            >
              {/* 名刺ヘッダー */}
              <p className="text-[10px] font-black tracking-widest text-ink/60">{c.title}</p>
              <p className="manga-display mb-2 text-2xl" style={{ color: c.color }}>
                {c.name}
              </p>
              <div className="mx-auto -my-2 w-fit">
                <CharacterPortrait characterId={c.id} emotion={isSelected ? "smug" : "normal"} size={190} />
              </div>
              <p className="koma mt-1 px-3 py-2 text-sm font-bold !shadow-none">「{c.catchphrase}」</p>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">{c.description}</p>
              {record && (
                <p className="mt-3 border-t-2 border-dashed border-ink/30 pt-2 font-mono text-[11px] font-bold text-ink/60">
                  対戦{record.plays}回 / 最高{record.bestScore.toLocaleString()}点 / 称号「{record.bestTitle}」
                </p>
              )}
              {isSelected && (
                <motion.span
                  className="absolute -right-3 -top-4 grid h-14 w-14 place-items-center rounded-full text-sm font-black"
                  style={{ border: "4px solid var(--shu)", color: "var(--shu)", rotate: "-14deg", background: "var(--paper)" }}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                >
                  指名
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </section>

      {/* 稟議書風のお題入力 */}
      <section aria-label="お題を決める" className="koma mx-auto max-w-2xl p-6">
        <label htmlFor="topic" className="mb-2 block">
          <span className="text-[10px] font-black tracking-widest text-ink/60">件 名</span>
          <span className="manga-display ml-3 text-lg">今日は何を通しに行く?</span>
        </label>
        <div className="relative">
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) start();
            }}
            placeholder={
              generating
                ? "お題を考え中……"
                : (selected?.topicPlaceholder ?? "先に相手を指名してください")
            }
            disabled={!selected}
            className="w-full border-b-4 border-ink bg-transparent py-2 pr-12 text-lg font-bold outline-none placeholder:text-ink/35 focus:border-shu disabled:opacity-40"
          />
          <button
            type="button"
            onClick={generateTopic}
            disabled={!selected || generating}
            aria-label="お題を自動生成"
            title="お題を自動生成"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-2xl transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
          >
            <motion.span
              className="inline-block"
              animate={generating ? { rotate: 360 } : { rotate: 0 }}
              transition={
                generating
                  ? { repeat: Infinity, duration: 0.7, ease: "linear" }
                  : { duration: 0.2 }
              }
            >
              🎲
            </motion.span>
          </button>
        </div>
        <button
          type="button"
          onClick={start}
          disabled={!selected || !topic.trim()}
          className="koma mt-6 w-full py-4 text-xl font-black !shadow-[6px_6px_0_0_var(--ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:!shadow-[4px_4px_0_0_var(--ink)] disabled:opacity-40"
          style={selected ? { borderColor: selected.color } : undefined}
        >
          {selected ? `${selected.name} に挑む` : "相手を指名して開戦"}
        </button>
        <p className="mt-3 text-center text-[11px] font-bold text-ink/50">
          ローカルで動作。あなたの手元のClaude Code(claude -p)が相手を演じます。
        </p>
      </section>
    </main>
  );
}
