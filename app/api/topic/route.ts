import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/claude";
import { buildTopicGenerationPrompt, getCharacter, TOPIC_GENERATION_PROMPT } from "@/lib/characters";
import type { TopicResponse } from "@/lib/types";

export const maxDuration = 300;

const MAX_TOPIC_LENGTH = 60;

export async function POST(req: Request) {
  try {
    const { characterId } = await req.json();
    const character = getCharacter(characterId);
    if (!character) {
      return NextResponse.json({ error: "characterId を指定してください" }, { status: 400 });
    }

    const result = await callClaude({
      systemPrompt: buildTopicGenerationPrompt(character),
      prompt: TOPIC_GENERATION_PROMPT,
    });

    const raw = extractJson<TopicResponse>(result.text);
    const topics = [
      ...new Set(
        (Array.isArray(raw?.topics) ? raw.topics : [])
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH))
          .filter(Boolean),
      ),
    ];
    if (topics.length === 0) {
      return NextResponse.json({ error: "お題を生成できませんでした" }, { status: 500 });
    }

    const response: TopicResponse = { topics };
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
