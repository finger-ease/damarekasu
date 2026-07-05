"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CharacterPortrait } from "./CharacterPortrait";
import { FINISHER_LABEL, type FinisherLevel } from "@/lib/game";

interface Props {
  characterId: string;
  level: FinisherLevel;
  onDone: () => void;
}

/**
 * 必殺「黙れカス」演出。
 * 集中線 → 縦書き大文字が叩き込まれる → 相手が吹っ飛ぶ → 「撃退」の朱印。
 * レベルが高いほど派手(シェイク・フラッシュ・文字数)。
 */
export function FinisherOverlay({ characterId, level, onDone }: Props) {
  const [stage, setStage] = useState<"slam" | "blow" | "stamp">("slam");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("blow"), 900);
    const t2 = setTimeout(() => setStage("stamp"), 1700);
    const t3 = setTimeout(onDone, 3300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${level >= 2 ? "shake-hard" : "shake-soft"}`}
      style={{ background: "var(--paper)" }}
      role="dialog"
      aria-label="必殺・黙れカス発動中"
    >
      {/* 集中線 */}
      <motion.div
        className="speedlines absolute inset-[-20%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: level === 3 ? 0.9 : 0.55, rotate: level === 3 ? 14 : 6 }}
        transition={{ opacity: { duration: 0.15 }, rotate: { duration: 3.2, ease: "linear" } }}
      />

      {/* Lv3はフラッシュ */}
      {level === 3 && (
        <motion.div
          className="absolute inset-0"
          style={{ background: "var(--shu)" }}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: [0.9, 0, 0.5, 0] }}
          transition={{ duration: 0.6, times: [0, 0.3, 0.6, 1] }}
        />
      )}

      {/* 吹っ飛ぶ相手 */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        initial={{ x: "-50%", y: "-42%", rotate: 0, opacity: 1 }}
        animate={
          stage === "slam"
            ? { x: "-50%", y: "-42%" }
            : {
                x: level === 1 ? "10%" : "60%",
                y: level === 1 ? "-70%" : "-160%",
                rotate: level === 1 ? 24 : 65 + level * 20,
                opacity: stage === "stamp" && level >= 2 ? 0 : 1,
              }
        }
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
      >
        <CharacterPortrait characterId={characterId} emotion={stage === "slam" ? "furious" : "defeated"} size={380} />
      </motion.div>

      {/* 縦書き「黙れカス」 */}
      <motion.p
        className="manga-display absolute left-[12%] top-1/2 z-10 select-none text-ink"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          fontSize: level === 3 ? "min(18vw, 11rem)" : level === 2 ? "min(14vw, 8.5rem)" : "min(11vw, 6.5rem)",
          textShadow: "6px 6px 0 var(--paper), 10px 10px 0 var(--shu)",
        }}
        initial={{ opacity: 0, scale: 3.2, y: "-50%", rotate: -10 }}
        animate={{ opacity: 1, scale: 1, y: "-50%", rotate: level === 3 ? -6 : -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }}
      >
        {FINISHER_LABEL[level]}
      </motion.p>

      {/* 撃退の朱印 */}
      {stage === "stamp" && (
        <motion.div
          className="absolute right-[14%] top-[16%] grid h-44 w-44 place-items-center rounded-full"
          style={{
            border: "10px solid var(--shu)",
            color: "var(--shu)",
            background: "transparent",
          }}
          initial={{ opacity: 0, scale: 2.6, rotate: 4 }}
          animate={{ opacity: [0, 1, 0.92], scale: 1, rotate: -12 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
        >
          <span className="manga-display text-6xl" style={{ writingMode: "vertical-rl", textOrientation: "upright" }}>
            撃退
          </span>
        </motion.div>
      )}
    </div>
  );
}
