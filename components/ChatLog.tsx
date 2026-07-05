"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  opponentName: string;
}

/** 議事録ドロワー: これまでのやり取りの全文 */
export function ChatLog({ open, onClose, messages, opponentName }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="koma fixed right-0 top-0 z-40 h-full w-full max-w-md overflow-y-auto !border-r-0 !shadow-none p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            aria-label="議事録"
          >
            <div className="mb-4 flex items-center justify-between border-b-4 border-ink pb-2">
              <h2 className="manga-display text-xl">議事録</h2>
              <button
                type="button"
                onClick={onClose}
                // 右上に常駐する MuteButton と重ならないよう左に避ける
                className="koma mr-24 px-3 py-1 text-sm font-black !shadow-[3px_3px_0_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:!shadow-[2px_2px_0_0_var(--ink)]"
              >
                閉じる
              </button>
            </div>
            <ol className="space-y-4">
              {messages.map((m, i) => (
                <li key={i}>
                  <p className="mb-1 text-[11px] font-black tracking-widest text-ink/60">
                    {m.role === "user" ? "あなた" : opponentName}
                  </p>
                  <p
                    className={`whitespace-pre-wrap text-sm leading-relaxed ${
                      m.role === "opponent" ? "font-bold" : ""
                    }`}
                  >
                    {m.text}
                  </p>
                </li>
              ))}
            </ol>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
