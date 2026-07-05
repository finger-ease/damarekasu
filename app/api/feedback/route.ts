import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/claude";
import { FEEDBACK_PROMPT } from "@/lib/characters";
import type { FeedbackResult } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId を指定してください" }, { status: 400 });
    }

    const result = await callClaude({
      resumeSessionId: sessionId,
      prompt: FEEDBACK_PROMPT,
    });

    const raw = extractJson<Partial<FeedbackResult>>(result.text);
    const feedback: FeedbackResult = {
      summary: raw?.summary ?? result.text,
      good: toList(raw?.good),
      weak: toList(raw?.weak),
      advice: toList(raw?.advice),
    };
    return NextResponse.json(feedback);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((s): s is string => typeof s === "string").slice(0, 3);
  return [];
}
