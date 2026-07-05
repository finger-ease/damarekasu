"use client";

import { useEffect } from "react";
import { sfx, useMuted } from "@/lib/sfx";

/** 全画面に常駐する効果音オン・オフボタン。効果音のプリロード起点も兼ねる。 */
export function MuteButton() {
  const muted = useMuted();

  useEffect(() => {
    sfx.preload();
  }, []);

  return (
    <button
      type="button"
      aria-pressed={muted}
      aria-label="効果音のオン・オフ"
      onClick={() => {
        sfx.toggleMuted();
        // 解除時は確認音を鳴らす(toggle後の状態で判定)
        sfx.play("click");
      }}
      className="koma fixed right-3 top-3 z-[60] px-3 py-1 text-xs font-black !shadow-[3px_3px_0_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:!shadow-[2px_2px_0_0_var(--ink)]"
    >
      {muted ? "♪ 消音中" : "♪ ON"}
    </button>
  );
}
