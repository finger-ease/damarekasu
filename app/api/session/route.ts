import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/claude";
import { buildSystemPrompt, getCharacter, OPENING_PROMPT } from "@/lib/characters";
import { normalizeTurn } from "@/lib/game";
import type { OpponentTurn, SessionResponse } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { characterId, topic } = await req.json();
    const character = getCharacter(characterId);
    if (!character || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "characterId と topic を指定してください" }, { status: 400 });
    }

    const result = await callClaude({
      systemPrompt: buildSystemPrompt(character, topic.trim()),
      prompt: OPENING_PROMPT,
    });

    const raw = extractJson<OpponentTurn>(result.text);
    const response: SessionResponse = {
      sessionId: result.sessionId,
      turn: normalizeTurn(raw ?? {}, result.text),
    };
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
