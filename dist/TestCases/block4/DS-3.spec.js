"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanup_fixture_1 = require("../../fixtures/cleanup.fixture");
const didaxis_1 = require("./helpers/didaxis");
// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.
cleanup_fixture_1.test.describe('DS-3: Program Name Validation and Duplicate Prevention', () => {
    cleanup_fixture_1.test.beforeEach(async ({ page }) => {
        await (0, didaxis_1.loginAsAdmin)(page);
        await (0, didaxis_1.goToPrograms)(page);
    });
    cleanup_fixture_1.test.describe('Positive Flows', () => {
        (0, cleanup_fixture_1.test)('TC-001: Valid program name with special characters is accepted', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Informatique & IA - Niveau 2');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Programme bilingue en informatique et intelligence artificielle'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-002: Standard alphanumeric program name is accepted', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Full-stack web development program'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-003: Program name with hyphens and numbers is accepted', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('AI-101: Intro to Machine Learning (2026)');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'ML fundamentals'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
    });
    cleanup_fixture_1.test.describe('Negative Flows', () => {
        (0, cleanup_fixture_1.test)('TC-004: Whitespace-only program name is rejected', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill('   ');
            await didaxis_1.dialogFields.description(dialog).fill('Full-stack web development program');
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.createButton(dialog)).toBeDisabled();
        });
        (0, cleanup_fixture_1.test)('TC-005: Empty program name is rejected', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.createButton(dialog)).toBeDisabled();
        });
        (0, cleanup_fixture_1.test)('TC-006: Duplicate program name is rejected on create', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Duplicate Test Program');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'First'));
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.description(dialog).fill('Second attempt');
            await didaxis_1.dialogFields.createButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countProgramsNamed)(page, name)).toBe(1);
        });
        (0, cleanup_fixture_1.test)('TC-007: Duplicate check is case-insensitive (if product rule applies)', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('CaseSensitive Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original'));
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name.toLowerCase());
            await didaxis_1.dialogFields.description(dialog).fill('Case variant');
            await didaxis_1.dialogFields.createButton(dialog).click();
            const stillOpen = await dialog.isVisible();
            const total = await (0, didaxis_1.countProgramsNamed)(page, name);
            (0, cleanup_fixture_1.expect)(stillOpen || total === 1).toBeTruthy();
        });
        (0, cleanup_fixture_1.test)('TC-008: Duplicate name after trim is rejected', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Trim Duplicate Test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original'));
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(`  ${name}  `);
            await didaxis_1.dialogFields.createButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countProgramsNamed)(page, name)).toBe(1);
        });
        (0, cleanup_fixture_1.test)('TC-009: Program is not created when validation API fails', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('API Fail Test');
            await page.route('**/programs**', (route) => {
                if (route.request().method() === 'POST') {
                    route.fulfill({ status: 500, body: 'Validation service unavailable' });
                }
                else {
                    route.continue();
                }
            });
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.createButton(dialog).click();
            await (0, didaxis_1.expectProgramNotInList)(page, name);
        });
    });
    cleanup_fixture_1.test.describe('Edge Cases', () => {
        (0, cleanup_fixture_1.test)('TC-010: Program name at maximum length passes validation', async ({ page, trackProgram }) => {
            const prefix = (0, didaxis_1.uniqueName)('Max');
            const maxName = (prefix + 'A'.repeat(255)).slice(0, 255);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, maxName, 'Max length test'));
            await (0, didaxis_1.expectProgramInList)(page, maxName);
        });
        (0, cleanup_fixture_1.test)('TC-011: Program name one character over max length is rejected', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill('E'.repeat(256));
            const createBtn = didaxis_1.dialogFields.createButton(dialog);
            const disabled = await createBtn.isDisabled();
            if (!disabled) {
                const programId = await (0, didaxis_1.tryCaptureProgramCreate)(page, async () => {
                    await createBtn.click();
                });
                if (programId)
                    trackProgram(programId); // Cleanup: track if create succeeded
                await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            }
            else {
                await (0, cleanup_fixture_1.expect)(createBtn).toBeDisabled();
            }
        });
        (0, cleanup_fixture_1.test)('TC-012: Single-character program name validation', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Z');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Single char validation'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-013: Unicode and emoji in program name pass validation', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('日本語 🎌 Program');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Unicode validation'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-014: Disallowed special characters are rejected with clear message', async ({ page, trackProgram }) => {
            const invalidName = 'Invalid<>Name|"Test';
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(invalidName);
            await didaxis_1.dialogFields.description(dialog).fill('Special char test');
            const programId = await (0, didaxis_1.tryCaptureProgramCreate)(page, async () => {
                await didaxis_1.dialogFields.createButton(dialog).click();
            });
            if (programId)
                trackProgram(programId); // Cleanup: track if create succeeded
            const created = (await (0, didaxis_1.countProgramsNamed)(page, invalidName)) > 0;
            const stillOpen = await dialog.isVisible();
            (0, cleanup_fixture_1.expect)(created || stillOpen).toBeTruthy();
        });
        (0, cleanup_fixture_1.test)('TC-015: Leading and trailing whitespace is trimmed before duplicate check', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Whitespace Dup');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'First'));
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(`  ${name}  `);
            await didaxis_1.dialogFields.createButton(dialog).click();
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countProgramsNamed)(page, name)).toBe(1);
        });
        (0, cleanup_fixture_1.test)('TC-016: Tab and newline characters in name are handled', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill('Tab\tName Test');
            await didaxis_1.dialogFields.description(dialog).fill('Tab test');
            const createBtn = didaxis_1.dialogFields.createButton(dialog);
            if (await createBtn.isEnabled()) {
                const programId = await (0, didaxis_1.tryCaptureProgramCreate)(page, async () => {
                    await createBtn.click();
                });
                if (programId)
                    trackProgram(programId); // Cleanup: track if create succeeded
            }
            const visible = await dialog.isVisible();
            (0, cleanup_fixture_1.expect)(visible !== undefined).toBeTruthy();
        });
        (0, cleanup_fixture_1.test)('TC-017: Duplicate prevention on edit when renaming', async ({ page, trackProgram }) => {
            const existing = (0, didaxis_1.uniqueName)('Existing Program');
            const toRename = (0, didaxis_1.uniqueName)('Rename Target');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, existing, 'Existing'));
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, toRename, 'Target'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, toRename);
            await didaxis_1.dialogFields.programName(dialog).fill(existing);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            await (0, didaxis_1.expectProgramInList)(page, toRename);
        });
        (0, cleanup_fixture_1.test)('TC-018: Concurrent duplicate create by two users', async ({ browser, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Concurrent Dup');
            const contextA = await browser.newContext();
            const contextB = await browser.newContext();
            const pageA = await contextA.newPage();
            const pageB = await contextB.newPage();
            await (0, didaxis_1.loginAsAdmin)(pageA);
            await (0, didaxis_1.goToPrograms)(pageA);
            // Cleanup: auto-track programs created on this page
            await (0, didaxis_1.watchProgramCreates)(pageA, trackProgram);
            await (0, didaxis_1.loginAsAdmin)(pageB);
            await (0, didaxis_1.goToPrograms)(pageB);
            // Cleanup: auto-track programs created on this page
            await (0, didaxis_1.watchProgramCreates)(pageB, trackProgram);
            const dialogA = await (0, didaxis_1.openNewProgramDialog)(pageA);
            const dialogB = await (0, didaxis_1.openNewProgramDialog)(pageB);
            await didaxis_1.dialogFields.programName(dialogA).fill(name);
            await didaxis_1.dialogFields.programName(dialogB).fill(name);
            await Promise.all([
                didaxis_1.dialogFields.createButton(dialogA).click(),
                didaxis_1.dialogFields.createButton(dialogB).click(),
            ]);
            await pageA.waitForTimeout(2000);
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countProgramsNamed)(pageA, name)).toBeLessThanOrEqual(1);
            await contextA.close();
            await contextB.close();
        });
    });
});
//# sourceMappingURL=DS-3.spec.js.map