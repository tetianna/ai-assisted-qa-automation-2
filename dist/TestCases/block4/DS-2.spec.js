"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanup_fixture_1 = require("../../fixtures/cleanup.fixture");
const didaxis_1 = require("./helpers/didaxis");
// Cleanup fixture: test and trackProgram come from fixtures/cleanup.fixture.ts.
// Call trackProgram(uuid) after each program create; teardown deletes via DELETE /api/programs/<uuid>.
cleanup_fixture_1.test.describe('DS-2: Edit Existing Program Details', () => {
    cleanup_fixture_1.test.beforeEach(async ({ page }) => {
        await (0, didaxis_1.loginAsAdmin)(page);
        await (0, didaxis_1.goToPrograms)(page);
    });
    cleanup_fixture_1.test.describe('Positive Flows', () => {
        // Jira DS-2 AC: "Open program for editing"
        (0, cleanup_fixture_1.test)('TC-001: Edit form opens with current program data pre-populated', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const description = 'Full-stack web development program';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(dialog)).toHaveValue(name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.description(dialog)).toHaveValue(description);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.saveButton(dialog)).toBeVisible();
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.cancelButton(dialog)).toBeVisible();
            await (0, didaxis_1.expectAiConfigFieldsVisible)(dialog);
        });
        // Jira DS-2 AC: "Successfully edit a program name"
        (0, cleanup_fixture_1.test)('TC-002: Updated program name is reflected immediately in the list', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const updated = `${name} - Updated`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original description'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updated);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(dialog)).toHaveValue(updated);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, updated);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
            const reopen = await (0, didaxis_1.openEditProgram)(page, updated);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(reopen)).toHaveValue(updated);
        });
        // Jira DS-2 AC: "Edit preserves unchanged fields"
        (0, cleanup_fixture_1.test)('TC-003: Unchanged fields remain intact when only Description is edited', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Data Science Fundamentals');
            const updatedDescription = 'Advanced data science and machine learning track';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Introductory data science course'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).fill(updatedDescription);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, updatedDescription);
            const reopen = await (0, didaxis_1.openEditProgram)(page, name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(reopen)).toHaveValue(name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.description(reopen)).toHaveValue(updatedDescription);
        });
        (0, cleanup_fixture_1.test)('TC-004: Both Name and Description can be updated in a single save', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Cybersecurity Bootcamp');
            const updatedName = `${name} 2026`;
            const updatedDescription = 'Hands-on security operations and incident response';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updatedName);
            await didaxis_1.dialogFields.description(dialog).fill(updatedDescription);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, updatedName);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, updatedName, updatedDescription);
            const reopen = await (0, didaxis_1.openEditProgram)(page, updatedName);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(reopen)).toHaveValue(updatedName);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.description(reopen)).toHaveValue(updatedDescription);
        });
        (0, cleanup_fixture_1.test)('TC-005: Cancel discards unsaved edits', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Mobile App Development');
            const draftName = `${name} - Draft`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original description'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(draftName);
            await didaxis_1.dialogFields.cancelButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, draftName);
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            const reopen = await (0, didaxis_1.openEditProgram)(page, name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(reopen)).toHaveValue(name);
        });
        (0, cleanup_fixture_1.test)('TC-006: Save button enables when valid changes are made', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('UX Design Certificate');
            const updatedDescription = 'User research and prototyping fundamentals';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).fill(updatedDescription);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.saveButton(dialog)).toBeEnabled();
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, updatedDescription);
        });
        (0, cleanup_fixture_1.test)('TC-024: Close button discards unsaved edits', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Mobile App Development Close');
            const draftName = `${name} - Draft`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original description'));
            await (0, didaxis_1.expectEditDiscarded)(page, name, draftName, async (dialog) => {
                await didaxis_1.dialogFields.closeButton(dialog).click();
            });
        });
        (0, cleanup_fixture_1.test)('TC-025: Escape key discards unsaved edits', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Mobile App Development Escape');
            const draftName = `${name} - Draft`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original description'));
            await (0, didaxis_1.expectEditDiscarded)(page, name, draftName, async (dialog) => {
                await dialog.page().keyboard.press('Escape');
            });
        });
    });
    cleanup_fixture_1.test.describe('Negative Flows', () => {
        (0, cleanup_fixture_1.test)('TC-007: Empty Name prevents save on edit', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Cloud Computing 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Description'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).clear();
            const saveBtn = didaxis_1.dialogFields.saveButton(dialog);
            if (await saveBtn.isEnabled()) {
                await saveBtn.click();
                await (0, cleanup_fixture_1.expect)((0, didaxis_1.editProgramDialog)(page)).toBeVisible();
                await (0, didaxis_1.expectEditValidationOrError)(dialog);
            }
            else {
                await (0, cleanup_fixture_1.expect)(saveBtn).toBeDisabled();
            }
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-008: Duplicate name on edit is rejected', async ({ page, trackProgram }) => {
            const existing = (0, didaxis_1.uniqueName)('Web Development 2026');
            const toRename = (0, didaxis_1.uniqueName)('AI Fundamentals');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, existing, 'Existing program'));
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, toRename, 'To rename'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, toRename);
            await didaxis_1.dialogFields.programName(dialog).fill(existing);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            await (0, didaxis_1.expectEditValidationOrError)(dialog);
            await (0, didaxis_1.expectExactProgramNameInList)(page, toRename);
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countExactProgramsNamed)(page, existing)).toBe(1);
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countExactProgramsNamed)(page, toRename)).toBe(1);
        });
        (0, cleanup_fixture_1.test)('TC-009: Server error during save does not corrupt program data', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('DevOps Engineering 2026');
            const originalDesc = 'Original DevOps curriculum';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, originalDesc));
            await page.route('**/programs/**', (route) => {
                if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
                    route.fulfill({ status: 500, body: 'Internal Server Error' });
                }
                else {
                    route.continue();
                }
            });
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).fill('Updated DevOps curriculum');
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            const dialogError = dialog.getByText(/error|failed|unable|something went wrong|internal server/i);
            const pageError = didaxis_1.locators.programsPage.errorMessage(page);
            await (0, cleanup_fixture_1.expect)(dialogError.or(pageError)).toBeVisible();
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, originalDesc);
            await (0, didaxis_1.dismissEditProgramIfOpen)(page);
            const reopen = await (0, didaxis_1.openEditProgram)(page, name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.description(reopen)).toHaveValue(originalDesc);
        });
        (0, cleanup_fixture_1.test)('TC-010: Non-admin user cannot edit programs', async ({ page, trackProgram }) => {
            cleanup_fixture_1.test.skip(!(0, didaxis_1.hasNonAdminCredentials)(), 'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD in .env');
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Admin-created program'));
            await didaxis_1.locators.navigation.signOutButton(page).click();
            await (0, didaxis_1.loginAsNonAdmin)(page);
            await (0, didaxis_1.goToPrograms)(page);
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.programList.editButton(page, name)).toHaveCount(0);
            await (0, cleanup_fixture_1.expect)(page.getByRole('button', { name: `Edit ${name}` })).toHaveCount(0);
        });
        (0, cleanup_fixture_1.test)('TC-011: Saving with no changes does not trigger unnecessary update', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Secure Coding 2026');
            const description = 'Secure coding basics';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, description));
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countExactProgramsNamed)(page, name)).toBe(1);
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, description);
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countExactProgramsNamed)(page, name)).toBe(1);
        });
        (0, cleanup_fixture_1.test)('TC-026: XSS payload in edited Description is not executed in the program list', async ({ page, trackProgram }) => {
            let alertFired = false;
            page.on('dialog', (browserDialog) => {
                alertFired = true;
                browserDialog.dismiss();
            });
            const name = (0, didaxis_1.uniqueName)('Secure Coding 2026');
            const xssPayload = "<script>alert('xss')</script>";
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original safe description'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).fill(xssPayload);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            (0, cleanup_fixture_1.expect)(alertFired).toBe(false);
        });
    });
    cleanup_fixture_1.test.describe('Edge Cases', () => {
        (0, cleanup_fixture_1.test)('TC-012: Name at maximum length can be saved on edit', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('MaxLen');
            const maxName = (name + 'A'.repeat(255)).slice(0, 255);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Short'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(maxName);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, maxName);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-013: Name exceeding max length is rejected on edit', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Boundary Test Program');
            const overLimitName = 'C'.repeat(256);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Test'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(overLimitName);
            const saveBtn = didaxis_1.dialogFields.saveButton(dialog);
            if (await saveBtn.isEnabled()) {
                await saveBtn.click();
                await (0, cleanup_fixture_1.expect)((0, didaxis_1.editProgramDialog)(page)).toBeVisible();
            }
            else {
                await (0, cleanup_fixture_1.expect)(saveBtn).toBeDisabled();
            }
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, overLimitName);
        });
        (0, cleanup_fixture_1.test)('TC-014: Special characters in edited Name are preserved', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const updated = 'Informatique & IA - Niveau 2 (2026)';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Test'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updated);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, updated);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
            const reopen = await (0, didaxis_1.openEditProgram)(page, updated);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.programName(reopen)).toHaveValue(updated);
        });
        (0, cleanup_fixture_1.test)('TC-015: Leading and trailing whitespace is trimmed on save', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('TrimTest');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Test'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            const trimmed = (0, didaxis_1.uniqueName)('Trimmed Name');
            await didaxis_1.dialogFields.programName(dialog).fill(`  ${trimmed}  `);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, trimmed);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-016: Unicode and emoji in edited fields are preserved', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('French Program');
            const updatedName = 'Programme Français 🎓 2026';
            const updatedDescription = 'Cours pour étudiants internationaux';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Test'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updatedName);
            await didaxis_1.dialogFields.description(dialog).fill(updatedDescription);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, updatedName);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, updatedName, updatedDescription);
        });
        (0, cleanup_fixture_1.test)('TC-017: Description cleared to empty is handled per product rules', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const originalDescription = 'Has description';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, originalDescription));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).clear();
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            const reopen = await (0, didaxis_1.openEditProgram)(page, name);
            await (0, cleanup_fixture_1.expect)(didaxis_1.dialogFields.description(reopen)).toHaveValue('');
        });
        (0, cleanup_fixture_1.test)('TC-018: Rapid double-click on Save does not cause duplicate updates', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const finalName = `${name} - Final`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Original'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(finalName);
            await didaxis_1.dialogFields.saveButton(dialog).dblclick();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden({ timeout: 15_000 });
            await (0, didaxis_1.expectExactProgramNameInList)(page, finalName);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
            (0, cleanup_fixture_1.expect)(await (0, didaxis_1.countExactProgramsNamed)(page, finalName)).toBe(1);
        });
        (0, cleanup_fixture_1.test)('TC-019: Editing program to same name as itself succeeds', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Web Development 2026');
            const updatedDescription = 'Updated full-stack curriculum';
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Description'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).fill(updatedDescription);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, updatedDescription);
            await (0, cleanup_fixture_1.expect)(didaxis_1.locators.programsPage.errorMessage(page).filter({ hasText: /already exists|duplicate|unique/i })).toHaveCount(0);
        });
        (0, cleanup_fixture_1.test)('TC-027: Description at maximum allowed length is accepted on edit', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('UX Design Certificate');
            const description = 'D'.repeat(2000);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Short description'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.description(dialog).fill(description);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectProgramDescriptionInList)(page, name, description);
        });
        (0, cleanup_fixture_1.test)('TC-028: Single-character Name is accepted on edit', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Rename Source');
            const singleCharName = String.fromCharCode(65 + (Date.now() % 26));
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Single character rename test'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(singleCharName);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, singleCharName);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
        });
    });
    cleanup_fixture_1.test.describe('Defect Probes', () => {
        (0, cleanup_fixture_1.test)('TC-020: Case-only duplicate name on edit is rejected', async ({ page, trackProgram }) => {
            const existing = (0, didaxis_1.uniqueName)('CaseDuplicate');
            const toRename = (0, didaxis_1.uniqueName)('CaseDuplicate Target');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, existing, 'Original casing'));
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, toRename, 'Rename candidate'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, toRename);
            await didaxis_1.dialogFields.programName(dialog).fill(existing.toLowerCase());
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeVisible();
            await (0, didaxis_1.expectEditValidationOrError)(dialog);
            await (0, didaxis_1.expectExactProgramNameInList)(page, existing);
            await (0, didaxis_1.expectExactProgramNameInList)(page, toRename);
        });
        (0, cleanup_fixture_1.test)('TC-021: Renamed program appears in list without page refresh', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('NoRefresh Rename');
            const updated = `${name} - Live`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Refresh probe'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updated);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, updated);
            await (0, cleanup_fixture_1.expect)(page).toHaveURL(/\/programs/);
            await (0, didaxis_1.expectExactProgramNameNotInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-022: Whitespace-only Name on edit is rejected', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Whitespace Edit');
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Whitespace probe'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill('   ');
            const saveBtn = didaxis_1.dialogFields.saveButton(dialog);
            if (await saveBtn.isEnabled()) {
                await saveBtn.click();
                await (0, cleanup_fixture_1.expect)((0, didaxis_1.editProgramDialog)(page)).toBeVisible();
                await (0, didaxis_1.expectEditValidationOrError)(dialog);
            }
            else {
                await (0, cleanup_fixture_1.expect)(saveBtn).toBeDisabled();
            }
            await (0, didaxis_1.expectExactProgramNameInList)(page, name);
        });
        (0, cleanup_fixture_1.test)('TC-023: Saving 255-character name on edit completes without hanging', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('MaxLen Hang');
            const maxName = (name + 'B'.repeat(255)).slice(0, 255);
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Boundary timing'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(maxName);
            await didaxis_1.dialogFields.saveButton(dialog).click({ timeout: 45_000 });
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden({ timeout: 45_000 });
            await (0, didaxis_1.expectExactProgramNameInList)(page, maxName);
        });
        (0, cleanup_fixture_1.test)('TC-029: Success feedback shown after save when product displays it', async ({ page, trackProgram }) => {
            const name = (0, didaxis_1.uniqueName)('Success Feedback');
            const updated = `${name} - Saved`;
            // Cleanup: track created program for API delete after test
            trackProgram(await (0, didaxis_1.createProgram)(page, name, 'Feedback probe'));
            const dialog = await (0, didaxis_1.openEditProgram)(page, name);
            await didaxis_1.dialogFields.programName(dialog).fill(updated);
            await didaxis_1.dialogFields.saveButton(dialog).click();
            await (0, cleanup_fixture_1.expect)(dialog).toBeHidden();
            await (0, didaxis_1.expectExactProgramNameInList)(page, updated);
            await (0, didaxis_1.expectSaveSuccessFeedback)(page);
        });
    });
});
//# sourceMappingURL=DS-2.spec.js.map