import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * claude -p (Claude Code CLI ヘッドレスモード) を子プロセスとして呼ぶラッパー。
 * APIキー不要で、手元のClaude Code認証をそのまま利用する。
 */

// ロープレのcwd。プロジェクトのCLAUDE.mdやhooksが文脈を汚さないよう専用の空ディレクトリを使う
const RUNTIME_DIR = path.join(process.cwd(), ".claude-runtime");

const MODEL = process.env.DAMARE_MODEL ?? "sonnet";
const TIMEOUT_MS = 120_000;

export interface ClaudeCallResult {
  sessionId: string;
  text: string;
}

interface ClaudeCallOptions {
  prompt: string;
  /** 初回ターンのみ指定。キャラのシステムプロンプト */
  systemPrompt?: string;
  /** 2ターン目以降。前回返ってきた sessionId */
  resumeSessionId?: string;
}

export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeCallResult> {
  mkdirSync(RUNTIME_DIR, { recursive: true });

  const args = [
    "-p",
    "--output-format", "json",
    "--tools", "",
    "--disable-slash-commands",
    "--setting-sources", "",
    "--model", MODEL,
  ];
  if (opts.resumeSessionId) {
    args.push("--resume", opts.resumeSessionId);
  } else if (opts.systemPrompt) {
    args.push("--system-prompt", opts.systemPrompt);
  }
  args.push(opts.prompt);

  const stdout = await run("claude", args, RUNTIME_DIR);

  let parsed: { result?: string; session_id?: string; is_error?: boolean; subtype?: string };
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error(`claude -p の出力をJSONとして解釈できませんでした: ${stdout.slice(0, 500)}`);
  }
  if (parsed.is_error || typeof parsed.result !== "string" || !parsed.session_id) {
    throw new Error(`claude -p がエラーを返しました (${parsed.subtype}): ${String(parsed.result).slice(0, 500)}`);
  }
  return { sessionId: parsed.session_id, text: parsed.result };
}

function run(cmd: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`claude -p が${TIMEOUT_MS / 1000}秒以内に応答しませんでした`));
    }, TIMEOUT_MS);

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`claude コマンドを起動できませんでした。Claude Code CLIがインストールされているか確認してください: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && !stdout.trim()) {
        reject(new Error(`claude -p が異常終了しました (exit ${code}): ${stderr.slice(0, 500)}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * モデルの応答テキストから最初のJSONオブジェクトを抜き出してパースする。
 * コードフェンスや前置きが混ざっても耐えるゆるい抽出。失敗時はnull。
 */
export function extractJson<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
