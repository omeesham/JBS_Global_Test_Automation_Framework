import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { initialize } from "./rotation.js";
import { search, extract } from "./tavily-client.js";

async function loadApiKeys(): Promise<Map<string, string>> {
  const keys = new Map<string, string>();

  // Read env vars TAVILY_KEY_1..4 first
  for (let i = 1; i <= 4; i++) {
    const val = process.env[`TAVILY_KEY_${i}`];
    if (val && val.trim()) keys.set(`key_${i}`, val.trim());
  }

  // Fallback to .env.keys file if no env keys present
  if (keys.size === 0) {
    const envFile = path.resolve(".env.keys");
    try {
      const content = await fs.readFile(envFile, "utf-8");
      let seq = 0;
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const val = trimmed.slice(eqIdx + 1).trim();
        if (val) { seq++; keys.set(`key_${seq}`, val); }
      }
    } catch { /* .env.keys absent — no keys */ }
  }

  return keys;
}

async function main(): Promise<void> {
  const apiKeys = await loadApiKeys();
  await initialize(apiKeys);

  const server = new McpServer({ name: "tavily-mcp", version: "1.0.0" });

  server.registerTool(
    "web_search",
    {
      description:
        "Search the web using Tavily. depth=basic costs 1 credit and returns plain snippets. " +
        "depth=advanced costs 2 credits and additionally returns raw markdown content and a short answer.",
      inputSchema: {
        query: z.string().describe("Search query"),
        depth: z.enum(["basic", "advanced"]).default("basic").describe("Search depth (basic=1cr, advanced=2cr)"),
        max_results: z.number().int().min(1).max(20).default(5).describe("Number of results to return (1-20)"),
        topic: z.enum(["general", "news", "finance"]).default("general").describe("Topic category"),
        time_range: z.enum(["day", "week", "month", "year"]).optional().describe("Filter results by time range"),
        include_domains: z.array(z.string()).optional().describe("Restrict results to these domains"),
        exclude_domains: z.array(z.string()).optional().describe("Exclude results from these domains"),
      },
    },
    async (args) => {
      const result = await search({
        query: args.query,
        depth: args.depth,
        max_results: args.max_results,
        topic: args.topic,
        time_range: args.time_range,
        include_domains: args.include_domains,
        exclude_domains: args.exclude_domains,
      });

      if (!result.ok) {
        return { content: [{ type: "text", text: result.message }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify(result.data) }] };
    }
  );

  server.registerTool(
    "web_extract",
    {
      description:
        "Extract content from one or more URLs using Tavily. " +
        "Credits = ceil(url_count / 5) × depth_mult where depth_mult is 1 for basic and 2 for advanced.",
      inputSchema: {
        urls: z.union([z.string(), z.array(z.string()).max(20)]).describe("URL or list of URLs to extract (max 20)"),
        extract_depth: z.enum(["basic", "advanced"]).default("basic").describe("Extraction depth"),
        query: z.string().optional().describe("Optional query string for result reranking"),
      },
    },
    async (args) => {
      const result = await extract({
        urls: args.urls,
        extract_depth: args.extract_depth,
        query: args.query,
      });

      if (!result.ok) {
        return { content: [{ type: "text", text: result.message }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify(result.data) }] };
    }
  );

  await server.connect(new StdioServerTransport());
}

main().catch((err: unknown) => {
  process.stderr.write(`Fatal: ${String(err)}\n`);
  process.exit(1);
});
