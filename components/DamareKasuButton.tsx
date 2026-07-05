"use client";

import { motion } from "framer-motion";
import type { FinisherLevel } from "@/lib/game";

interface Props {
  level: FinisherLevel;
  disabled?: boolean;
  onFire: () => void;
}

/**
 * シグネチャー要素: 巨大な印鑑(ハンコ)型の「黙れカス」ボタン。
 * レベルが上がるほど脈動が強くなる。押すと必殺発動。
 */
export function DamareKasuButton({ level, disabled = false, onFire }: Props) {
  const pulse =
    level === 3
      ? { scale: [1, 1.09, 1], rotate: [-3, 3, -3] }
      : level === 2
        ? { scale: [1, 1.04, 1] }
        : {};

  return (
    <motion.button
      type="button"
      onClick={onFire}
      disabled={disabled}
      aria-label="必殺・黙れカスを実行する"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.82 }}
      animate={disabled ? {} : pulse}
      transition={{ duration: level === 3 ? 0.45 : 1.1, repeat: Infinity }}
      className="group relative grid h-32 w-32 place-items-center rounded-full outline-offset-4 focus-visible:outline-4 focus-visible:outline-shu disabled:opacity-40 md:h-40 md:w-40"
      style={{
        background: "radial-gradient(circle at 35% 30%, #e94b3c, var(--shu) 60%, #96150d)",
        border: "5px solid #7a0f09",
        boxShadow: "0 10px 0 0 #7a0f09, 0 14px 24px rgba(0,0,0,.35)",
        color: "#fff5ec",
      }}
    >
      <span
        className="manga-display select-none text-3xl leading-[1.1] md:text-4xl"
        style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
      >
        黙れ
        <br />
        カス
      </span>
      <span className="absolute -bottom-7 whitespace-nowrap text-[10px] font-black tracking-[0.3em] text-ink">
        必殺 Lv{level}
      </span>
    </motion.button>
  );
}
