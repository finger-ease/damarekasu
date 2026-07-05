import { sfx, subscribeMuted } from "@/lib/sfx";
import type { Emotion } from "@/lib/types";

/**
 * 敵セリフの VOICEVOX 読み上げマネージャ。/api/voice で合成した WAV を再生する。
 * VOICEVOX 未起動・エラー・タイムアウト時は null を返し、音声なしで進行する。
 */
const SYNTHESIS_TIMEOUT_MS = 8000;
const VOICE_VOLUME = 0.9;

let current: HTMLAudioElement | null = null;

// ミュートに切り替えたら読み上げ中のセリフも即座に黙らせる
if (typeof window !== "undefined") {
  subscribeMuted(() => {
    if (sfx.isMuted()) voice.stop();
  });
}

function releaseAudio(audio: HTMLAudioElement) {
  URL.revokeObjectURL(audio.src);
  if (current === audio) current = null;
}

export const voice = {
  /** セリフを合成し、再生可能な Audio を返す。失敗・ミュート時は null(音声なしフォールバック) */
  async prepare(text: string, characterId: string, emotion: Emotion): Promise<HTMLAudioElement | null> {
    if (typeof window === "undefined" || sfx.isMuted()) return null;
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, characterId, emotion }),
        signal: AbortSignal.timeout(SYNTHESIS_TIMEOUT_MS),
      });
      if (!res.ok) return null;
      const audio = new Audio(URL.createObjectURL(await res.blob()));
      audio.volume = VOICE_VOLUME;
      return audio;
    } catch {
      return null;
    }
  },

  /** 前のセリフが読み上げ中なら止めてから再生する */
  play(audio: HTMLAudioElement | null): void {
    if (!audio) return;
    this.stop();
    if (sfx.isMuted()) {
      releaseAudio(audio);
      return;
    }
    current = audio;
    audio.addEventListener("ended", () => releaseAudio(audio), { once: true });
    // 自動再生ポリシーで拒否されたら黙ってスキップ(リロード直後の第一声など)
    audio.play().catch(() => releaseAudio(audio));
  },

  /** 読み上げを中断する(必殺技発動・ミュート切替・画面離脱用) */
  stop(): void {
    if (!current) return;
    const audio = current;
    audio.pause();
    releaseAudio(audio);
  },
};
