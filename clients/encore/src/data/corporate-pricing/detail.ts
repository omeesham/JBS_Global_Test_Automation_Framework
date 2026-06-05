/**
 * Corporate Pricing — Pricing Detail (NM-1443) test data.
 * Source of truth: live walk 2026-06-05 (field-inventories/corporate-pricing-detail-2026-06-05.md).
 * Per LR-015, only LIVE-VERIFIED values are committed. Volatile/large values (row count, source-list
 * size) are asserted by CONTENT/containment or `> 0`, never exact counts (LR-022/LR-053).
 *
 * Mutation safety (LR-019): save-cycle TCs mutate the `detailFixture` and restore via
 * `ensureDefaultState()`. The dependable, REVERSIBLE save lever is **Max Discount** (editing it
 * reliably enables Save; it restores to 0/no-discount). The **New Price** override is "sticky" (it
 * becomes the Price column on save) and its edit does NOT reliably enable Save on its own
 * (CPR-DETAIL-BUG-A) — so the New-Price persist TC drives the override through the proven
 * grid-batch save and ensureDefaultState reverts the Price back to base. Recovery values differ
 * from the saved baseline (LR-009 — net-zero edits never dirty the form).
 */
import { CORPORATE_PRICING_COMMON, CORPORATE_PRICING_FIXTURES } from './common';

export const DETAIL = {
  office: CORPORATE_PRICING_COMMON.office, // '1604'
  /** detailFixture pricebook (S3 only — distinct from strategyFixture; F1). */
  pricebookGuid: CORPORATE_PRICING_FIXTURES.detailFixture.guid, // 91acb5ca-20e2-ce8e-a9ab-8c370925fd65
  pricebookName: CORPORATE_PRICING_FIXTURES.detailFixture.name, // '2021-PB6'

  /** Grid column headers (verbatim, in order — D6). */
  headers: ['ID', 'Product Group Name', 'Price', 'New Price', 'Max Discount'] as const,

  /**
   * Stable content anchors (unique Product Group Name + non-zero base Price, live 2026-06-05).
   * `anchorA` carries the Max-Discount save-cycle; `anchorB` carries the New-Price override cycle —
   * two distinct rows so the two save-cycle TCs never edit the same row.
   */
  anchorA: { id: '277', name: 'Balloon Light Decor', basePrice: '615.00' },
  anchorB: { id: '280', name: 'Analog Mixer 12 - 23 Ch', basePrice: '195.00' },

  /** Reversible Max-Discount edit (the dependable dirty lever). Restored to '0' (no discount). */
  maxDiscountEdit: {
    value: '12', // display becomes '12.00 %'
    displayContains: '12',
    restored: '0', // display '0.00 %' = no discount
  },

  /** New-Price override value (becomes the Price column on save). Restored to the row's base price. */
  newPriceEdit: {
    value: '250.00',
    restored: '195.00', // = anchorB.basePrice — reverts the override
  },

  /** Tabs: live shows 2; DOCX intent names 3 (History absent — NM-1444). */
  liveTabs: ['Pricing Strategy', 'Pricing Detail'] as const,

  /** Source-list filter placeholder (verbatim). */
  sourceFilterPlaceholder: 'Search ID or Name...',
} as const;
