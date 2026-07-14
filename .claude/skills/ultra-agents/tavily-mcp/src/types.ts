export type ExhaustedReason = "401_unauthorized" | "432_plan_limit" | "433_paygo_limit";

export interface KeyState {
  id: string;
  credits_used: number;
  last_used_at: string;
  exhausted: boolean;
  exhausted_at?: string;
  exhausted_reason?: ExhaustedReason;
}

export interface RotationState {
  keys: KeyState[];
  period_start: string;
  last_key_index: number;
  version: number;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  score: number;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
  response_time: number;
  usage?: { credits: number };
}

export interface TavilyExtractResult {
  url: string;
  raw_content: string;
}

export interface TavilyExtractResponse {
  results: TavilyExtractResult[];
  failed_results: Array<{ url: string; error: string }>;
  usage?: { credits: number };
}
