"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CharacterPortrait } from "./CharacterPortrait";
import { FINISHER_LABEL, type FinisherLevel } from "@/lib/game";
import { sfx } from "@/lib/sfx";

interface Props {
  characterId: string;
  level: FinisherLevel;
  onDone: () => void;
}

/** 爆発フキダシのトゲトゲ多角形。indexベースで形を揺らすので毎回同じ形(SSR安全) */
function burstPoints(spikes: number): string {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const wobble = i % 2 === 0 ? 0.82 + 0.18 * Math.abs(Math.sin(i * 7.3)) : 0.5 + 0.14 * Math.abs(Math.cos(i * 4.7));
    const r = 50 * wobble;
    const a = (Math.PI * i) / spikes;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** 墨飛沫の飛散パラメータ(決め打ちでバラけさせる) */
const SPLATTERS = [
  { x: -180, y: -240, s: 1.0, r: 40, br: "58% 42% 60% 40% / 50% 55% 45% 50%" },
  { x: 220, y: -180, s: 1.4, r: -70, br: "45% 55% 40% 60% / 60% 40% 55% 45%" },
  { x: -260, y: 120, s: 0.8, r: 110, br: "52% 48% 55% 45% / 45% 58% 42% 55%" },
  { x: 260, y: 200, s: 1.2, r: -30, br: "60% 40% 48% 52% / 42% 52% 48% 58%" },
  { x: 60, y: -300, s: 0.7, r: 80, br: "48% 52% 44% 56% / 56% 44% 52% 48%" },
  { x: -80, y: 280, s: 1.1, r: -120, br: "55% 45% 58% 42% / 48% 50% 50% 52%" },
];

/**
 * 必殺「黙れカス」演出。
 * 白フラッシュ → 墨の闇に朱の爆発フキダシ、一文字ずつ叩き込み+衝撃波+墨飛沫
 * → 相手が吹っ飛ぶ → 「撃退」の朱印。レベルが高いほど激しい。
 */
export function FinisherOverlay({ characterId, level, onDone }: Props) {
  const [stage, setStage] = useState<"slam" | "blow" | "stamp">("slam");
  const chars = FINISHER_LABEL[level].split("");

  useEffect(() => {
    sfx.play("slam");
    const t1 = setTimeout(() => {
      sfx.play("blow");
      setStage("blow");
    }, 1000);
    const t2 = setTimeout(() => {
      sfx.play("stamp");
      setStage("stamp");
    }, 1800);
    const t3 = setTimeout(onDone, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const shakeClass = level === 3 ? "shake-extreme" : level === 2 ? "shake-hard" : "shake-soft";

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${shakeClass}`}
      style={{
        background:
          level === 3
            ? "radial-gradient(circle at 32% 50%, #6d1008 0%, #2b0703 46%, #0d0402 100%)"
            : level === 2
              ? "radial-gradient(circle at 32% 50%, #47170e 0%, #1d0b06 55%, #0e0705 100%)"
              : "radial-gradient(circle at 32% 50%, #3a2c1c 0%, #1b1a17 70%)",
      }}
      role="dialog"
      aria-label="必殺・黙れカス発動中"
    >
      {/* 網点(闇の上にうっすら漫画の質感) */}
      <div className="halftone absolute inset-0 opacity-[0.08] mix-blend-screen" style={{ backgroundColor: "transparent" }} />

      {/* 白の衝撃フラッシュ(全レベル共通・開幕) */}
      <motion.div
        className="absolute inset-0 z-20"
        style={{ background: "#fff" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* Lv3は朱のストロボ連打 */}
      {level === 3 && (
        <motion.div
          className="absolute inset-0 z-20"
          style={{ background: "var(--shu)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0, 0.6, 0, 0.35, 0] }}
          transition={{ duration: 1.1, times: [0, 0.12, 0.24, 0.4, 0.55, 0.75, 1], delay: 0.15 }}
        />
      )}

      {/* 集中線: 紙色(闇に白く走る) */}
      <motion.div
        className="speedlines absolute inset-[-25%]"
        style={{ filter: "invert(1)", opacity: 0.5 }}
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: level === 3 ? 22 : 8, scale: [1, 1.06, 1] }}
        transition={{ rotate: { duration: 3.2, ease: "linear" }, scale: { duration: 0.5, repeat: Infinity } }}
      />

      {/* 集中線: 朱(Lv2以上は逆回転で二重に) */}
      {level >= 2 && (
        <motion.div
          className="speedlines-shu absolute inset-[-25%]"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: level === 3 ? 0.85 : 0.5, rotate: level === 3 ? -30 : -12 }}
          transition={{ opacity: { duration: 0.2 }, rotate: { duration: 3.2, ease: "linear" } }}
        />
      )}

      {/* 吹っ飛ぶ相手 */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-[5]"
        initial={{ x: "-15%", y: "-42%", rotate: 0, opacity: 1 }}
        animate={
          stage === "slam"
            ? { x: "-15%", y: "-42%" }
            : {
                x: level === 1 ? "10%" : "70%",
                y: level === 1 ? "-70%" : "-180%",
                rotate: level === 1 ? 24 : 80 + level * 30,
                opacity: stage === "stamp" && level >= 2 ? 0 : 1,
              }
        }
        transition={{ type: "spring", stiffness: level === 3 ? 220 : 160, damping: 15 }}
      >
        <CharacterPortrait characterId={characterId} emotion={stage === "slam" ? "furious" : "defeated"} size={380} />
      </motion.div>

      {/* 吹っ飛び時の擬音(Lv2以上) */}
      {level >= 2 && stage !== "slam" && (
        <motion.p
          className="manga-display absolute right-[8%] top-[52%] z-[6] select-none"
          style={{
            color: "var(--paper)",
            fontSize: "min(9vw, 5rem)",
            WebkitTextStroke: "3px var(--ink)",
            textShadow: "5px 5px 0 var(--shu)",
            rotate: "12deg",
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 1, 0.9], scale: [0.4, 1.5, 1.15, 1.2] }}
          transition={{ duration: 0.5 }}
        >
          ドゴォッ
        </motion.p>
      )}

      {/* 爆発フキダシ+縦書き文字(同一コンテナで中央揃え) */}
      <div
        className="absolute left-[30%] top-1/2 z-[8] grid place-items-center"
        style={{
          width: level === 3 ? "min(74vw, 52rem)" : level === 2 ? "min(60vw, 42rem)" : "min(48vw, 32rem)",
          height: level === 3 ? "min(74vw, 52rem)" : level === 2 ? "min(60vw, 42rem)" : "min(48vw, 32rem)",
          translate: "-50% -50%",
        }}
      >
        {/* 脈動はラッパー側、登場はsvg側でtransform衝突を回避 */}
        <div className={`absolute inset-0 ${level === 3 ? "burst-throb" : ""}`}>
          <motion.svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0.2, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
          >
            {/* 外周の朱トゲ → 内側に墨 → さらに紙(Lv3は金)のフチで漫画の爆発 */}
            <polygon points={burstPoints(26)} fill="var(--shu)" />
            <polygon points={burstPoints(22)} fill="var(--ink)" transform="translate(50 50) scale(0.86) translate(-50 -50)" />
            <polygon
              points={burstPoints(22)}
              fill={level === 3 ? "var(--gold)" : "var(--paper)"}
              transform="translate(50 50) scale(0.8) translate(-50 -50)"
            />
          </motion.svg>
        </div>

        {/* 縦書き「黙れカス」: 一文字ずつ叩き込む。「!!!」は明示的に隣の列へ */}
        <p
          className="manga-display relative z-10 select-none"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "upright",
            lineHeight: 1.04,
            rotate: level === 3 ? "-6deg" : "-2deg",
            fontSize: level === 3 ? "min(15vw, 9.5rem)" : level === 2 ? "min(12vw, 7.5rem)" : "min(10vw, 6rem)",
          }}
        >
          {chars.map((ch, i) => (
            <span key={i} style={{ display: "contents" }}>
              {i === 4 && <br />}
              <motion.span
                className="inline-block"
                style={{
                  color: level === 3 ? "var(--paper)" : "var(--ink)",
                  WebkitTextStroke: level === 3 ? "4px var(--ink)" : undefined,
                  textShadow:
                    level === 3
                      ? "8px 8px 0 var(--shu), 14px 14px 0 var(--ink), 0 0 34px rgba(207,35,24,0.9)"
                      : "6px 6px 0 var(--paper), 10px 10px 0 var(--shu)",
                }}
                initial={{ opacity: 0, scale: 4, rotate: i % 2 === 0 ? -18 : 14 }}
                animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -3 : 2 }}
                transition={{ type: "spring", stiffness: 380, damping: 13, delay: 0.15 + i * 0.09 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </p>
      </div>

      {/* 衝撃波リング(文字位置から拡散、Lv分だけ連発) */}
      {Array.from({ length: level }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-[30%] top-1/2 z-[9] rounded-full"
          style={{
            width: "12rem",
            height: "12rem",
            border: "6px solid var(--paper)",
            boxShadow: "0 0 0 6px var(--shu)",
            translate: "-50% -50%",
          }}
          initial={{ opacity: 0.9, scale: 0.2 }}
          animate={{ opacity: 0, scale: 4.5 + i }}
          transition={{ duration: 0.9, delay: 0.15 + i * 0.22, ease: "easeOut" }}
        />
      ))}

      {/* 墨飛沫(Lv2以上、Lv3は全部飛ぶ) */}
      {level >= 2 &&
        SPLATTERS.slice(0, level === 3 ? 6 : 3).map((sp, i) => (
          <motion.div
            key={i}
            className="absolute left-[30%] top-1/2 z-[9]"
            style={{
              width: `${3.2 * sp.s}rem`,
              height: `${2.6 * sp.s}rem`,
              background: i % 2 === 0 ? "var(--ink)" : "var(--shu)",
              borderRadius: sp.br,
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{ x: sp.x, y: sp.y, scale: sp.s, rotate: sp.r, opacity: [1, 1, 0.85] }}
            transition={{ duration: 0.7, delay: 0.18 + i * 0.05, ease: "easeOut" }}
          />
        ))}

      {/* 撃退の朱印 */}
      {stage === "stamp" && (
        <motion.div
          className="absolute right-[14%] top-[16%] z-10 grid h-44 w-44 place-items-center rounded-full"
          style={{
            border: "10px solid var(--shu)",
            color: "var(--shu)",
            background: "rgba(246,241,229,0.92)",
            boxShadow: "0 0 40px rgba(207,35,24,0.6)",
          }}
          initial={{ opacity: 0, scale: 2.6, rotate: 4 }}
          animate={{ opacity: [0, 1, 0.95], scale: 1, rotate: -12 }}
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
