/**
 * SDK Executor — calls Anthropic Messages API directly with a client's API key.
 * Used when execution mode is 'api' or as overflow fallback for 'cli_with_api_overflow'.
 *
 * Zero external dependencies — uses native fetch() (Node 18+).
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Model ID mapping: short name → Anthropic model ID
// NOTE: Model IDs include release dates. Review quarterly. Last verified: 2026-03
const MODEL_MAP: Record<string, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6-20250520',
  opus: 'claude-opus-4-6-20250520',
};

export interface SdkExecutionResult {
  success: boolean;
  output: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  error?: string;
}

// Cost per million tokens (as of 2026-03)
const COST_PER_M_INPUT: Record<string, number> = {
  haiku: 0.25,
  sonnet: 3,
  opus: 15,
};
const COST_PER_M_OUTPUT: Record<string, number> = {
  haiku: 1.25,
  sonnet: 15,
  opus: 75,
};

function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const inputRate = COST_PER_M_INPUT[model] ?? COST_PER_M_INPUT['sonnet']!;
  const outputRate = COST_PER_M_OUTPUT[model] ?? COST_PER_M_OUTPUT['sonnet']!;
  return (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000;
}

/**
 * Call Anthropic Messages API with the given API key and prompt.
 */
export async function callAnthropicAPI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096,
  timeoutMs = 120000,
): Promise<SdkExecutionResult> {
  const modelId = MODEL_MAP[model] ?? model;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as any;
      const errMsg = errBody?.error?.message || `HTTP ${res.status}`;

      // Detect rate limiting
      if (res.status === 429) {
        return {
          success: false,
          output: '',
          inputTokens: 0,
          outputTokens: 0,
          costUsd: 0,
          error: `rate_limit: ${errMsg}`,
        };
      }

      return {
        success: false,
        output: '',
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        error: errMsg,
      };
    }

    const data = await res.json() as any;

    // Extract text from content blocks
    const textBlocks = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text);
    const output = textBlocks.join('\n');

    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costUsd = computeCost(model, inputTokens, outputTokens);

    return {
      success: true,
      output,
      inputTokens,
      outputTokens,
      costUsd,
    };
  } catch (err: any) {
    clearTimeout(timer);

    if (err.name === 'AbortError') {
      return {
        success: false,
        output: '',
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        error: `Timeout after ${timeoutMs}ms`,
      };
    }

    return {
      success: false,
      output: '',
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      error: err.message,
    };
  }
}
