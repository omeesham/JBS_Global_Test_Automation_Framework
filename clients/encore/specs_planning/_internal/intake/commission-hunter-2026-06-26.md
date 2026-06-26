# Commission Module — Pre-Intake KT Reference

**SOURCE**: Client KT session transcript (docx), received 2026-06-26.
**STATUS**: pre-intake reference for a *possible future* Commission automation task.

> **NOT a field-inventory. NOT a baseline artifact. NOT live-verified.**
> No `MCP_Session_Date`. Do NOT consume as Phase-0.5 walkthrough evidence.
> When Commission intake is committed: run HUNTER Jira-first intake (LR-ENC-004) +
> old-site baseline walk (LR-ENC-001); this file seeds, does not replace, those steps.

**RESTRICTION**: corporate office **1101** ("Corporate Office") only · **Navigator Contracts role** required · venue commissions only (sales commissions → Compass CRM, out of scope).

---

## Scope

- Venue commissions only. Sales commissions are handled in Compass CRM.
- Commission maintenance requires Navigator Contracts role and is restricted to corporate (1101).

---

## Commission Priority (Highest → Lowest)

1. **CMP Commission** — Applies only to CMP packages. If CMP commission = 0, package receives no commission.
2. **Order-Level Adjustment** — Overrides Product Code, DPCD, and Tier Flat. Used per order/service type.
3. **Product Code Commission** — Overrides DPCD and Tier Flat. Configurable at Category/Subcategory/Class/Subclass/Item.
4. **DPCD (Discount Percent Commission Deduction)** — Enabled only for locations with DPCD flag. Reduces Tier Flat commission based on discount percentage bands.
5. **Tier Flat** — Default/base commission by Location + Service Type.

---

## Tier Flat

- Base commission table.
- Supports multiple boundaries/thresholds.
- Profit-only option commissions only profit margin.
- ETS/Service Charge behavior depends on location configuration.

---

## DPCD

- Defined by discount ranges. Example: Discount 16.01–17.00% → reduce Tier Flat by configured deduction.
- 100% discount results in no commission.
- Applies before Tier Flat.

---

## Product Code Commission

- Overrides default commission logic.
- Higher hierarchy nodes affect descendants.
- "Use Default Commission" reverts inheritance.
- **Known UI issue**: checkbox state may not refresh correctly.

---

## Order-Level Adjustment

- Manual reduction at order level.
- Overrides DPCD and Tier Flat.
- Can apply to one or all service types.

---

## CMP

- Rare feature. Exclusive to CMP packages.

---

## Validation

- Use "Commission by Order" to identify applied commission type.
- Daily billing locations use "Commission by DRO".
- Mexico locations are daily billing.
- **Never change Billing Way from Event to Daily during testing.**

---

## Maintenance Operations

- Manual edit.
- Import/Export.
- Copy Within Location.
- Copy To Location.
- History logs: Modify, Remove, Copy.

---

## Testing Focus (from KT)

- Verify commission hierarchy (CMP → Order-Level → Product Code → DPCD → Tier Flat).
- Verify boundary calculations.
- Verify DPCD discount thresholds.
- Verify product hierarchy inheritance.
- Verify order-level overrides.
- Verify import/export/copy/history.
- Verify service charge/ETS logic.
