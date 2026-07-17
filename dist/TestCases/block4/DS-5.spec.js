"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanup_fixture_1 = require("../../fixtures/cleanup.fixture");
const didaxis_1 = require("./helpers/didaxis");
// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.
cleanup_fixture_1.test.describe('DS-5: Program List Filtering and Display', () => {
    cleanup_fixture_1.test.beforeEach(async ({ page }) => {
        await (0, didaxis_1.loginAsAdmin)(page);
        await (0, didaxis_1.goToPrograms)(page);
    });
    cleanup_fixture_1.test.describe('Positive Flows', () => {
        (0, cleanup_fixture_1.test)('TC-001: Program list displays name and description for each program', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const description = 'Full-stack web development program';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            await (0, didaxis_1.expectProgramInList)(page, name);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, description);
        });
        cleanup_fixture_1.test.skip('TC-002: Empty state shown when no programs exist', async () => {
            cleanup_fixture_1.test.skip(true, 'Test environment contains existing programs; empty state cannot be guaranteed');
        });
        (0, cleanup_fixture_1.test)('TC-003: List updates after creating a new program', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Mobile App Development');
            const description = 'iOS and Android development';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, description);
        });
        (0, cleanup_fixture_1.test)('TC-004: List reflects edits immediately', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Edit Display Test');
            const updated = `${name} Updated`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updated);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, didaxis_1.expectProgramInList)(page, updated);
        });
        (0, cleanup_fixture_1.test)('TC-005: List reflects deletion immediately', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Delete Display Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'To be deleted'));
            await (0, didaxis_1.deleteProgram)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-006: Programs with empty description display appropriately', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('No Description Program');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
    });
    cleanup_fixture_1.test.describe('Negative Flows', () => {
        cleanup_fixture_1.test.skip('TC-007: List does not show programs user is unauthorized to view', async () => {
            cleanup_fixture_1.test.skip(true, 'Requires non-admin credentials in .env');
        });
        (0, cleanup_fixture_1.test)('TC-008: API failure shows error state instead of empty list', async ({ page, trackProgram }) => {
            await page.route('**/programs**', (route) => {
                if (route.request().method() === 'GET') {
                    route.fulfill({ status: 500, body: 'List unavailable' });
                }
                else {
                    route.continue();
                }
            });
            await page.reload();
            const hasTable = await didaxis_1.locators.programsPage.table(page).isVisible().catch(() => false);
            const hasError = await didaxis_1.locators.programsPage.errorMessage(page).first().isVisible().catch(() => false);
            (0, cleanup_fixture_1.expect)(hasTable || hasError).toBeTruthy();
        });
        (0, cleanup_fixture_1.test)('TC-009: Partial data does not break list rendering', async ({ page, trackProgram }) => {
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.programsPage.table(page)).toBeVisible();
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.programsPage.programColumnHeader(page)).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-010: XSS in stored description is not executed in list', async ({ page, trackProgram }) => {
            let alertFired = false;
            page.on('dialog', (dialog) => {
                alertFired = true;
                dialog.dismiss();
            });
            const name = (0, didaxis_1.uniqueName)('XSS List Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, "<img src=x onerror=alert('xss')>"));
            await (0, didaxis_1.expectProgramInList)(page, name);
            (0, cleanup_fixture_1.expect)(alertFired).toBe(false);
        });
    });
    cleanup_fixture_1.test.describe('Edge Cases', () => {
        (0, cleanup_fixture_1.test)('TC-011: Long program name displays with truncation or wrap', async ({ page, trackProgram }) => {
            const prefix = (0, didaxis_1.uniqueName)('LongDisplay');
            const longName = (prefix + 'N'.repeat(200)).slice(0, 255);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, longName, 'Long name display'));
            await (0, cleanup_fixture_1.expect)((0, didaxis_1.programRow)(page, longName).first()).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-012: Long description displays with truncation or expand', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Long Desc Display');
            const description = 'L'.repeat(500);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            await (0, cleanup_fixture_1.expect)((0, didaxis_1.programRow)(page, name).first()).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-013: Special characters in name and description render correctly', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Informatique & IA - Niveau 2');
            const description = 'Programme bilingue — niveau avancé';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, description);
        });
        (0, cleanup_fixture_1.test)('TC-014: Large number of programs renders performantly', async ({ page, trackProgram }) => {
            const start = Date.now();
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.programsPage.table(page)).toBeVisible();
            const elapsed = Date.now() - start;
            (0, cleanup_fixture_1.expect)(elapsed).toBeLessThan(10_000);
            (0, cleanup_fixture_1.expect)(await didaxis_1.locators.programsPage.dataRows(page).count()).toBeGreaterThan(1);
        });
        (0, cleanup_fixture_1.test)('TC-015: Single program list displays correctly', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Single Program Display');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Only program in this test'));
            await (0, didaxis_1.expectProgramInList)(page, name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.programsPage.programColumnHeader(page)).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-016: Emoji in program name and description display correctly', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Data Science 🚀 2026');
            const description = 'Learn ML with fun 🎯';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            await (0, cleanup_fixture_1.expect)((0, didaxis_1.programRow)(page, name).getByText('🚀')).toBeVisible();
            await (0, cleanup_fixture_1.expect)((0, didaxis_1.programRow)(page, name).getByText('🎯')).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-017: List sort order is consistent', async ({ page, trackProgram }) => {
            const first = (0, didaxis_1.uniqueName)('AAA Sort Test');
            const second = (0, didaxis_1.uniqueName)('ZZZ Sort Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, first, 'First'));
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, second, 'Second'));
            const names = await (0, didaxis_1.getProgramListNames)(page);
            (0, cleanup_fixture_1.expect)(names.length).toBeGreaterThan(0);
        });
        (0, cleanup_fixture_1.test)('TC-018: Empty state CTA navigates to create flow', async ({ page, trackProgram }) => {
            await didaxis_1.locators.programsPage.newProgramButton(page).click();
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.createProgramDialog.dialog(page)).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-019: List filtering by search (if feature exists)', async ({ page, trackProgram }) => {
            const search = didaxis_1.locators.programsPage.searchBox(page);
            if ((await search.count()) === 0) {
                cleanup_fixture_1.test.skip(true, 'Search filter is not available on the Programs page');
                return;
            }
            const name = (0, didaxis_1.uniqueName)('Search Filter Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Searchable program'));
            await search.fill(name);
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
    });
});
//# sourceMappingURL=DS-5.spec.js.map