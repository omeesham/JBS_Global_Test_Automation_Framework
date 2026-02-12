/**
 * FILE: src/utils/stealth-helpers.ts
 * PURPOSE: Bot detection bypass utilities for demo/public websites
 * WHY NECESSARY: Many demo sites (EspoCRM, etc.) use bot detection that blocks Playwright.
 *   This provides stealth techniques to appear as a real browser.
 * USED BY: tests/specs/espocrm/demo-espocrm.spec.ts (and any test against bot-protected sites)
 *
 * HOW IT WORKS:
 * 1. applyStealth() - Hides automation signals via context init scripts + headers
 * 2. humanClick() - Adds mouse movement and random delays before clicks
 * 3. humanDelay() - Random 3-8 second wait to mimic human reading/thinking
 * 4. randomViewport() - Varies window size to avoid fingerprint detection
 *
 * TECHNIQUES USED:
 * - Hide navigator.webdriver flag
 * - Mock navigator.plugins (empty = bot signal)
 * - Set realistic Chrome user-agent with sec-ch-ua headers
 * - Randomize viewport dimensions
 * - Add mouse movements before clicks (steps=10 for natural curve)
 * - Random hover delays (200-500ms)
 */

import { BrowserContext, Page } from '@playwright/test';
import { Log } from './logger';

export class StealthHelpers {
  /**
   * Get stealth-enabled browser context options
   * Use this when creating a new context: browser.newContext(StealthHelpers.getStealthContextOptions())
   * 
   * @returns Context options with stealth user-agent and headers
   */
  static getStealthContextOptions(): any {
    return {
      viewport: null,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
    };
  }

  /**
   * Add stealth init script to context (MUST be called BEFORE creating pages)
   * Hides navigator.webdriver and other bot detection signals
   * 
   * @param context - Browser context to inject stealth scripts
   */
  static async addStealthScript(context: BrowserContext): Promise<void> {
    await context.addInitScript(() => {
      // Hide webdriver flag (most common bot detection)
      Object.defineProperty(navigator, 'webdriver', { get: () => false });

      // Mock plugins (empty array = bot signal)
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

      // Mock languages
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

      // Mock permissions query (some sites check this)
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters);

      // Mock chrome runtime (Playwright doesn't have chrome object)
      (window as any).chrome = { runtime: {} };
    });
  }

  /**
   * Apply comprehensive stealth measures to bypass bot detection
   * Call this in test.beforeEach() BEFORE page.goto()
   * 
   * @param context - Browser context to inject stealth scripts
   * @param page - Page to set headers and viewport
   */
  static async applyStealth(context: BrowserContext, page: Page): Promise<void> {
    Log.info('🥷 Applying stealth measures to bypass bot detection');

    // 1. Inject context init script (runs before page loads)
    await context.addInitScript(() => {
      // Hide webdriver flag (most common bot detection)
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Mock plugins (empty array = bot signal)
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5], // Fake 5 plugins (realistic)
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Mock permissions query (some sites check this)
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as PermissionStatus)
          : originalQuery(parameters);

      // Mock chrome runtime (Playwright doesn't have chrome object)
      (window as any).chrome = {
        runtime: {},
      };
    });

    // 2. Set realistic HTTP headers (Chrome 131 on Windows)
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    });

    // 3. Randomize viewport (avoid fixed dimensions fingerprint)
    await this.randomViewport(page);

    Log.info('✅ Stealth mode activated');
  }

  /**
   * Set random viewport dimensions to avoid fingerprinting
   * Common resolutions: 1920x1080 (desktop), 1366x768 (laptop), 1536x864 (laptop HD)
   * 
   * @param page - Page to set viewport
   */
  static async randomViewport(page: Page): Promise<void> {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop FHD
      { width: 1366, height: 768 },  // Laptop standard
      { width: 1536, height: 864 },  // Laptop HD
      { width: 1440, height: 900 },  // MacBook Pro
    ];

    const viewport = viewports[Math.floor(Math.random() * viewports.length)]!;
    await page.setViewportSize(viewport);
    Log.info(`Viewport randomized: ${viewport.width}x${viewport.height}`);
  }

  /**
   * Click element with human-like mouse movement and delay
   * Better than direct click() for avoiding bot detection
   * 
   * @param page - Page instance
   * @param selector - Element selector (supports multiple comma-separated selectors)
   */
  static async humanClick(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 30000 });

    // Get element position
    const box = await element.boundingBox();
    if (box) {
      // Move mouse to element center with 10 steps (creates smooth curve)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });

      // Random hover delay (200-500ms) - humans don't click instantly
      const hoverDelay = 200 + Math.random() * 300;
      await page.waitForTimeout(hoverDelay);
    }

    // Click
    await element.click();
  }

  /**
   * Random human-like delay (3-8 seconds)
   * Use after page loads or before interactions to mimic reading/thinking
   */
  static async humanDelay(): Promise<void> {
    const delay = 3000 + Math.floor(Math.random() * 5000); // 3-8 seconds
    Log.info(`Human delay: ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Type text with random delays between keystrokes (human-like typing)
   * Use instead of fill() for more realistic input
   * 
   * @param page - Page instance
   * @param selector - Input field selector
   * @param text - Text to type
   */
  static async humanType(page: Page, selector: string, text: string): Promise<void> {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 10000 });

    // Clear existing value
    await element.clear();

    // Type character by character with random delays (50-150ms)
    for (const char of text) {
      await element.type(char);
      const delay = 50 + Math.random() * 100;
      await page.waitForTimeout(delay);
    }
  }

  /**
   * Scroll element into view with smooth animation (human-like)
   * 
   * @param page - Page instance
   * @param selector - Element selector
   */
  static async smoothScroll(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector).first();
    await element.scrollIntoViewIfNeeded({ timeout: 5000 });
    await page.waitForTimeout(300); // Wait for scroll animation
  }

  /**
   * Check if page is showing a CAPTCHA challenge
   * Use this to detect bot detection / Google Captcha screens
   * 
   * @param page - Page instance
   * @returns true if CAPTCHA indicators found, false otherwise
   */
  static async checkForCaptcha(page: Page): Promise<boolean> {
    const captchaIndicators = [
      'text=unusual traffic',
      'text=not a robot',
      'iframe[src*="recaptcha"]',
      'iframe[src*="captcha"]',
    ];
    
    for (const indicator of captchaIndicators) {
      const count = await page.locator(indicator).count();
      if (count > 0) {
        Log.info(`🚨 CAPTCHA detected: ${indicator}`);
        return true;
      }
    }
    
    return false;
  }
}
