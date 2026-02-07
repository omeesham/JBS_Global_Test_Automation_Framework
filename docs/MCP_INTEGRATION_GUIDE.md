# Playwright MCP Integration Guide

**Last Updated:** February 7, 2026  
**Framework Version:** 1.0  
**Prerequisites:** Node.js 18+, TypeScript 5+, Playwright 1.40+

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [MCP Server Setup](#mcp-server-setup)
4. [Framework Integration](#framework-integration)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Overview

This guide provides step-by-step instructions for integrating **Model Context Protocol (MCP)** with the Hybrid Playwright TypeScript Framework to enable AI-powered testing capabilities.

**What you'll build**:
- MCP server exposing Playwright page context to LLMs
- MCP client helper for invoking AI tools from tests
- Self-healing locator discovery using OpenAI/Anthropic
- Optional: Test generation and visual regression analysis

**Estimated time**: 4-6 hours for basic integration

---

## Installation

### Step 1: Install MCP SDK

```powershell
# Install MCP SDK and additional dependencies
npm install @modelcontextprotocol/sdk

# Install Anthropic SDK (if using Claude)
npm install @anthropic-ai/sdk

# OpenAI SDK already installed (verify)
npm list openai
```

### Step 2: Verify Environment Variables

Add to your `.env` file:

```bash
# Existing variables
OPENAI_API_KEY=sk-...
ENABLE_OPENAI_SELF_HEALING=true

# New MCP-specific variables
MCP_ENABLED=true
MCP_SERVER_PORT=3000
MCP_TRANSPORT=stdio
MCP_LOG_LEVEL=info
MCP_CONFIDENCE_THRESHOLD=0.8
MCP_TIMEOUT_MS=5000
```

### Step 3: Create Directory Structure

```powershell
# Create MCP-related directories
New-Item -ItemType Directory -Path "src\mcp\server"
New-Item -ItemType Directory -Path "src\mcp\client"
New-Item -ItemType Directory -Path "src\mcp\tools"
```

---

## MCP Server Setup

### Step 1: Create Server Entry Point

**File**: `src/mcp/server/index.ts`

```typescript
/**
 * FILE: src/mcp/server/index.ts
 * PURPOSE: MCP server exposing Playwright page context to LLMs
 * WHY NECESSARY: Enables AI to interact with browser state for locator discovery
 * USED BY: Started as separate process, connects to MCP clients
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tool implementations
import { findElementTool } from '../tools/find-element.js';
import { healLocatorTool } from '../tools/heal-locator.js';

/**
 * Initialize MCP Server
 */
const server = new Server(
  {
    name: 'playwright-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle tools/list request
 * Returns list of available AI tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'find_element',
        description: 'Find element locator using natural language description and page context',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Natural language description of the element to find',
            },
            pageHTML: {
              type: 'string',
              description: 'Current page HTML content',
            },
            pageURL: {
              type: 'string',
              description: 'Current page URL',
            },
            screenshot: {
              type: 'string',
              description: 'Base64-encoded screenshot (optional)',
            },
          },
          required: ['description', 'pageHTML', 'pageURL'],
        },
      },
      {
        name: 'heal_locator',
        description: 'Suggest replacement locator for broken element selector',
        inputSchema: {
          type: 'object',
          properties: {
            originalLocator: {
              type: 'string',
              description: 'The broken/outdated locator',
            },
            elementDescription: {
              type: 'string',
              description: 'Description of what element should do/look like',
            },
            pageHTML: {
              type: 'string',
              description: 'Current page HTML',
            },
            errorMessage: {
              type: 'string',
              description: 'Error message from failed locator',
            },
          },
          required: ['originalLocator', 'elementDescription', 'pageHTML'],
        },
      },
    ],
  };
});

/**
 * Handle tools/call request
 * Executes AI tools with provided arguments
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'find_element':
      return await findElementTool(args);
    
    case 'heal_locator':
      return await healLocatorTool(args);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Start MCP Server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Playwright MCP Server running on stdio');
  console.error('Tools available: find_element, heal_locator');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
```

### Step 2: Implement find_element Tool

**File**: `src/mcp/tools/find-element.ts`

```typescript
/**
 * FILE: src/mcp/tools/find-element.ts
 * PURPOSE: AI tool to find element locators from natural language descriptions
 * WHY NECESSARY: Automates locator discovery when elements lack IDs or data-testid
 * USED BY: MCP server, invoked when tests need element location assistance
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function findElementTool(args: any) {
  const { description, pageHTML, pageURL, screenshot } = args;

  // Build prompt for LLM
  const prompt = `You are an expert in web automation and element location.

**Task**: Find the best Playwright locator for the following element.

**Element Description**: ${description}

**Page URL**: ${pageURL}

**Page HTML** (truncated to relevant section):
\`\`\`html
${truncateHTML(pageHTML, 4000)}
\`\`\`

**Instructions**:
1. Analyze the HTML to find the element matching the description
2. Suggest the most robust Playwright locator (prefer data-testid, role, text, then CSS)
3. Provide confidence score (0.0 to 1.0)
4. Explain your reasoning

**Response Format** (JSON):
{
  "selector": "locator string here",
  "selectorType": "testid | role | text | css | xpath",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Playwright test automation expert. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            selector: null,
            confidence: 0,
          }),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Truncate HTML to fit in LLM context window
 */
function truncateHTML(html: string, maxLength: number): string {
  if (html.length <= maxLength) return html;
  
  // Try to truncate at tag boundary
  const truncated = html.substring(0, maxLength);
  const lastTagClose = truncated.lastIndexOf('>');
  
  return lastTagClose > 0 ? truncated.substring(0, lastTagClose + 1) : truncated;
}
```

### Step 3: Implement heal_locator Tool

**File**: `src/mcp/tools/heal-locator.ts`

```typescript
/**
 * FILE: src/mcp/tools/heal-locator.ts
 * PURPOSE: AI tool to suggest replacement locators for broken selectors
 * WHY NECESSARY: Automates test maintenance when UI changes break locators
 * USED BY: MCP server, invoked when element not found errors occur
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function healLocatorTool(args: any) {
  const { originalLocator, elementDescription, pageHTML, errorMessage } = args;

  const prompt = `You are a Playwright test maintenance expert.

**Problem**: A test locator stopped working after UI changes.

**Original Locator**: \`${originalLocator}\`
**Error**: ${errorMessage || 'Element not found'}
**Element Purpose**: ${elementDescription}

**Current Page HTML** (relevant section):
\`\`\`html
${truncateHTML(pageHTML, 4000)}
\`\`\`

**Task**:
1. Analyze why the original locator failed
2. Find the element that matches the description in the current HTML
3. Suggest a new, more robust locator
4. Explain what changed and why the new locator is better

**Response Format** (JSON):
{
  "newSelector": "suggested locator",
  "selectorType": "testid | role | text | css | xpath",
  "confidence": 0.90,
  "changeReason": "brief explanation of what changed",
  "improvement": "why new locator is more robust"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Playwright expert specializing in test maintenance. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            newSelector: originalLocator,
            confidence: 0,
          }),
        },
      ],
      isError: true,
    };
  }
}

function truncateHTML(html: string, maxLength: number): string {
  if (html.length <= maxLength) return html;
  const truncated = html.substring(0, maxLength);
  const lastTagClose = truncated.lastIndexOf('>');
  return lastTagClose > 0 ? truncated.substring(0, lastTagClose + 1) : truncated;
}
```

### Step 4: Build MCP Server

```powershell
# Add build script to package.json
# "scripts": {
#   "build:mcp": "tsc src/mcp/**/*.ts --outDir dist/mcp",
#   "start:mcp": "node dist/mcp/server/index.js"
# }

# Build the server
npm run build:mcp
```

---

## Framework Integration

### Step 1: Create MCP Client Helper

**File**: `src/common/mcp-client.ts`

```typescript
/**
 * FILE: src/common/mcp-client.ts
 * PURPOSE: MCP client for invoking AI tools from Playwright tests
 * WHY NECESSARY: Provides simple API for tests to use AI capabilities
 * USED BY: UiCommon, page objects, test files
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import { Log } from '../utils/logger';
import { Page } from '@playwright/test';

export interface ElementLocatorResult {
  selector: string;
  selectorType: string;
  confidence: number;
  reasoning?: string;
}

export interface HealedLocatorResult {
  newSelector: string;
  selectorType: string;
  confidence: number;
  changeReason?: string;
  improvement?: string;
}

export class MCPClient {
  private static client: Client | null = null;
  private static serverProcess: ChildProcess | null = null;
  private static enabled: boolean = process.env.MCP_ENABLED === 'true';
  
  /**
   * Initialize MCP client and start server
   */
  static async initialize(): Promise<void> {
    if (!this.enabled) {
      Log.info('MCP disabled (MCP_ENABLED=false)');
      return;
    }
    
    if (this.client) return;
    
    try {
      // Start MCP server process
      this.serverProcess = spawn('node', ['dist/mcp/server/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      // Create MCP client
      this.client = new Client(
        {
          name: 'playwright-test-framework',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );
      
      // Connect to server via stdio
      const transport = new StdioClientTransport({
        reader: this.serverProcess.stdout!,
        writer: this.serverProcess.stdin!,
      });
      
      await this.client.connect(transport);
      Log.info('✅ MCP client connected');
    } catch (error: any) {
      Log.error(`❌ MCP initialization failed: ${error.message}`);
      this.enabled = false;
    }
  }
  
  /**
   * Find element using AI
   */
  static async findElement(
    page: Page,
    description: string
  ): Promise<ElementLocatorResult | null> {
    if (!this.enabled || !this.client) {
      Log.warn('MCP not available, skipping AI findElement');
      return null;
    }
    
    try {
      const pageHTML = await page.content();
      const pageURL = page.url();
      
      const result = await this.client.callTool({
        name: 'find_element',
        arguments: {
          description,
          pageHTML,
          pageURL,
        },
      });
      
      const parsed = JSON.parse(result.content[0].text);
      return parsed;
    } catch (error: any) {
      Log.error(`AI findElement failed: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Heal broken locator using AI
   */
  static async healLocator(
    page: Page,
    originalLocator: string,
    elementDescription: string,
    errorMessage?: string
  ): Promise<HealedLocatorResult | null> {
    if (!this.enabled || !this.client) {
      return null;
    }
    
    try {
      const pageHTML = await page.content();
      
      const result = await this.client.callTool({
        name: 'heal_locator',
        arguments: {
          originalLocator,
          elementDescription,
          pageHTML,
          errorMessage,
        },
      });
      
      const parsed = JSON.parse(result.content[0].text);
      
      if (parsed.confidence >= parseFloat(process.env.MCP_CONFIDENCE_THRESHOLD || '0.8')) {
        Log.info(`✅ AI healed locator: ${originalLocator} → ${parsed.newSelector} (confidence: ${parsed.confidence})`);
        return parsed;
      } else {
        Log.warn(`⚠️ AI suggestion confidence too low: ${parsed.confidence}`);
        return null;
      }
    } catch (error: any) {
      Log.error(`AI healLocator failed: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Cleanup MCP client
   */
  static async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    
    Log.info('MCP client shutdown');
  }
}
```

### Step 2: Integrate with BasePage

**Update**: `src/common/base-page.ts` (add self-healing)

```typescript
// Add import
import { MCPClient } from './mcp-client';

// Modify clickWithRetry to use self-healing
async clickWithRetry(
  elementName: string,
  csvFile: string,
  options?: { timeout?: number; maxRetries?: number; description?: string }
): Promise<boolean> {
  const maxRetries = options?.maxRetries || 3;
  const timeout = options?.timeout || 10000;
  const locator = this.getLocator(elementName, csvFile);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.page.locator(locator).click({ timeout });
      return true;
    } catch (error: any) {
      Log.warn(`Click attempt ${attempt} failed for ${elementName}: ${error.message}`);
      
      // Try AI healing on last attempt
      if (attempt === maxRetries && options?.description) {
        const healed = await MCPClient.healLocator(
          this.page,
          locator,
          options.description,
          error.message
        );
        
        if (healed) {
          try {
            await this.page.locator(healed.newSelector).click({ timeout });
            Log.info(`✅ Self-healed click succeeded with: ${healed.newSelector}`);
            return true;
          } catch (healError: any) {
            Log.error(`Self-heal attempt failed: ${healError.message}`);
          }
        }
      }
      
      if (attempt < maxRetries) {
        await this.page.waitForTimeout(1000 * attempt);
      }
    }
  }
  
  return false;
}
```

### Step 3: Add Test Hooks

**Update**: `tests/fixtures.ts`

```typescript
// Add MCP initialization/cleanup
import { test as base } from '@playwright/test';
import { MCPClient } from '../src/common/mcp-client';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Initialize MCP before tests
    await MCPClient.initialize();
    
    await use(page);
    
    // Cleanup after tests (optional, on exit)
    // await MCPClient.shutdown();
  },
});
```

---

## Usage Examples

### Example 1: AI-Assisted Element Finding

```typescript
import { test, expect } from './fixtures';
import { MCPClient } from '../src/common/mcp-client';

test('should find element using AI', async ({ page }) => {
  await page.goto('https://example.com/search');
  
  // Let AI find the search button
  const result = await MCPClient.findElement(
    page,
    "the blue search button next to the input field"
  );
  
  if (result && result.confidence > 0.8) {
    await page.locator(result.selector).click();
    Log.info(`✅ AI found element: ${result.selector}`);
  } else {
    // Fallback to manual locator
    await page.locator('[data-testid="search-button"]').click();
  }
});
```

### Example 2: Self-Healing Click

```typescript
// In page object method
async clickProfileIcon(): Promise<boolean> {
  return await this.clickWithRetry(
    'ico_Profile',
    AppConstants.LANDING_ELEMENTS,
    {
      maxRetries: 3,
      description: "user profile icon in top right corner"  // Enables AI healing
    }
  );
}
```

### Example 3: Conditional MCP Usage

```typescript
const MCP_ENABLED = process.env.MCP_ENABLED === 'true';

async function clickElement(page: Page, selector: string, description: string) {
  try {
    await page.locator(selector).click();
  } catch (error) {
    if (MCP_ENABLED) {
      const healed = await MCPClient.healLocator(page, selector, description);
      if (healed) {
        await page.locator(healed.newSelector).click();
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_ENABLED` | `false` | Enable/disable MCP features |
| `MCP_SERVER_PORT` | `3000` | Port for MCP server (if using HTTP) |
| `MCP_TRANSPORT` | `stdio` | Transport type: `stdio`, `sse`, `http` |
| `MCP_LOG_LEVEL` | `info` | Logging level: `debug`, `info`, `warn`, `error` |
| `MCP_CONFIDENCE_THRESHOLD` | `0.8` | Minimum AI confidence to accept suggestion |
| `MCP_TIMEOUT_MS` | `5000` | Max time to wait for AI response |
| `OPENAI_API_KEY` | *(required)* | OpenAI API key for GPT models |

### Feature Flags

```bash
# Enable only specific MCP features
MCP_ENABLED=true
MCP_ENABLE_HEALING=true
MCP_ENABLE_GENERATION=false  # Test generation (future)
MCP_ENABLE_VISUAL_REGRESSION=false  # Visual AI (future)
```

---

## Troubleshooting

### Issue: MCP server won't start

**Symptoms**: "MCP initialization failed" error

**Solutions**:
1. Check server was built: `npm run build:mcp`
2. Verify OPENAI_API_KEY is set
3. Check Node.js version: `node --version` (must be 18+)
4. Run server manually: `node dist/mcp/server/index.js` (check for errors)

### Issue: AI returns low confidence results

**Symptoms**: Confidence scores consistently <0.8

**Solutions**:
1. Provide more detailed element descriptions
2. Ensure page HTML is complete (wait for load)
3. Try including screenshot: `screenshot: await page.screenshot({ encoding: 'base64' })`
4. Lower confidence threshold temporarily to test

### Issue: High API costs

**Symptoms**: OpenAI bill higher than expected

**Solutions**:
1. Set `MCP_ENABLED=false` in non-critical environments (staging)
2. Cache AI responses (implement caching layer)
3. Use cheaper model for simple tasks (gpt-3.5-turbo instead of gpt-4)
4. Only invoke AI on failures (not every element)

### Issue: Slow test execution

**Symptoms**: Tests taking 2-3x longer with MCP enabled

**Solutions**:
1. Reduce `MCP_TIMEOUT_MS` to 3000 (3 seconds)
2. Only use MCP as fallback (try normal locator first)
3. Run MCP calls in parallel where possible
4. Disable MCP for smoke tests (only use in full regression)

---

## Best Practices

### 1. Use MCP as Fallback, Not Primary

**❌ Don't**:
```typescript
const locator = await MCPClient.findElement(page, "submit button");
await page.locator(locator.selector).click();
```

**✅ Do**:
```typescript
try {
  await page.locator('[data-testid="submit"]').click();
} catch (error) {
  const healed = await MCPClient.healLocator(page, '[data-testid="submit"]', "submit button");
  if (healed) await page.locator(healed.newSelector).click();
  else throw error;
}
```

### 2. Cache AI Responses

```typescript
const aiCache = new Map<string, ElementLocatorResult>();

async function findWithCache(page: Page, description: string) {
  const cacheKey = `${page.url()}-${description}`;
  
  if (aiCache.has(cacheKey)) {
    return aiCache.get(cacheKey);
  }
  
  const result = await MCPClient.findElement(page, description);
  if (result) aiCache.set(cacheKey, result);
  
  return result;
}
```

### 3. Monitor and Alert on Costs

```typescript
// Track API usage
let aiCallCount = 0;
const MAX_AI_CALLS_PER_RUN = 100;

async function findElement(page: Page, description: string) {
  if (aiCallCount >= MAX_AI_CALLS_PER_RUN) {
    Log.warn('⚠️ AI call limit reached for this test run');
    return null;
  }
  
  aiCallCount++;
  return await MCPClient.findElement(page, description);
}
```

### 4. Log AI Suggestions for Review

```typescript
// Always log AI suggestions before using
const healed = await MCPClient.healLocator(page, oldLocator, description);

if (healed) {
  Log.info(`🤖 AI Suggestion: ${healed.newSelector} (confidence: ${healed.confidence})`);
  Log.info(`   Reason: ${healed.changeReason}`);
  
  // Log to file for later review
  fs.appendFileSync('ai-suggestions.log', JSON.stringify({
    timestamp: new Date().toISOString(),
    oldLocator,
    newLocator: healed.newSelector,
    confidence: healed.confidence
  }) + '\n');
}
```

### 5. Feature Flag by Environment

```typescript
// Only enable in dev/staging, not production tests
const MCP_ENABLED = process.env.NODE_ENV !== 'production' && process.env.MCP_ENABLED === 'true';
```

---

## Next Steps

1. **Complete POC**: Test with 2-3 page objects
2. **Measure ROI**: Track time saved vs API costs
3. **Expand Usage**: Add to more page objects if successful
4. **Add Visual AI**: Implement visual regression analysis tool
5. **Add Test Generation**: Implement AI test generation tool

---

**Related Documentation**:
- [PLAYWRIGHT_MCP_RESEARCH.md](./PLAYWRIGHT_MCP_RESEARCH.md) - MCP research and analysis
- [Anthropic MCP Docs](https://modelcontextprotocol.io)
- [OpenAI API Docs](https://platform.openai.com/docs)

