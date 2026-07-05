import { sfx, subscribeMuted } from "./sfx";

/**
 * BGMマネージャ。音源は public/bgm/(ファイル仕様と生成プロンプトは public/bgm/README.md 参照)。
 * `bgm.play("name")` で曲を指定する。同じ曲なら何もせず、別の曲ならクロスフェードで切り替える。
 * MP3が未配置でも黙ってスキップして進行する(ファイルを置くだけで鳴り出す)。
 * ミュートは効果音(sfx)と共通のトグルに追従する。
 */
const MASTER_VOLUME = 0.45;
const DUCK_RATIO = 0.35; // セリフ読み上げ中に絞る倍率
const FADE_MS = 600;

const MANIFEST = {
  title: { src: "/bgm/title.mp3", volume: 1, loop: true },
  battle: { src: "/bgm/battle.mp3", volume: 1, loop: true },
  battleMax: { src: "/bgm/battle-max.mp3", volume: 1.1, loop: true },
  finisher: { src: "/bgm/finisher.mp3", volume: 1.6, loop: false },
  result: { src: "/bgm/result.mp3", volume: 1, loop: true },
} as const;

export type BgmName = keyof typeof MANIFEST;

const cache = new Map<BgmName, HTMLAudioElement>();
const fadeTimers = new Map<HTMLAudioElement, ReturnType<typeof setInterval>>();
let currentName: BgmName | null = null;
let currentAudio: HTMLAudioElement | null = null;
let ducked = false;
let unlockArmed = false;

function targetVolume(name: BgmName): number {
  return Math.min(1, MANIFEST[name].volume * MASTER_VOLUME) * (ducked ? DUCK_RATIO : 1);
}

function cancelFade(audio: HTMLAudioElement) {
  const timer = fadeTimers.get(audio);
  if (timer !== undefined) {
    clearInterval(timer);
    fadeTimers.delete(audio);
  }
}

function fadeTo(audio: HTMLAudioElement, target: number, onDone?: () => void) {
  cancelFade(audio);
  const start = audio.volume;
  const startAt = performance.now();
  const timer = setInterval(() => {
    const ratio = Math.min(1, (performance.now() - startAt) / FADE_MS);
    audio.volume = start + (target - start) * ratio;
    if (ratio >= 1) {
      cancelFade(audio);
      onDone?.();
    }
  }, 50);
  fadeTimers.set(audio, timer);
}

function getAudio(name: BgmName): HTMLAudioElement {
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(MANIFEST[name].src);
    audio.preload = "auto";
    cache.set(name, audio);
  }
  return audio;
}

/** 曲を頭から再生してフェードインする。自動再生拒否なら最初のユーザー操作で再試行する */
function startTrack(name: BgmName) {
  const audio = getAudio(name);
  audio.loop = MANIFEST[name].loop;
  cancelFade(audio);
  try {
    audio.currentTime = 0;
  } catch {
    // 未ロードでも play() が先頭から始めるので問題ない
  }
  audio.volume = 0;
  currentAudio = audio;
  audio
    .play()
    .then(() => fadeTo(audio, targetVolume(name)))
    .catch(() => {
      // ファイル未配置(audio.errorあり)なら諦める。自動再生ポリシー拒否なら操作を待って再試行
      if (!audio.error) installUnlock();
    });
}

function installUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const retry = () => {
    window.removeEventListener("pointerdown", retry);
    window.removeEventListener("keydown", retry);
    unlockArmed = false;
    if (currentName && !sfx.isMuted()) startTrack(currentName);
  };
  window.addEventListener("pointerdown", retry);
  window.addEventListener("keydown", retry);
}

// ミュートに追従: ON で即停止、OFF で流れていた曲を再開する
if (typeof window !== "undefined") {
  subscribeMuted(() => {
    if (sfx.isMuted()) {
      if (currentAudio) {
        cancelFade(currentAudio);
        currentAudio.pause();
      }
    } else if (currentName) {
      startTrack(currentName);
    }
  });
}

export const bgm = {
  /** 曲を指定する。同じ曲が再生中なら何もしない(ゲージ変動のたびに呼んでも安全) */
  play(name: BgmName): void {
    if (typeof window === "undefined") return;
    if (currentName === name) return;
    currentName = name;
    const old = currentAudio;
    currentAudio = null;
    if (old) fadeTo(old, 0, () => old.pause());
    if (sfx.isMuted()) return; // ミュート解除時に subscribeMuted から再開される
    startTrack(name);
  },

  /** フェードアウトして止める */
  stop(): void {
    currentName = null;
    const old = currentAudio;
    currentAudio = null;
    if (old) fadeTo(old, 0, () => old.pause());
  },

  /** セリフ読み上げ中の音量ダッキング */
  setDucked(value: boolean): void {
    if (ducked === value) return;
    ducked = value;
    if (currentAudio && currentName && !currentAudio.paused) {
      fadeTo(currentAudio, targetVolume(currentName));
    }
  },
};
