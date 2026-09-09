// Deterministic drag probe for the Add Product Group sub-class picker (LR-061 B+C):
// positive control = double-click adds; then a full mouse sequence drag; then Playwright dragTo.
import { chromium } from 'playwright';
const URL = 'https://cloudapps-e2e.encoreglobal.com/navigator/locations/1101/products/product-groups/add';
const out = {};
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ storageState: 'clients/encore/.auth/encore-state.json', viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Sub Classes', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-slot=skeleton]').length === 0, null, { timeout: 60000 });
  out.href = page.url();
  const rows = page.locator('[draggable="true"]');
  await rows.first().waitFor({ timeout: 30000 });
  out.leftCount = await rows.count();
  const rightItems = () => page.locator('button.text-xs.cursor-pointer').count();
  const zone = page.getByText(/Drag or double.click items from the left/);
  out.zoneVisible = await zone.isVisible();
  // C) positive control — double-click adds
  await rows.nth(1).dblclick();
  await page.waitForTimeout(1500);
  out.afterDblclick = await rightItems();
  if (out.afterDblclick > 0) { await page.locator('button.text-xs.cursor-pointer').first().click(); await page.waitForTimeout(800); }
  out.afterRemove = await rightItems();
  // B1) full mouse sequence drag from row 0 to the drop zone
  const src = await rows.nth(0).boundingBox();
  const dst = await zone.boundingBox();
  out.boxes = { src, dst };
  if (src && dst) {
    const sx = src.x + src.width / 2, sy = src.y + src.height / 2;
    const dx = dst.x + dst.width / 2, dy = dst.y + dst.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 15, sy + 10, { steps: 6 });
    await page.mouse.move(dx, dy, { steps: 30 });
    await page.waitForTimeout(400);
    await page.mouse.up();
    await page.waitForTimeout(1500);
  }
  out.afterMouseDrag = await rightItems();
  // B2) Playwright dragTo (its HTML5-DnD path) if the mouse sequence did nothing
  if (out.afterMouseDrag === 0) {
    try { await rows.nth(0).dragTo(zone, { timeout: 15000 }); } catch (e) { out.dragToError = String(e).slice(0, 160); }
    await page.waitForTimeout(1500);
    out.afterDragTo = await rightItems();
  }
  // B3) drag onto the right-panel container itself (the zone text may not be the droppable)
  if ((out.afterDragTo ?? out.afterMouseDrag) === 0) {
    const panel = zone.locator('xpath=ancestor::div[3]');
    try { await rows.nth(0).dragTo(panel, { timeout: 15000 }); } catch (e) { out.dragToPanelError = String(e).slice(0, 160); }
    await page.waitForTimeout(1500);
    out.afterDragToPanel = await rightItems();
  }
  out.rightText = (await page.locator('text=Sub Classes').first().locator('xpath=ancestor::div[2]').innerText()).replace(/\s+/g, ' ').slice(0, 200);
  await page.screenshot({ path: '.playwright-cli/apg-2026-09-09/11-drag-probe.png' });
} catch (e) {
  out.error = String(e).slice(0, 300);
} finally {
  await browser.close();
}
console.log(JSON.stringify(out, null, 2));
