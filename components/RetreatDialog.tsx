"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 撤退確認ダイアログ: 会話の途中でキャラ選択に戻る前のワンクッション */
export function RetreatDialog({ open, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-label="撤退の確認"
            className="koma fixed left-1/2 top-1/2 z-40 w-[min(90vw,26rem)] -translate-x-1/2 -translate-y-1/2 p-6"
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: -1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            <p className="text-[10px] font-black tracking-[0.4em] text-ink/60">戦 略 的 撤 退</p>
            <h2 className="manga-display mt-1 text-2xl">ここで引き上げるか?</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed text-ink/70">
              この対戦の戦績は記録されない。
              <br />
              出直すのも、立派な戦略だ。
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="koma flex-1 py-3 font-black text-shu !shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:!shadow-[3px_3px_0_0_var(--ink)]"
                style={{ borderColor: "var(--shu)" }}
              >
                撤退する
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="koma flex-1 py-3 font-black !shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:!shadow-[3px_3px_0_0_var(--ink)]"
                autoFocus
              >
                戦い続ける
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
