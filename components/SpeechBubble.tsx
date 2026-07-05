"use client";

import { motion } from "framer-motion";

interface Props {
  text: string;
  /** 考え中は「……」をアニメーション表示 */
  thinking?: boolean;
  /** 理不尽度が高いセリフはトゲトゲしくする */
  spiky?: boolean;
}

export function SpeechBubble({ text, thinking = false, spiky = false }: Props) {
  return (
    <motion.div
      key={thinking ? "thinking" : text}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative koma max-w-xl px-6 py-4"
      style={
        spiky
          ? { borderStyle: "double", borderWidth: 6, boxShadow: "8px 8px 0 0 var(--shu)" }
          : undefined
      }
    >
      {thinking ? (
        <span className="inline-flex gap-1 text-2xl font-black" aria-label="考え中">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            >
              ●
            </motion.span>
          ))}
        </span>
      ) : (
        <p className="text-lg md:text-xl font-bold leading-relaxed">{text}</p>
      )}
      {/* 吹き出しのしっぽ */}
      <span
        aria-hidden
        className="absolute -bottom-[18px] left-16 block h-0 w-0"
        style={{
          borderLeft: "14px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "20px solid var(--ink)",
        }}
      />
      <span
        aria-hidden
        className="absolute -bottom-[11px] left-[68px] block h-0 w-0"
        style={{
          borderLeft: "10px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "15px solid var(--paper)",
        }}
      />
    </motion.div>
  );
}
