> ⚠ **ID-RENAME 2026-06-11** (PLAN_ID_NAMING_AUDIT_AND_REMEDIATION): TC-LOC-CPR-* → TC-CPR-{SRC,STR,DET,NPB,OVR,TIO}-* (001-based per screen); TC-LOC-LI-NE-011..047 → TC-LOC-LI-078..114; TC-LOC-LI-SKIP-BILLING → TC-LOC-LI-070; BUG-CPR-001 → BUG-CPR-OVR-001; BUG-LOC-SHR-001 → BUG-LOC-SSL-001. IDs in this dated artifact are PRE-rename; map: _internal/id-audit-2026-06-10/id-rename-map.csv

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\locations\location-shared-setup-locations.spec.ts >> Location Shared Setup Locations @locations @shared-setup >> TC-LOC-SSL-024: Already-added location is absent from Change Local Office dialog
- Location: specs\locations\location-shared-setup-locations.spec.ts:837:7

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "1565"
```

# Page snapshot

```yaml
- generic:
  - alert
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - list:
                - listitem:
                  - button:
                    - generic:
                      - generic: "1604"
                    - generic:
                      - generic: Parker Palm Springs
                      - img
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - list:
                        - listitem:
                          - link:
                            - /url: /navigator/locations/1604/home
                            - img
                            - generic: Home
                        - listitem:
                          - link:
                            - /url: /navigator/locations/1604/inbox
                            - img
                            - generic: Inbox
                        - listitem:
                          - button:
                            - img
                            - generic: Actions
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Commissions
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Tax
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Setup
                            - img
                        - listitem:
                          - button:
                            - img
                            - generic: Studio
                            - img
                    - generic:
                      - generic: Search
                      - generic:
                        - list:
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: Order Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/fulfillments
                              - img
                              - generic: Job Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/assets
                              - img
                              - generic: Asset Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/customers
                              - img
                              - generic: Customer Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: DRO Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: Payment Search
                          - listitem:
                            - link:
                              - /url: /navigator/locations/1604/products
                              - img
                              - generic: Item Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: ECT Search
                          - listitem:
                            - button [disabled]:
                              - img
                              - generic: Event Agendas
                    - generic:
                      - list:
                        - listitem:
                          - button:
                            - img
                            - generic: Navigator Assistant
            - generic:
              - generic:
                - list:
                  - listitem:
                    - button:
                      - generic:
                        - generic: PC
                      - generic:
                        - generic: prd click auto
                      - img
            - button
      - main:
        - generic:
          - generic:
            - generic:
              - generic:
                - generic:
                  - button:
                    - img
                  - generic:
                    - generic:
                      - generic:
                        - heading [level=1]: Location Settings
                      - button:
                        - img
              - generic:
                - generic:
                  - generic:
                    - tablist:
                      - tab [selected]:
                        - generic:
                          - img
                          - text: Basic Information
                      - tab:
                        - generic:
                          - img
                          - text: Location Management History
                    - tabpanel:
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic:
                                          - button [disabled]: Save
                                        - generic:
                                          - generic:
                                            - generic: Office
                                            - textbox [disabled]:
                                              - /placeholder: No office available
                                              - text: "1604"
                                          - generic:
                                            - generic: Local Office
                                            - generic:
                                              - textbox [disabled]:
                                                - /placeholder: Local Office
                                                - text: "1604"
                                          - generic:
                                            - generic: Local Office Name
                                            - generic:
                                              - textbox: Parker Palm Springs
                                          - generic:
                                            - generic: Active
                                            - checkbox [checked]:
                                              - generic:
                                                - img
                                          - generic:
                                            - generic: Live Date
                                            - button:
                                              - img
                                              - text: March 3rd, 1991
                                          - generic:
                                            - generic: Tax Mode
                                            - generic:
                                              - combobox:
                                                - generic: US
                                                - img
                                          - generic:
                                            - generic: Country
                                            - generic:
                                              - combobox:
                                                - generic: United States
                                                - img
                                          - generic:
                                            - generic: Region
                                            - generic:
                                              - combobox:
                                                - generic: Palm Springs
                                                - img
                                          - generic:
                                            - generic: Servicing Branch Office
                                            - combobox:
                                              - generic: Select Servicing Branch Office
                                              - img
                                          - generic:
                                            - generic: Line Of Business
                                            - generic:
                                              - combobox [disabled]:
                                                - generic: Hotel Services Division
                                                - img
                                          - generic:
                                            - generic: Pay To Address
                                            - generic:
                                              - textbox [disabled]: Encore
                                          - generic:
                                            - generic: Union
                                            - checkbox
                                          - generic:
                                            - generic: eCommerce Active
                                            - checkbox [checked] [disabled]:
                                              - generic:
                                                - img
                                          - generic:
                                            - generic: Enable Productions Orders
                                            - checkbox [checked] [disabled]:
                                              - generic:
                                                - img
                        - generic:
                          - generic:
                            - tablist:
                              - tab:
                                - generic:
                                  - img
                                  - text: Local Information
                              - tab:
                                - generic:
                                  - img
                                  - text: Currency
                              - tab:
                                - generic:
                                  - img
                                  - text: Pricing
                              - tab:
                                - generic:
                                  - img
                                  - text: Account and Address
                              - tab:
                                - generic:
                                  - img
                                  - text: Legal
                              - tab:
                                - generic:
                                  - img
                                  - text: Notes
                              - tab [selected]:
                                - generic:
                                  - img
                                  - text: Shared Setup Locations
                              - tab:
                                - generic:
                                  - img
                                  - text: Auto Add-On
                            - generic:
                              - generic:
                                - generic:
                                  - tabpanel:
                                    - generic:
                                      - generic:
                                        - table:
                                          - rowgroup:
                                            - row:
                                              - columnheader: Local Office
                                              - columnheader: Local Office Name
                                              - columnheader: Primary Office
                                              - columnheader: Shares Inventory
                                              - columnheader
                                          - rowgroup:
                                            - row:
                                              - cell: "1565"
                                              - cell: The Westin Buckhead Atlanta
                                              - cell:
                                                - checkbox [disabled]
                                              - cell:
                                                - checkbox [checked]:
                                                  - generic:
                                                    - img
                                              - cell:
                                                - button: Delete
                                            - row:
                                              - cell: "1604"
                                              - cell: Parker Palm Springs
                                              - cell:
                                                - checkbox [checked] [disabled]:
                                                  - generic:
                                                    - img
                                              - cell:
                                                - checkbox
                                              - cell:
                                                - button [disabled]: Delete
                                            - row:
                                              - cell:
                                                - button: Add
                                              - cell
                                              - cell
                                              - cell
                                              - cell
  - region "Notifications alt+T":
    - list:
      - listitem:
        - generic:
          - img
        - generic:
          - generic: Local information updated
  - dialog "Change Local Office" [ref=e2]:
    - generic [ref=e3]:
      - heading "Change Local Office" [level=2] [ref=e4]:
        - generic [ref=e5]:
          - img [ref=e6]
          - generic [ref=e9]: Change Local Office
      - paragraph [ref=e10]
    - generic [ref=e11]:
      - generic [ref=e13]:
        - generic [ref=e14]: "Current: 1604 - Parker Palm Springs"
        - generic [ref=e16]:
          - img [ref=e18]
          - textbox "Search by Location Name, Number" [active] [ref=e21]: "1565"
          - button [ref=e23] [cursor=pointer]:
            - img
      - table [ref=e27]:
        - rowgroup [ref=e28]:
          - row "Local Office Local Office Name" [ref=e29]:
            - columnheader [ref=e30]
            - columnheader "Local Office" [ref=e31]:
              - generic [ref=e32]: Local Office
            - columnheader "Local Office Name" [ref=e33]:
              - generic [ref=e34]: Local Office Name
        - rowgroup [ref=e35]:
          - row "Select row 1565 The Westin Buckhead Atlanta" [ref=e36] [cursor=pointer]:
            - cell "Select row" [ref=e37]:
              - checkbox "Select row" [ref=e38]
            - cell "1565" [ref=e39]:
              - generic [ref=e40]: "1565"
            - cell "The Westin Buckhead Atlanta" [ref=e41]:
              - generic [ref=e42]: The Westin Buckhead Atlanta
    - generic [ref=e44]:
      - button "Select" [disabled]
      - button "Cancel" [ref=e45] [cursor=pointer]
    - button "Close" [ref=e46] [cursor=pointer]:
      - img
      - generic [ref=e47]: Close
