import type { TavilySearchResponse, TavilyExtractResponse } from "./types.js";
import { executeWithRotation, type HttpCallResult } from "./rotation.js";

const SEARCH_URL = "https://api.tavily.com/search";
const EXTRACT_URL = "https://api.tavily.com/extract";

async function callTavily<T>(
  url: string,
  body: Record<string, unknown>,
  apiKey: string
): Promise<HttpCallResult<T>> {
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    return { ok: false, status: 0, message: String(err) };
  }

  const retryAfterSecs = resp.headers.has("retry-after")
    ? Number(resp.headers.get("retry-after"))
    : undefined;

  if (!resp.ok) {
    let errMsg = `HTTP ${resp.status}`;
    try {
      const body = await resp.text();
      if (body) errMsg += `: ${body}`;
    } catch { /* ignore */ }
    return { ok: false, status: resp.status, message: errMsg, retryAfterSecs };
  }

  let data: T;
  try {
    data = (await resp.json()) as T;
  } catch (err) {
    return { ok: false, status: 0, message: `Failed to parse response: ${String(err)}` };
  }

  // Extract usage credits if present
  const usage = (data as unknown as { usage?: { credits?: number } }).usage;
  const usageCredits = typeof usage?.credits === "number" ? usage.credits : undefined;

  return { ok: true, data, usageCredits };
}

// ---------------------------------------------------------------------------
// web_search
// ---------------------------------------------------------------------------
export interface SearchParams {
  query: string;
  depth: "basic" | "advanced";
  max_results: number;
  topic: "general" | "news" | "finance";
  time_range?: "day" | "week" | "month" | "year";
  include_domains?: string[];
  exclude_domains?: string[];
}

export type SearchResult =
  | { ok: true; data: TavilySearchResponse }
  | { ok: false; message: string; isAllExhausted?: boolean };

export async function search(params: SearchParams): Promise<SearchResult> {
  const body: Record<string, unknown> = {
    query: params.query,
    search_depth: params.depth === "advanced" ? "advanced" : "basic",
    max_results: params.max_results,
    topic: params.topic,
    include_usage: true,
    include_raw_content: params.depth === "advanced" ? "markdown" : false,
  };
  if (params.depth === "advanced") body.include_answer = "basic";
  if (params.time_range) body.time_range = params.time_range;
  if (params.include_domains?.length) body.include_domains = params.include_domains;
  if (params.exclude_domains?.length) body.exclude_domains = params.exclude_domains;

  const staticCredits = params.depth === "advanced" ? 2 : 1;

  return executeWithRotation<TavilySearchResponse>(
    (apiKey) => callTavily<TavilySearchResponse>(SEARCH_URL, body, apiKey),
    staticCredits
  );
}

// ---------------------------------------------------------------------------
// web_extract
// ---------------------------------------------------------------------------
export interface ExtractParams {
  urls: string | string[];
  extract_depth: "basic" | "advanced";
  query?: string;
}

export type ExtractResult =
  | { ok: true; data: TavilyExtractResponse }
  | { ok: false; message: string; isAllExhausted?: boolean };

export async function extract(params: ExtractParams): Promise<ExtractResult> {
  const urlCount = Array.isArray(params.urls) ? params.urls.length : 1;
  const depthMult = params.extract_depth === "advanced" ? 2 : 1;
  const staticCredits = Math.ceil(urlCount / 5) * depthMult;

  const body: Record<string, unknown> = {
    urls: params.urls,
    extract_depth: params.extract_depth,
    format: "markdown",
    include_usage: true,
  };
  if (params.query) body.query = params.query;

  return executeWithRotation<TavilyExtractResponse>(
    (apiKey) => callTavily<TavilyExtractResponse>(EXTRACT_URL, body, apiKey),
    staticCredits
  );
}
