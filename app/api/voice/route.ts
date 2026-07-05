import { NextResponse } from "next/server";
import { getCharacter } from "@/lib/characters";
import { EMOTIONS, type Emotion } from "@/lib/types";

/**
 * ローカルの VOICEVOX エンジンでセリフを音声合成して WAV を返すプロキシ。
 * audio_query → (キャラ基本値+感情オフセットでパラメータ調整) → synthesis の2段。
 */
const VOICEVOX_URL = process.env.VOICEVOX_URL ?? "http://127.0.0.1:50021";

/** 感情ごとの調子(キャラ基本値に加算) */
const EMOTION_OFFSETS: Record<Emotion, { speed: number; pitch: number; intonation: number }> = {
  normal: { speed: 0, pitch: 0, intonation: 0 },
  annoyed: { speed: 0.03, pitch: -0.01, intonation: 0.1 },
  angry: { speed: 0.08, pitch: 0.02, intonation: 0.25 },
  smug: { speed: -0.05, pitch: 0.02, intonation: 0.2 },
  furious: { speed: 0.15, pitch: 0.04, intonation: 0.4 },
};

export async function POST(req: Request) {
  try {
    const { text, characterId, emotion } = await req.json();
    const character = getCharacter(characterId);
    if (!character || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "characterId と text を指定してください" }, { status: 400 });
    }
    const offset = EMOTION_OFFSETS[(EMOTIONS.includes(emotion) ? emotion : "normal") as Emotion];
    const { speaker, speedScale = 1, pitchScale = 0 } = character.voice;

    const queryRes = await fetch(
      `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`,
      { method: "POST" },
    );
    if (!queryRes.ok) throw new Error(`audio_query failed: ${queryRes.status}`);
    const query = await queryRes.json();
    query.speedScale = speedScale + offset.speed;
    query.pitchScale = pitchScale + offset.pitch;
    query.intonationScale = (query.intonationScale ?? 1) + offset.intonation;

    const synthRes = await fetch(`${VOICEVOX_URL}/synthesis?speaker=${speaker}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    if (!synthRes.ok || !synthRes.body) throw new Error(`synthesis failed: ${synthRes.status}`);

    return new Response(synthRes.body, { headers: { "Content-Type": "audio/wav" } });
  } catch (e) {
    // VOICEVOX 未起動などはクライアント側で音声なしにフォールバックする
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