```

# Test source

```ts
  760 |  // Delete non-self row and save (use dynamic index — sort order varies)
  761 |     const nsRow = await pg.findNonSelfRow();
  762 |     await pg.deleteNonSelfRow(nsRow!.index);
  763 |     await expect.poll(() => pg.getDataRowCount(), { timeout: 5_000 }).toBe(1);
  764 |     const result = await pg.clickSave();
  765 |     expect(result.success).toBe(true);
  766 |  // Reload and verify row is gone
  767 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  768 |     expect(await pg.getDataRowCount()).toBe(1);
  769 |   });
  770 | 
  771 |   test('TC-LOC-SSL-021: Combined self SI + add location -> save -> reload -> both persisted', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  772 |     dependencyGate(['TC-LOC-SSL-001']);
  773 |     test.setTimeout(90_000);
  774 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  775 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  776 |     await pg.toggleSelfSharesInventory();
  777 |     await pg.clickAdd();
  778 |     await pg.searchInDialog('Denver');
  779 |     await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
  780 |       .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
  781 |     await pg.selectFirstDialogRow();
  782 |     await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
  783 |     await pg.clickDialogSelect();
  784 |     await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  785 |     const result = await pg.clickSave();
  786 |     expect(result.success).toBe(true);
  787 |  // Reload and verify both changes persisted
  788 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  789 |     expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
  790 |     expect(await pg.getDataRowCount()).toBe(2);
  791 |  // Cleanup (per use try/finally for combined dirty state)
  792 |     try {
  793 |       await pg.setSelfSharesInventory(false);
  794 |       const nsRow = await pg.findNonSelfRow();
  795 |       if (nsRow) await pg.deleteNonSelfRow(nsRow.index);
  796 |       await pg.clickSave();
  797 |     } catch {
  798 |       await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  799 |       await pg.ensureCleanSSLTable(OFFICE_NO);
  800 |     }
  801 |   });
  802 | 
  803 |   test('TC-LOC-SSL-022: Cancel Save dialog -> changes not persisted after reload', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  804 |     dependencyGate(['TC-LOC-SSL-001']);
  805 |     test.setTimeout(90_000);
  806 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  807 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  808 |  // Make a change
  809 |     await pg.toggleSelfSharesInventory();
  810 |     expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
  811 |     await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  812 |  // Open Save dialog and cancel it
  813 |     await pg.openSaveDialog();
  814 |     await pg.cancelSaveDialog();
  815 |  // Form still dirty after cancel
  816 |     await expect.poll(() => pg.isSaveEnabled(), { timeout: 3_000 }).toBe(true);
  817 |  // Reload without saving — change should NOT persist
  818 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  819 |     expect((await pg.getSelfSharesInventoryState()).checked).toBe(false);
  820 |   });
  821 | 
  822 |   test('TC-LOC-SSL-023: Beforeunload fires when SSL form is dirty', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  823 |     dependencyGate(['TC-LOC-SSL-001']);
  824 |     test.setTimeout(90_000);
  825 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  826 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  827 |  // Make form dirty
  828 |     await pg.toggleSelfSharesInventory();
  829 |     await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  830 |  // Trigger reload — beforeunload should fire and be dismissed (stay on page)
  831 |     const fired = await pg.triggerBeforeunloadAndStay();
  832 |     expect(fired).toBe(true);
  833 |  // Cleanup: navigate away to discard
  834 |     await pg.discardAndReturn(OFFICE_NO);
  835 |   });
  836 | 
  837 |   test('TC-LOC-SSL-024: Already-added location is absent from Change Local Office dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  838 |     dependencyGate(['TC-LOC-SSL-001']);
  839 |     test.setTimeout(90_000);
  840 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  841 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  842 |     await pg.clickAdd();
  843 |     await pg.searchInDialog('Atlanta');
  844 |     await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
  845 |       .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
  846 |     await pg.selectFirstDialogRow();
  847 |     await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
  848 |     await pg.clickDialogSelect();
  849 |     const result = await pg.clickSave();
  850 |     expect(result.success).toBe(true);
  851 |  // Read the added location from the TABLE (reliable, not dialog)
  852 |     const added = await pg.findNonSelfRow();
  853 |     expect(added).not.toBeNull();
  854 |  // Test: open dialog, search for the same location number — must not appear
  855 |     await pg.clickAdd();
  856 |     await pg.searchInDialog(added!.localOffice);
  857 |  // Wait for debounce — "No results." row shows (count stays 1 but localOffice is empty)
  858 |     await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 }).toBe(1);
  859 |     const row = await pg.getFirstDialogRowText();
