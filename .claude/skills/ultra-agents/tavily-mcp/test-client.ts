import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from "node:fs/promises";
import { join } from "node:path";

// Server is always launched from the tavily-mcp/ working directory
const SERVER_PATH = join(process.cwd(), "dist", "src", "index.js");

function buildEnv(overrides: Record<string, string>): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) merged[k] = v;
  }
  for (const [k, v] of Object.entries(overrides)) {
    merged[k] = v;
  }
  return merged;
}

async function withClient<T>(
  envOverrides: Record<string, string>,
  fn: (client: Client) => Promise<T>
): Promise<T> {
  const transport = new StdioClientTransport({
    command: "node",
    args: [SERVER_PATH],
    env: buildEnv(envOverrides),
  });
  const client = new Client({ name: "tavily-test", version: "1.0.0" });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

interface ToolCallResult {
  isError?: boolean;
  content: Array<{ type: string; text?: string }>;
}

// The SDK callTool return is a CompatibilityCallToolResult union; we coerce to our local type.
function coerce(r: unknown): ToolCallResult {
  const raw = r as { isError?: boolean; content?: Array<{ type: string; text?: string }> };
  return { isError: raw.isError, content: raw.content ?? [] };
}

function textOf(result: ToolCallResult): string {
  return result.content[0]?.text ?? "";
}

// ---------------------------------------------------------------------------
// list-tools
// ---------------------------------------------------------------------------
async function testListTools(): Promise<void> {
  const result = await withClient({}, async (client) => client.listTools());
  const names = result.tools.map((t) => t.name);
  if (!names.includes("web_search") || !names.includes("web_extract")) {
    throw new Error(`Expected web_search and web_extract; got: ${names.join(", ")}`);
  }
  console.log("PASS list-tools: web_search, web_extract");
}

// ---------------------------------------------------------------------------
// live-search  (requires real key in env — dispatcher only)
// ---------------------------------------------------------------------------
async function testLiveSearch(): Promise<void> {
  const result = await withClient({}, async (client) =>
    client.callTool({ name: "web_search", arguments: { query: "test", max_results: 1, depth: "basic" } })
  );
  const r = coerce(result);
  if (r.isError) throw new Error(`Expected success, got error: ${textOf(r)}`);
  const data = JSON.parse(textOf(r)) as { results: Array<{ title?: string; url?: string }> };
  if (!data.results[0]?.title || !data.results[0]?.url) {
    throw new Error(`Expected result with title+url; got: ${textOf(r)}`);
  }
  console.log("PASS live-search");
}

// ---------------------------------------------------------------------------
// rotation-advance  (requires real keys in env — dispatcher only)
// ---------------------------------------------------------------------------
async function testRotationAdvance(): Promise<void> {
  await withClient({}, async (client) => {
    await client.callTool({ name: "web_search", arguments: { query: "hello", max_results: 1, depth: "basic" } });
    await client.callTool({ name: "web_search", arguments: { query: "world", max_results: 1, depth: "basic" } });
  });
  const raw = await fs.readFile(join(process.cwd(), "rotation-state.json"), "utf-8");
  const st = JSON.parse(raw) as { keys: Array<{ credits_used: number }> };
  const usedCount = st.keys.filter((k) => k.credits_used > 0).length;
  if (usedCount < 2) {
    throw new Error(`Expected >=2 keys with credits_used>0; got ${usedCount}`);
  }
  console.log("PASS rotation-advance");
}

// ---------------------------------------------------------------------------
// failover  (requires >=1 real key in TAVILY_KEY_2..4 — dispatcher only)
// ---------------------------------------------------------------------------
async function testFailover(): Promise<void> {
  const result = await withClient({ TAVILY_KEY_1: "invalid_key_xxx" }, async (client) =>
    client.callTool({ name: "web_search", arguments: { query: "test", max_results: 1, depth: "basic" } })
  );
  const r = coerce(result);
  if (r.isError) {
    throw new Error(`Expected success via failover; got error: ${textOf(r)}`);
  }
  const raw = await fs.readFile(join(process.cwd(), "rotation-state.json"), "utf-8");
  const st = JSON.parse(raw) as { keys: Array<{ id: string; exhausted: boolean; exhausted_reason?: string }> };
  const key1 = st.keys.find((k) => k.id === "key_1");
  if (!key1?.exhausted || key1.exhausted_reason !== "401_unauthorized") {
    throw new Error(`Expected key_1 exhausted with 401_unauthorized; got: ${JSON.stringify(key1)}`);
  }
  console.log("PASS failover");
}

// ---------------------------------------------------------------------------
// all-exhausted  (all 4 env keys must be invalid — safe for verify)
// ---------------------------------------------------------------------------
async function testAllExhausted(): Promise<void> {
  const result = await withClient(
    { TAVILY_KEY_1: "bad1", TAVILY_KEY_2: "bad2", TAVILY_KEY_3: "bad3", TAVILY_KEY_4: "bad4" },
    async (client) =>
      client.callTool({ name: "web_search", arguments: { query: "test", max_results: 1, depth: "basic" } })
  );
  const r = coerce(result);
  if (!r.isError) {
    throw new Error(`Expected isError=true; got success with: ${textOf(r)}`);
  }
  const text = textOf(r);
  if (!text.includes("ALL_KEYS_EXHAUSTED")) {
    throw new Error(`Expected ALL_KEYS_EXHAUSTED in response text; got: ${text}`);
  }
  console.log("PASS all-exhausted");
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const TESTS: Record<string, () => Promise<void>> = {
  "list-tools": testListTools,
  "live-search": testLiveSearch,
  "rotation-advance": testRotationAdvance,
  failover: testFailover,
  "all-exhausted": testAllExhausted,
};

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) {
    console.error(
      "Usage: npx tsx test-client.ts <list-tools|live-search|rotation-advance|failover|all-exhausted|all>"
    );
    process.exit(1);
  }

  if (arg === "all") {
    let failures = 0;
    for (const [name, fn] of Object.entries(TESTS)) {
      try {
        await fn();
      } catch (err) {
        console.error(`FAIL ${name}: ${String(err)}`);
        failures++;
      }
    }
    if (failures > 0) process.exit(1);
    return;
  }

  const test = TESTS[arg];
  if (!test) {
    console.error(`Unknown test "${arg}". Available: ${Object.keys(TESTS).join(", ")}, all`);
    process.exit(1);
  }

  await test();
}

main().catch((err: unknown) => {
  console.error("Fatal:", err);
  process.exit(1);
});
