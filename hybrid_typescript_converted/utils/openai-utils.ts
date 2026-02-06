/**
 * OpenAI Utilities for Self-Healing Locators
 * AI-powered locator verification and correction
 * Migrated from utils/openai_utils.py
 */

import { Page } from '@playwright/test';
import OpenAI from 'openai';
import { Log } from './logger';
import { AppConstants } from './app-constants';
import { CommonMethods } from './common-methods';

export class OpenAIUtils {
  private enabled: boolean;
  private apiKey: string;
  private client: OpenAI | null = null;

  constructor() {
    this.enabled = AppConstants.ENABLE_OPENAI_SELF_HEALING;
    this.apiKey = AppConstants.API_KEY;

    if (this.enabled && this.apiKey && this.apiKey !== 'Test') {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Verify and get locators using AI
   * 
   * When ENABLE_OPENAI_SELF_HEALING is true, this:
   * 1. Tries the CSV locator
   * 2. If it fails, uses OpenAI to find the correct locator
   * 3. Updates the CSV with the new locator
   * 
   * @param page Playwright page object
   * @param elementName Element name from CSV
   * @param csvFile CSV filename
   * @returns The locator string
   */
  async verifyAndGetLocatorsUsingAi(
    page: Page,
    elementName: string,
    csvFile: string
  ): Promise<string | null> {
    // Get locator from CSV
    const locator = CommonMethods.getValuesFromCsv(elementName, csvFile);

    if (!locator) {
      Log.error(`Locator not found for ${elementName} in ${csvFile}`);
      return null;
    }

    // If AI self-healing is disabled, just return the CSV locator
    if (!this.enabled) {
      return locator;
    }

    try {
      // Test if the locator works
      await page.waitForSelector(locator, { timeout: 5000 });
      Log.info(`Locator for ${elementName} is working: ${locator}`);
      return locator;
    } catch (error) {
      Log.warn(`Locator for ${elementName} failed: ${locator}. Attempting AI healing...`);

      if (!this.client) {
        Log.error('OpenAI client not initialized. Cannot perform self-healing.');
        return locator; // Return original locator
      }

      try {
        // Use AI to find a new locator
        const newLocator = await this.findLocatorWithAI(page, elementName, locator);

        if (newLocator) {
          Log.info(`AI found new locator for ${elementName}: ${newLocator}`);
          
          // Update the CSV with new locator
          CommonMethods.updateLocator(elementName, newLocator, csvFile);
          
          return newLocator;
        } else {
          Log.error(`AI could not find a working locator for ${elementName}`);
          return locator; // Return original locator
        }
      } catch (aiError) {
        Log.error(`Error during AI healing: ${aiError}`);
        return locator; // Return original locator
      }
    }
  }

  /**
   * Use OpenAI to find a new locator
   * (Placeholder implementation - implement actual AI logic)
   */
  private async findLocatorWithAI(
    page: Page,
    elementName: string,
    oldLocator: string
  ): Promise<string | null> {
    if (!this.client) return null;

    try {
      // Get page content
      const pageContent = await page.content();
      
      // Prepare prompt for OpenAI
      const prompt = `
You are a web automation expert. A locator for element "${elementName}" is broken.

Old locator: ${oldLocator}

Please analyze the page HTML below and suggest a new, robust locator for "${elementName}".
Return ONLY the locator string (CSS selector or XPath), nothing else.

Page HTML (truncated):
${pageContent.substring(0, 5000)}
      `.trim();

      // Call OpenAI API
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful web automation assistant. Return only locator strings.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const newLocator = response.choices[0]?.message?.content?.trim();

      if (newLocator) {
        // Test if the new locator works
        try {
          await page.waitForSelector(newLocator, { timeout: 3000 });
          Log.info(`AI-suggested locator verified: ${newLocator}`);
          return newLocator;
        } catch (error) {
          Log.warn(`AI-suggested locator doesn't work: ${newLocator}`);
          return null;
        }
      }

      return null;
    } catch (error) {
      Log.error(`Error calling OpenAI API: ${error}`);
      return null;
    }
  }
}
