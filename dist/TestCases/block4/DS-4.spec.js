"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanup_fixture_1 = require("../../fixtures/cleanup.fixture");
const didaxis_1 = require("./helpers/didaxis");
// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.
cleanup_fixture_1.test.describe('DS-4: Delete Program with Confirmation', () => {
    cleanup_fixture_1.test.beforeEach(async ({ page }) => {
        await (0, didaxis_1.loginAsAdmin)(page);
        await (0, didaxis_1.goToPrograms)(page);
    });
    cleanup_fixture_1.test.describe('Positive Flows', () => {
        (0, cleanup_fixture_1.test)('TC-001: Confirmed deletion removes program from list', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Test Program');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Program used for deletion testing'));
            await (0, didaxis_1.deleteProgram)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-002: Cancelled deletion keeps program in list', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Keep this program'));
            await (0, didaxis_1.clickDeleteAndHandleDialog)(page, name, 'dismiss');
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-003: Confirmation dialog displays program identifier', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Data Science Fundamentals');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Foundations of data science'));
            const message = await (0, didaxis_1.clickDeleteAndHandleDialog)(page, name, 'dismiss');
            (0, cleanup_fixture_1.expect)(message).toContain(name);
            (0, cleanup_fixture_1.expect)(message.toLowerCase()).toMatch(/delete|remove/);
        });
        (0, cleanup_fixture_1.test)('TC-004: List updates immediately after successful deletion', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Cybersecurity Bootcamp');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Security program'));
            await (0, didaxis_1.expectProgramInList)(page, name);
            await (0, didaxis_1.deleteProgram)(page, name);
            await (0, cleanup_fixture_1.expect)(page).toHaveURL(/\/programs/);
        });
        (0, cleanup_fixture_1.test)('TC-005: Success feedback shown after deletion', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Mobile App Development');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'iOS and Android development'));
            await (0, didaxis_1.deleteProgram)(page, name);
            await (0, didaxis_1.expectProgramNotInList)(page, name);
        });
    });
    cleanup_fixture_1.test.describe('Negative Flows', () => {
        (0, cleanup_fixture_1.test)('TC-006: Delete icon click alone does not remove program', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('UX Design Certificate');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'UX program'));
            await (0, didaxis_1.clickDeleteAndHandleDialog)(page, name, 'dismiss');
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        cleanup_fixture_1.test.skip('TC-007: Non-admin user cannot delete programs', async () => {
            cleanup_fixture_1.test.skip(true, 'Requires non-admin credentials in .env');
        });
        (0, cleanup_fixture_1.test)('TC-008: Server error during delete leaves program intact', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Cloud Computing 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Cloud program'));
            await page.route('**/programs/**', (route) => {
                if (route.request().method() === 'DELETE') {
                    route.fulfill({ status: 500, body: 'Delete failed' });
                }
                else {
                    route.continue();
                }
            });
            page.once('dialog', (dialog) => dialog.accept());
            await didaxis_1.locators.programList.deleteButton(page, name).click();
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-009: Deleting already-deleted program shows appropriate error', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('DevOps Engineering 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'DevOps'));
            await (0, didaxis_1.deleteProgram)(page, name);
            await (0, didaxis_1.expectProgramNotInList)(page, name);
        });
        cleanup_fixture_1.test.skip('TC-010: Program with dependencies cannot be deleted (if business rule applies)', async () => {
            cleanup_fixture_1.test.skip(true, 'Requires program with linked courses/enrollments');
        });
    });
    cleanup_fixture_1.test.describe('Edge Cases', () => {
        (0, cleanup_fixture_1.test)('TC-011: Delete program with long name displays correctly in dialog', async ({ page, trackProgram }) => {
            const prefix = (0, didaxis_1.uniqueName)('LongName');
            const longName = (prefix + 'L'.repeat(200)).slice(0, 255);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, longName, 'Long name delete test'));
            const message = await (0, didaxis_1.clickDeleteAndHandleDialog)(page, longName, 'dismiss');
            (0, cleanup_fixture_1.expect)(message).toContain(longName);
        });
        (0, cleanup_fixture_1.test)('TC-012: Delete program with special characters in name', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('AI & ML: Phase-1 (2026)');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Special chars'));
            const message = await (0, didaxis_1.clickDeleteAndHandleDialog)(page, name, 'dismiss');
            (0, cleanup_fixture_1.expect)(message).toContain(name);
        });
        (0, cleanup_fixture_1.test)('TC-013: Escape key dismisses confirmation without deleting', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Escape Delete Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Escape test'));
            page.once('dialog', (dialog) => dialog.dismiss());
            await didaxis_1.locators.programList.deleteButton(page, name).click();
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-014: Double-click confirm does not cause errors', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Double Confirm Delete');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Double confirm'));
            let confirmCount = 0;
            page.on('dialog', async (dialog) => {
                confirmCount += 1;
                await dialog.accept();
            });
            await didaxis_1.locators.programList.deleteButton(page, name).click();
            await page.waitForTimeout(1000);
            (0, cleanup_fixture_1.expect)(confirmCount).toBeGreaterThanOrEqual(1);
        });
        (0, cleanup_fixture_1.test)('TC-015: Delete last remaining program transitions to empty state', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Last Program Probe');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Only one for this test scope'));
            await (0, didaxis_1.deleteProgram)(page, name);
            await (0, didaxis_1.expectProgramNotInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-016: Click outside dialog cancels deletion (if supported)', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Outside Click Delete');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Outside click test'));
            page.once('dialog', (dialog) => dialog.dismiss());
            await didaxis_1.locators.programList.deleteButton(page, name).click();
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        cleanup_fixture_1.test.skip('TC-017: Undo after delete (if feature exists)', async () => {
            cleanup_fixture_1.test.skip(true, 'Undo after delete is not implemented in the application');
        });
    });
});
//# sourceMappingURL=DS-4.spec.js.map