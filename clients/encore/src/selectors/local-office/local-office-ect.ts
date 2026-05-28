/**
 * Local Office Settings — ECT Settings tab selectors.
 * URL: /navigator/locations/{officeId}/settings/local-office (ECT Settings tab)
 * Shared tab/dialog infrastructure (tabEctSettings, tabContentEct, dlgUnsavedLocalOffice)
 * lives in LocalOfficeSettingsSelectors; EctPage cascades through both namespaces.
 */
export const LocalOfficeEctSelectors = {
 // ---- ECT Settings Tab ----
 /** @where Local Office Settings > ECT @el div @text ECT section header @keys ect header section */
  secEctHeader: '[data-testid="ect-settings-section-header"]',
 /** @where Local Office Settings > ECT @el div @text ECT header wrapper @keys ect header */
  secEctHeaderInner: '[data-testid="ect-settings-header"]',
 /** @where Local Office Settings > ECT @el h6 @text "1604 - Parker Palm Springs" @keys ect location-name label */
  lblEctLocationName: '[data-testid="ect-settings-label-location-name"]',
 /** @where Local Office Settings > ECT @el a @text "Commission structure" @keys ect commission link external */
  lnkCommissionStructure: '[data-testid="ect-settings-link-commission-structure"]',
 /** @where Local Office Settings > ECT @el button[role=combobox] @text "USD" @keys ect currency select combobox */
  drpCurrency: '[data-testid="ect-settings-select-currency"]',

 // ---- ECT: Event Profit Target ----
 /** @where Local Office Settings > ECT > Profit Target @el div @text event profit target section @keys ect profit-target section */
  secEventProfitTarget: '[data-testid="ect-settings-section-event-profit-target"]',
 /** @where Local Office Settings > ECT > Profit Target @el h4 @text "Event Profit Target" @keys ect profit-target title */
  lblEventProfitTarget: '[data-testid="ect-settings-section-title-event-profit-target"]',
 /** @where Local Office Settings > ECT > Profit Target @el div @text profit target table wrapper @keys ect profit-target table read-only */
  tblEventProfitTarget: '[data-testid="ect-settings-table-event-profit-target"]',

 // ---- ECT: Fixed Costs ----
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text Save button wrapper for fixed costs @keys ect save fixed-costs */
  secSaveFixedCosts: '[data-testid="ect-settings-btn-save-fixed-costs"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el button @text "Save" @keys ect save fixed-costs button disabled-by-default */
  btnSaveFixedCosts: '[data-testid="ect-settings-btn-save-fixed-costs-btn"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text fixed costs section wrapper @keys ect fixed-costs section */
  secFixedCosts: '[data-testid="ect-settings-section-fixed-costs"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Venue Fixed Costs" field @keys ect venue-fixed-costs read-only */
  fldVenueFixedCosts: '[data-testid="ect-settings-field-venue-fixed-costs"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "SG&A %" field @keys ect sga-percent read-only */
  fldSgaPercent: '[data-testid="ect-settings-field-sga-percent"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Benefits Multiplier" field wrapper @keys ect benefits-multiplier */
  fldBenefitsMultiplier: '[data-testid="ect-settings-field-benefits-multiplier"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el input @text Benefits Multiplier editable @keys ect benefits-multiplier input decimal-to-percent */
  txtBenefitsMultiplier: '[data-testid="ect-settings-input-benefits-multiplier"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Other Rate" field @keys ect other-rate read-only */
  fldOtherRate: '[data-testid="ect-settings-field-other-rate"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "No Labor Rate" field @keys ect no-labour-rate read-only */
  fldNoLabourRate: '[data-testid="ect-settings-field-no-labour-rate"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Approval Threshold" field @keys ect approval-threshold read-only */
  fldApprovalThreshold: '[data-testid="ect-settings-field-approval-threshold"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Historical Subrental %" field wrapper @keys ect historical-subrental */
  fldHistoricalSubrental: '[data-testid="ect-settings-field-historical-subrental"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el input @text Historical Subrental % editable @keys ect historical-subrental input decimal-to-percent */
  txtHistoricalSubrental: '[data-testid="ect-settings-input-historical-subrental"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Peak Labor Adjustment %" field @keys ect peak-labor read-only */
  fldPeakLaborAdjustment: '[data-testid="ect-settings-field-peak-labor-adjustment"]',
 /** @where Local Office Settings > ECT > Fixed Costs @el div @text "Non-Peak Labor Adjustment %" field @keys ect non-peak-labor read-only */
  fldNonPeakLaborAdjustment: '[data-testid="ect-settings-field-non-peak-labor-adjustment"]',

 // ---- ECT: Labor Cost Assumptions ----
 /** @where Local Office Settings > ECT > Labor Costs @el div @text Save button wrapper for labor costs @keys ect save labor-costs */
  secSaveLaborCosts: '[data-testid="ect-settings-btn-save-labor-costs"]',
 /** @where Local Office Settings > ECT > Labor Costs @el button @text "Save" @keys ect save labor-costs button disabled-by-default */
  btnSaveLaborCosts: '[data-testid="ect-settings-btn-save-labor-costs-btn"]',
 /** @where Local Office Settings > ECT > Labor Costs @el div @text labor cost assumptions section @keys ect labor-cost section */
  secLaborCostAssumptions: '[data-testid="ect-settings-section-labor-cost-assumptions"]',
 /** @where Local Office Settings > ECT > Labor Costs @el h4 @text "Labor Cost Assumptions" @keys ect labor-cost title */
  lblLaborCostAssumptions: '[data-testid="ect-settings-section-title-labor-cost-assumptions"]',
 /** @where Local Office Settings > ECT > Labor Costs @el div @text labor cost table wrapper @keys ect labor-cost table editable */
  tblLaborCostAssumptions: '[data-testid="ect-settings-table-labor-cost-assumptions"]',

 // ---- ECT: SubRental Matrix ----
 /** @where Local Office Settings > ECT > SubRental @el div @text subrental matrix section @keys ect subrental-matrix section */
  secSubRentalMatrix: '[data-testid="ect-settings-section-sub-rental-matrix"]',
 /** @where Local Office Settings > ECT > SubRental @el h4 @text "SubRental Matrix" @keys ect subrental-matrix title */
  lblSubRentalMatrix: '[data-testid="ect-settings-section-title-sub-rental-matrix"]',
 /** @where Local Office Settings > ECT > SubRental @el div @text subrental matrix table wrapper @keys ect subrental-matrix table read-only */
  tblSubRentalMatrix: '[data-testid="ect-settings-table-sub-rental-matrix"]',
} as const;
