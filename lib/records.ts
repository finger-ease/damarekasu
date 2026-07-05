/** localStorageに保存するキャラ別戦績 */
export interface CharacterRecord {
  plays: number;
  bestScore: number;
  bestTurns: number;
  bestTitle: string;
}

const KEY = "damarekasu:records";

export function loadRecords(): Record<string, CharacterRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveResult(characterId: string, score: number, turns: number, title: string): CharacterRecord {
  const records = loadRecords();
  const prev = records[characterId];
  const next: CharacterRecord = {
    plays: (prev?.plays ?? 0) + 1,
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    bestTurns: Math.max(prev?.bestTurns ?? 0, turns),
    bestTitle: score >= (prev?.bestScore ?? 0) ? title : (prev?.bestTitle ?? title),
  };
  records[characterId] = next;
  localStorage.setItem(KEY, JSON.stringify(records));
  return next;
}
