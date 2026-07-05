"use client";

import { useState } from "react";

interface Props {
  disabled: boolean;
  onSend: (text: string) => void;
}

export function ChatInput({ disabled, onSend }: Props) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="koma flex items-end gap-3 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        placeholder={disabled ? "相手の返答を待っています……" : "冷静に打ち返す(Enterで送信 / Shift+Enterで改行)"}
        disabled={disabled}
        aria-label="あなたの返し"
        className="min-h-[3.5rem] flex-1 resize-none bg-transparent text-base font-medium leading-relaxed outline-none placeholder:text-ink/40 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="koma shrink-0 px-5 py-3 text-base font-black !shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:!shadow-[2px_2px_0_0_var(--ink)] disabled:opacity-40"
      >
        打ち返す
      </button>
    </div>
  );
}
