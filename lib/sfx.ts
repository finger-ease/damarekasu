import { useSyncExternalStore } from "react";

/**
 * 効果音マネージャ。音源は public/sfx/(Kenney.nl の CC0 素材、public/sfx/README.md 参照)。
 * モジュールシングルトンとして `sfx.play("name")` で鳴らす。
 */
const MASTER_VOLUME = 0.7;

const MANIFEST = {
  select: { src: "/sfx/select.mp3", volume: 0.6 },
  start: { src: "/sfx/start.mp3", volume: 0.8 },
  send: { src: "/sfx/send.mp3", volume: 0.6 },
  reply: { src: "/sfx/reply.mp3", volume: 0.6 },
  spiky: { src: "/sfx/spiky.mp3", volume: 0.55 },
  levelup: { src: "/sfx/levelup.mp3", volume: 0.7 },
  fire: { src: "/sfx/fire.mp3", volume: 0.9 },
  slam: { src: "/sfx/slam.mp3", volume: 1 },
  blow: { src: "/sfx/blow.mp3", volume: 0.7 },
  stamp: { src: "/sfx/stamp.mp3", volume: 0.9 },
  result: { src: "/sfx/result.mp3", volume: 0.7 },
  record: { src: "/sfx/record.mp3", volume: 0.8 },
  open: { src: "/sfx/open.mp3", volume: 0.5 },
  close: { src: "/sfx/close.mp3", volume: 0.5 },
  click: { src: "/sfx/click.mp3", volume: 0.5 },
} as const;

export type SfxName = keyof typeof MANIFEST;

const MUTED_KEY = "damarekasu:muted";

const baseAudio = new Map<SfxName, HTMLAudioElement>();
let muted = false;
let mutedLoaded = false;
const listeners = new Set<() => void>();

function loadMuted() {
  if (mutedLoaded || typeof window === "undefined") return;
  mutedLoaded = true;
  try {
    muted = localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    muted = false;
  }
}

function getAudio(name: SfxName): HTMLAudioElement {
  let audio = baseAudio.get(name);
  if (!audio) {
    audio = new Audio(MANIFEST[name].src);
    audio.preload = "auto";
    baseAudio.set(name, audio);
  }
  return audio;
}

export const sfx = {
  play(name: SfxName): void {
    if (typeof window === "undefined") return;
    loadMuted();
    if (muted) return;
    const base = getAudio(name);
    // 再生中なら複製して重ねる(連打対応)。データはブラウザキャッシュを再利用する
    const audio = base.paused || base.ended ? base : (base.cloneNode(true) as HTMLAudioElement);
    audio.volume = Math.min(1, MANIFEST[name].volume * MASTER_VOLUME);
    audio.currentTime = 0;
    // 自動再生ポリシーで拒否されたら黙ってスキップ(リロード直後の第一声など)
    audio.play().catch(() => {});
  },

  preload(): void {
    if (typeof window === "undefined") return;
    for (const name of Object.keys(MANIFEST) as SfxName[]) getAudio(name);
  },

  isMuted(): boolean {
    loadMuted();
    return muted;
  },

  setMuted(value: boolean): void {
    loadMuted();
    muted = value;
    try {
      localStorage.setItem(MUTED_KEY, value ? "1" : "0");
    } catch {
      // localStorage不可でもセッション内では機能する
    }
    listeners.forEach((l) => l());
  },

  toggleMuted(): void {
    this.setMuted(!this.isMuted());
  },
};

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** ミュート状態を購読するフック(表示用) */
export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, () => sfx.isMuted(), () => false);
}
