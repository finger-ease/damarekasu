import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/claude";
import { withTurnDirection } from "@/lib/characters";
import { normalizeTurn } from "@/lib/game";
import type { OpponentTurn, SessionResponse } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { sessionId, message } = await req.json();
    if (typeof sessionId !== "string" || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "sessionId と message を指定してください" }, { status: 400 });
    }

    const result = await callClaude({
      resumeSessionId: sessionId,
      prompt: withTurnDirection(message.trim()),
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
