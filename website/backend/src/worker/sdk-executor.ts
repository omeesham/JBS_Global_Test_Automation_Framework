/**
 * Anthropic API SDK executor -- used when agentRunner='sdk' or for API overflow.
 * Mirrors the cost model from website/backend/src/utils/anthropic-client.ts.
 */

const MODEL_MAP: Record<string, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6-20250514',
  opus: 'claude-opus-4-6-20250514',
};

const COST_INPUT: Record<string, number> = { haiku: 0.25, sonnet: 3, opus: 15 };
const COST_OUTPUT: Record<string, number> = { haiku: 1.25, sonnet: 15, opus: 75 };

export interface SdkResult {
  success: boolean;
  output: string;
  error?: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export async function callAnthropicAPI(
  apiKey: string,
  model: string,
  systemMessage: string,
  userMessage: string,
  maxTokens: number,
  timeoutMs: number,
): Promise<SdkResult> {
  const resolvedModel = MODEL_MAP[model] || model;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: resolvedModel,
        max_tokens: maxTokens,
        system: systemMessage,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      return {
        success: false,
        output: '',
        error: `API ${resp.status}: ${errBody}`,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
      };
    }

    const data = await resp.json() as {
      content: Array<{ type: string; text?: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    const text = data.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text || '')
      .join('\n');

    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const costIn = (inputTokens / 1_000_000) * (COST_INPUT[model] || 3);
    const costOut = (outputTokens / 1_000_000) * (COST_OUTPUT[model] || 15);

    return {
      success: true,
      output: text,
      inputTokens,
      outputTokens,
      costUsd: Math.round((costIn + costOut) * 10000) / 10000,
    };
  } catch (err) {
    clearTimeout(timer);
    const isAbort = (err as Error).name === 'AbortError';
    return {
      success: false,
      output: '',
      error: isAbort ? `Timed out after ${timeoutMs / 1000}s` : (err as Error).message,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
    };
  }
}