> 860 |     expect(row.localOffice).not.toBe(added!.localOffice);
      |                                 ^ Error: expect(received).not.toBe(expected) // Object.is equality
  861 |     await pg.clickDialogCancel();
  862 |  // Cleanup: delete + save (use dynamic index)
  863 |     await pg.deleteNonSelfRow(added!.index);
  864 |     const cleanup = await pg.clickSave();
  865 |     expect(cleanup.success).toBe(true);
  866 |   });
  867 | 
  868 |   test('TC-LOC-SSL-025: Each column header testid resolves to expected text', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  869 |     dependencyGate(['TC-LOC-SSL-001']);
  870 |  // Complements TC-002 (whole-array content check) with per-testid resolution.
  871 |     expect(await pg.isElementVisible('colHeaderLocalOffice')).toBe(true);
  872 |     expect(await pg.isElementVisible('colHeaderLocalOfficeName')).toBe(true);
  873 |     expect(await pg.isElementVisible('colHeaderPrimaryOffice')).toBe(true);
  874 |     expect(await pg.isElementVisible('colHeaderSharesInventory')).toBe(true);
  875 |     expect(await pg.isElementVisible('colHeaderActions')).toBe(true);
  876 |   });
  877 | 
  878 |   test('TC-LOC-SSL-026: Dialog number-search "1233" returns exactly the Miami Marriott office', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  879 |     test.fixme(true, 'Blocked by app bug: Miami-region offices excluded from /api/location/location-lookup visibility filter; search "1233" returns phantom row with empty localOffice cell. Pending Encore fix. Verified-still-blocked 2026-05-22 by user manual probe; see BUG-LOC-SHR-001 + baseline divergence SHR-DIV-006.');
  880 |     dependencyGate(['TC-LOC-SSL-001']);
  881 |     test.setTimeout(60_000);
  882 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  883 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  884 |     await pg.clickAdd();
  885 |     await pg.searchInDialog('1233');
  886 |     await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 }).toBe(1);
  887 |     const row = await pg.getFirstDialogRowText();
  888 |     expect(row.localOffice).toBe('1233');
  889 |     expect(row.localOfficeName).toContain('Miami Marriott');
  890 |     await pg.clickDialogCancel();
  891 |   });
  892 | 
  893 |   test('TC-LOC-SSL-027: Combined self SI + add non-Miami row + save persists both after reload', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  894 |     dependencyGate(['TC-LOC-SSL-001']);
  895 |  // Cross-field save coverage: self SI ON + add non-Miami row (Chicago).
  896 |     test.setTimeout(120_000);
  897 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  898 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  899 |  // Combined change: toggle self SI + add non-Miami row via dialog
  900 |     await pg.toggleSelfSharesInventory();
  901 |     await pg.clickAdd();
  902 |     await pg.searchInDialog('Chicago');
  903 |     await expect.poll(() => pg.getDialogRowCount(), { timeout: 8_000 })
  904 |       .toBeLessThan(ADD_LOCATION.searchByNameMaxResults);
  905 |     await pg.selectFirstDialogRow();
  906 |     await expect.poll(() => pg.isDialogSelectEnabled(), { timeout: 5_000 }).toBe(true);
  907 |     await pg.clickDialogSelect();
  908 |     await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  909 |     const result = await pg.clickSave();
  910 |     expect(result.success).toBe(true);
  911 |  // Reload and verify both changes persisted
  912 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  913 |     expect((await pg.getSelfSharesInventoryState()).checked).toBe(true);
  914 |     expect(await pg.getDataRowCount()).toBe(2);
  915 |  // Cleanup: try/finally for combined dirty state (mirrors TC-021)
  916 |     try {
  917 |       await pg.setSelfSharesInventory(false);
  918 |       const nsRow = await pg.findNonSelfRow();
  919 |       if (nsRow) await pg.deleteNonSelfRow(nsRow.index);
  920 |       await pg.clickSave();
  921 |     } catch {
  922 |       await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  923 |       await pg.ensureCleanSSLTable(OFFICE_NO);
  924 |     }
  925 |   });
  926 | 
  927 |   test('TC-LOC-SSL-028: Top-tab switch with dirty form shows Unsaved Changes dialog; Stay preserves state', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  928 |     dependencyGate(['TC-LOC-SSL-001']);
  929 |     test.setTimeout(60_000);
  930 |     await pg.reloadAndNavigateToSSLTab(OFFICE_NO);
  931 |     await pg.ensureCleanSSLTable(OFFICE_NO);
  932 |     await pg.makeFormDirty();
  933 |     await expect.poll(() => pg.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  934 |     await pg.clickTopLevelTab('tabLocationManagementHistory');
  935 |     expect(await pg.hasVisibleUnsavedDialog(5_000)).toBe(true);
  936 |     await pg.clickUnsavedDialogStay();
  937 |     await expect.poll(() => pg.getActiveTopLevelTab(), { timeout: 5_000 })
  938 |       .toContain('Basic Information');
  939 |     expect(await pg.isSaveEnabled()).toBe(true);
  940 |     await pg.discardAndReturn(OFFICE_NO);
  941 |   });
  942 | 
  943 |   test('TC-LOC-SSL-029: Five rapid Add-button clicks open exactly one dialog', async ({ locationSharedSetupLocationsPage: pg, dependencyGate }) => {
  944 |     dependencyGate(['TC-LOC-SSL-001']);
  945 |  // App-level guard: modal-state blocks repeat invocation while dialog is open.
  946 |  // Load-bearing assertion is dialog-count == 1. Console listener kept for trace visibility
  947 |  // (not asserted — ambient Angular noise like NG0100 / ResizeObserver loop makes strict
  948 |  // empty-array assertion too flaky for CI).
  949 |     test.setTimeout(60_000);
  950 |     // Group A-1 (lifecycle refactor 2026-05-21): bare `page` removed.
  951 |     // console listener now attaches to the REAL app page and will actually capture errors
  952 |     // emitted while clicking Add.
  953 |     const realPage = pg.page;
  954 |     const consoleErrors: string[] = [];
  955 |     const errorHandler = (msg: import('@playwright/test').ConsoleMessage) => {
  956 |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  957 |     };
  958 |     realPage.on('console', errorHandler);
  959 |     try {
  960 |       await pg.rapidClickAdd(5, 50);
```