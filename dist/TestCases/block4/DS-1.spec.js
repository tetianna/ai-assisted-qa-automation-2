"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanup_fixture_1 = require("../../fixtures/cleanup.fixture");
const didaxis_1 = require("./helpers/didaxis");
// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.
cleanup_fixture_1.test.describe('DS-1: Create New Academic Program', () => {
    cleanup_fixture_1.test.beforeEach(async ({ page }) => {
        await (0, didaxis_1.loginAsAdmin)(page);
        await (0, didaxis_1.goToPrograms)(page);
    });
    cleanup_fixture_1.test.describe('Positive Flows', () => {
        (0, cleanup_fixture_1.test)('TC-001: Program creation form displays required fields', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(dialog)).toBeVisible();
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.description(dialog)).toBeVisible();
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.createButton(dialog)).toBeVisible();
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.cancelButton(dialog)).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-002: New program appears in list after successful creation', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.description(dialog).fill('Full-stack web development program');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.submitNewProgram)(page, dialog));
            await (0, didaxis_1.expectProgramInList)(page, name);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, 'Full-stack web development program');
        });
        (0, cleanup_fixture_1.test)('TC-003: Create button remains disabled when Program Name is empty', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.description(dialog).fill('Full-stack web development program');
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.createButton(dialog)).toBeDisabled();
        });
        (0, cleanup_fixture_1.test)('TC-004: Program can be created with Program Name only', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Data Science Fundamentals');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-005: Cancel closes form without creating a program', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Cybersecurity Bootcamp 2026');
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.description(dialog).fill('Introductory cybersecurity program');
            await didaxis_1.dialogFields.cancelButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectProgramNotInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-006: Create button enables after clearing and re-entering Program Name', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Mobile App Development');
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            const nameField = didaxis_1.dialogFields.programName(dialog);
            const createBtn = didaxis_1.dialogFields.createButton(dialog);
            await nameField.fill(name);
            await (0, cleanup_fixture_1.expect)(createBtn).toBeEnabled();
            await nameField.clear();
            await (0, cleanup_fixture_1.expect)(createBtn).toBeDisabled();
            await nameField.fill(name);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.submitNewProgram)(page, dialog));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
    });
    cleanup_fixture_1.test.describe('Negative Flows', () => {
        (0, cleanup_fixture_1.test)('TC-007: Program is not created when submission is blocked by empty name', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill('   ');
            await didaxis_1.dialogFields.description(dialog).fill('Full-stack web development program');
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.createButton(dialog)).toBeDisabled();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-008: Duplicate program name is not allowed', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'First program'));
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.description(dialog).fill('Duplicate attempt description');
            await didaxis_1.dialogFields.createButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countProgramsNamed)(page, name)).toBe(1);
        });
        cleanup_fixture_1.test.skip('TC-009: Non-admin user cannot create a program', async () => {
            cleanup_fixture_1.test.skip(true, 'Requires non-admin credentials in .env');
        });
        (0, cleanup_fixture_1.test)('TC-010: Program is not created when create request fails due to server error', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Cloud Computing 2026');
            await page.route('**/programs**', (route) => {
                if (route.request().method() === 'POST') {
                    route.fulfill({ status: 500, body: 'Internal Server Error' });
                }
                else {
                    route.continue();
                }
            });
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.description(dialog).fill('AWS and Azure fundamentals');
            await didaxis_1.dialogFields.createButton(dialog).click();
            await (0, didaxis_1.expectProgramNotInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-011: XSS payload in Description is not executed in the program list', async ({ page, trackProgram }) => {
            let alertFired = false;
            page.on('dialog', (dialog) => {
                alertFired = true;
                dialog.dismiss();
            });
            const name = (0, didaxis_1.uniqueName)('Secure Coding 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, "<script>alert('xss')</script>"));
            await (0, didaxis_1.expectProgramInList)(page, name);
            (0, cleanup_fixture_1.expect)(alertFired).toBe(false);
        });
    });
    cleanup_fixture_1.test.describe('Edge Cases', () => {
        (0, cleanup_fixture_1.test)('TC-012: Program Name at maximum allowed length is accepted', async ({ page, trackProgram }) => {
            const prefix = (0, didaxis_1.uniqueName)('MaxLen');
            const fullName = (prefix + 'A'.repeat(255)).slice(0, 255);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, fullName, 'Boundary length validation program'));
            await (0, didaxis_1.expectProgramInList)(page, fullName);
        });
        (0, cleanup_fixture_1.test)('TC-013: Program Name exceeding maximum length is rejected', async ({ page, trackProgram }) => {
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill('B'.repeat(256));
            await didaxis_1.dialogFields.description(dialog).fill('Over limit test');
            const createBtn = didaxis_1.dialogFields.createButton(dialog);
            const isDisabled = await createBtn.isDisabled();
            if (!isDisabled) {
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
        (0, cleanup_fixture_1.test)('TC-014: Program Name with special characters is handled correctly', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('AI & ML: Phase-1 (2026)');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Covers neural networks and NLP'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-015: Leading and trailing whitespace in Program Name is trimmed', async ({ page, trackProgram }) => {
            const base = (0, didaxis_1.uniqueName)('Web Development 2026');
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(`  ${base}  `);
            await didaxis_1.dialogFields.description(dialog).fill('Whitespace trim test');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.submitNewProgram)(page, dialog));
            await (0, didaxis_1.expectProgramInList)(page, base);
        });
        (0, cleanup_fixture_1.test)('TC-016: Description at maximum allowed length is accepted', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('UX Design Certificate');
            const description = 'D'.repeat(2000);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-017: Unicode and emoji in Program Name are preserved', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Programme Français 🎓 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Programme bilingue pour étudiants internationaux'));
            await (0, didaxis_1.expectProgramInList)(page, name);
            await (0, cleanup_fixture_1.expect)((0, didaxis_1.programRow)(page, name).getByText('🎓')).toBeVisible();
        });
        (0, cleanup_fixture_1.test)('TC-018: Single-character Program Name is accepted', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('X');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Single character name boundary test'));
            await (0, didaxis_1.expectProgramInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-019: Rapid double-click on Create does not create duplicate programs', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('DevOps Engineering 2026');
            const dialog = await (0, didaxis_1.openNewProgramDialog)(page);
            await didaxis_1.dialogFields.programName(dialog).fill(name);
            await didaxis_1.dialogFields.description(dialog).fill('CI/CD and infrastructure automation');
            const programId = await (0, didaxis_1.submitNewProgramDblClick)(page, dialog);
            if (programId)
                trackProgram(programId); // Cleanup: track if create succeeded
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countProgramsNamed)(page, name)).toBeLessThanOrEqual(1);
        });
    });
});
//# sourceMappingURL=DS-1.spec.js.map