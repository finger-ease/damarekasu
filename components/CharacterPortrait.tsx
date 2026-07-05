"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PortraitEmotion } from "@/lib/types";

interface Props {
  characterId: string;
  emotion: PortraitEmotion;
  /** 相手が考え中(腕組みゆらゆら) */
  thinking?: boolean;
  size?: number;
}

/** PNGの存在確認結果のキャッシュ(セッション中は再プローブしない) */
const pngCache = new Map<string, boolean>();

/**
 * 外注PNGの有無をプローブする。imgタグのonErrorはSSR直アクセス時に
 * hydration前のエラーを取りこぼすため、new Image()で確認する。
 */
function usePngExists(src: string): boolean {
  const [exists, setExists] = useState(pngCache.get(src) ?? false);
  useEffect(() => {
    const cached = pngCache.get(src);
    if (cached !== undefined) {
      setExists(cached);
      return;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      pngCache.set(src, true);
      if (alive) setExists(true);
    };
    img.onerror = () => {
      pngCache.set(src, false);
      if (alive) setExists(false);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return exists;
}

/**
 * 立ち絵。外注PNG(public/characters/<id>/<emotion>.png)があればそれを使い、
 * なければプレースホルダーSVGにフォールバックする。表情はクロスフェード切替。
 */
export function CharacterPortrait({ characterId, emotion, thinking = false, size = 420 }: Props) {
  const png = `/characters/${characterId}/${emotion}.png`;
  const svg = `/characters/${characterId}/${emotion}.svg`;
  const src = usePngExists(png) ? png : svg;

  const mood = emotion === "furious" ? "tremble" : thinking ? "ponder" : "";

  return (
    <div className={mood} style={{ width: size, height: size, position: "relative" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          width={size}
          height={size}
          draggable={false}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ position: "absolute", inset: 0, userSelect: "none" }}
        />
      </AnimatePresence>
    </div>
  );
}
