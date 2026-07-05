"use client";

import { motion } from "framer-motion";
import { GAUGE_MAX, finisherLevel } from "@/lib/game";

interface Props {
  gauge: number;
}

/** 格ゲーの超必ゲージ風カタルシスゲージ */
export function CatharsisGauge({ gauge }: Props) {
  const level = finisherLevel(gauge);
  const ratio = Math.min(gauge, GAUGE_MAX) / GAUGE_MAX;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-xs font-black tracking-widest">カタルシス</span>
          <span className="font-mono text-xs font-bold tabular-nums">
            {Math.min(gauge, GAUGE_MAX)} / {GAUGE_MAX}
          </span>
        </div>
        <div className="koma h-6 overflow-hidden !shadow-none p-[3px]">
          <motion.div
            className="h-full"
            style={{
              background:
                level === 3
                  ? "repeating-linear-gradient(-45deg, var(--shu) 0 10px, #f0a13c 10px 20px)"
                  : level === 2
                    ? "var(--shu)"
                    : "var(--gold)",
            }}
            animate={{
              width: `${ratio * 100}%`,
              ...(level === 3 ? { opacity: [1, 0.75, 1] } : { opacity: 1 }),
            }}
            transition={{
              width: { type: "spring", stiffness: 120, damping: 20 },
              opacity: level === 3 ? { duration: 0.7, repeat: Infinity } : { duration: 0.2 },
            }}
          />
        </div>
      </div>
      <motion.div
        key={level}
        initial={{ scale: 1.6, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="koma flex h-12 w-14 flex-col items-center justify-center !shadow-none"
        style={level === 3 ? { background: "var(--shu)", color: "var(--paper)" } : undefined}
      >
        <span className="text-[9px] font-black leading-none">怒り</span>
        <span className="manga-display text-xl leading-none">Lv{level}</span>
      </motion.div>
    </div>
  );
}
