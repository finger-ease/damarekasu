"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Character } from "@/lib/characters";
import { calcScore, grantTitle, type GameStats } from "@/lib/game";
import type { FeedbackResult } from "@/lib/types";

interface Props {
  character: Character;
  stats: GameStats;
  feedback: FeedbackResult | null;
  feedbackError: string | null;
  isNewRecord: boolean;
  onRetry: () => void;
}

/** 査定表風のリザルト画面。称号は朱印で押される */
export function ResultScreen({ character, stats, feedback, feedbackError, isNewRecord, onRetry }: Props) {
  const score = calcScore(stats);
  const title = grantTitle(stats);

  return (
    <motion.main
      className="mx-auto w-full max-w-3xl px-4 py-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-6 border-b-4 border-ink pb-3">
        <p className="text-xs font-black tracking-[0.4em] text-ink/60">戦 闘 査 定 表</p>
        <h1 className="manga-display mt-1 text-3xl md:text-4xl">
          {character.name} を撃退した
        </h1>
      </header>

      <section className="koma relative mb-8 p-6">
        {/* 称号の朱印 */}
        <motion.div
          className="absolute -right-4 -top-6 grid h-32 w-32 place-items-center rounded-full md:h-36 md:w-36"
          style={{ border: "7px solid var(--shu)", color: "var(--shu)", rotate: "-12deg" }}
          initial={{ opacity: 0, scale: 2.2 }}
          animate={{ opacity: 0.95, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.5 }}
        >
          <span className="px-2 text-center text-lg font-black leading-tight">{title}</span>
        </motion.div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 font-mono text-sm md:grid-cols-3">
          <Stat label="耐久ターン" value={`${stats.turns} 回`} />
          <Stat label="浴びた理不尽" value={`${stats.totalUnreasonableness} pt`} />
          <Stat label="与えた正論" value={`${stats.totalPersuasionDamage} pt`} />
          <Stat label="発動ゲージ" value={`${stats.gauge} %`} />
          <Stat label="必殺レベル" value={`Lv${stats.level}`} />
        </dl>
        <div className="mt-5 flex items-baseline gap-3 border-t-2 border-dashed border-ink/40 pt-4">
          <span className="text-xs font-black tracking-widest">総合スコア</span>
          <span className="manga-display text-5xl tabular-nums">{score.toLocaleString()}</span>
          {isNewRecord && (
            <motion.span
              className="manga-display text-shu text-xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              自己ベスト更新!
            </motion.span>
          )}
        </div>
      </section>

      <section className="koma mb-8 p-6">
        <h2 className="manga-display mb-4 border-b-2 border-ink pb-2 text-xl">
          コーチ講評 <span className="text-xs font-bold text-ink/50">(想定問答フィードバック)</span>
        </h2>
        {feedbackError ? (
          <p className="text-sm font-bold text-shu">講評の取得に失敗しました: {feedbackError}</p>
        ) : !feedback ? (
          <p className="animate-pulse text-sm font-bold text-ink/60">コーチが議事録を読み返しています……</p>
        ) : (
          <div className="space-y-5 text-sm leading-relaxed">
            <p className="font-bold">{feedback.summary}</p>
            <FeedbackList mark="○" tone="text-emerald-700" heading="良かった返し" items={feedback.good} />
            <FeedbackList mark="△" tone="text-shu" heading="弱かった返し" items={feedback.weak} />
            <FeedbackList mark="→" tone="text-ink" heading="実戦へのアドバイス" items={feedback.advice} />
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={onRetry}
          className="koma px-6 py-3 text-lg font-black !shadow-[5px_5px_0_0_var(--ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:!shadow-[3px_3px_0_0_var(--ink)]"
        >
          同じ相手にもう一戦
        </button>
        <Link
          href="/"
          className="koma px-6 py-3 text-lg font-black !shadow-[5px_5px_0_0_var(--ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:!shadow-[3px_3px_0_0_var(--ink)]"
        >
          相手を変える
        </Link>
      </div>
    </motion.main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black tracking-widest text-ink/60">{label}</dt>
      <dd className="text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function FeedbackList({ mark, tone, heading, items }: { mark: string; tone: string; heading: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-1 text-xs font-black tracking-widest text-ink/60">{heading}</h3>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={`font-black ${tone}`}>{mark}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
