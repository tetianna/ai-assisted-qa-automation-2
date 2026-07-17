# Snapshot: 9testfaile

**Date:** 2026-07-07  
**Command:** `npx playwright test TestCases/block4/DS-2.spec.ts --project=chromium`  
**Result:** 21 passed, 7 failed, 1 skipped (29 total)

## Failed tests (Chromium replay)

| TC | Simple failure reason |
|---|---|
| TC-008 | Renaming to an existing program name was allowed; original program disappeared from the list |
| TC-009 | After a fake server error on save, no error message was shown to the user |
| TC-013 | A 256-character name was saved; original program name was gone from the list |
| TC-014 | Updated name with special characters was not found in the program list after save |
| TC-016 | Emoji/unicode name appeared many times in the list (duplicate rows) |
| TC-028 | Single-letter name "N" appeared twice in the list (duplicate rows) |
| TC-020 | Case-only duplicate rename was allowed; original program disappeared from the list |

## Skipped

| TC | Reason |
|---|---|
| TC-010 | Non-admin credentials not set in `.env` |

## Passed (21)

TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-007, TC-011, TC-012, TC-015, TC-017, TC-018, TC-019, TC-021, TC-022, TC-023, TC-024, TC-025, TC-026, TC-027, TC-029
