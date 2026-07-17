"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialogFields = exports.locators = void 0;
exports.uniqueName = uniqueName;
exports.escapeRegex = escapeRegex;
exports.namePattern = namePattern;
exports.baseUrl = baseUrl;
exports.requireEnvCredentials = requireEnvCredentials;
exports.hasNonAdminCredentials = hasNonAdminCredentials;
exports.loginWithCredentials = loginWithCredentials;
exports.loginAsAdmin = loginAsAdmin;
exports.loginAsNonAdmin = loginAsNonAdmin;
exports.waitForProgramsPage = waitForProgramsPage;
exports.waitForProgramsTable = waitForProgramsTable;
exports.goToPrograms = goToPrograms;
exports.newProgramDialog = newProgramDialog;
exports.editProgramDialog = editProgramDialog;
exports.openNewProgramDialog = openNewProgramDialog;
exports.watchProgramCreates = watchProgramCreates;
exports.submitNewProgram = submitNewProgram;
exports.submitNewProgramDblClick = submitNewProgramDblClick;
exports.tryCaptureProgramCreate = tryCaptureProgramCreate;
exports.createProgram = createProgram;
exports.openEditProgram = openEditProgram;
exports.programRow = programRow;
exports.expectProgramInList = expectProgramInList;
exports.expectProgramDescriptionInList = expectProgramDescriptionInList;
exports.expectProgramNotInList = expectProgramNotInList;
exports.exactProgramNameCell = exactProgramNameCell;
exports.expectExactProgramNameInList = expectExactProgramNameInList;
exports.expectExactProgramNameNotInList = expectExactProgramNameNotInList;
exports.countExactProgramsNamed = countExactProgramsNamed;
exports.expectEditValidationOrError = expectEditValidationOrError;
exports.expectAiConfigFieldsVisible = expectAiConfigFieldsVisible;
exports.expectEditDiscarded = expectEditDiscarded;
exports.expectSaveSuccessFeedback = expectSaveSuccessFeedback;
exports.dismissEditProgramIfOpen = dismissEditProgramIfOpen;
exports.countProgramsNamed = countProgramsNamed;
exports.clickDeleteAndHandleDialog = clickDeleteAndHandleDialog;
exports.deleteProgram = deleteProgram;
exports.getProgramListNames = getProgramListNames;
const test_1 = require("@playwright/test");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const locators_1 = require("./locators");
Object.defineProperty(exports, "dialogFields", { enumerable: true, get: function () { return locators_1.dialogFields; } });
Object.defineProperty(exports, "locators", { enumerable: true, get: function () { return locators_1.locators; } });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
function uniqueName(base) {
    return `${base}-${Date.now()}`;
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function namePattern(name) {
    return new RegExp(escapeRegex(name));
}
function baseUrl() {
    const url = process.env.DIDAXIS_URL;
    if (!url)
        throw new Error('DIDAXIS_URL is not set in .env');
    return url.replace(/\/$/, '');
}
function requireEnvCredentials() {
    const email = process.env.DIDAXIS_EMAIL;
    const password = process.env.DIDAXIS_PASSWORD;
    if (!email || !password) {
        throw new Error('DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
    }
    return { email, password };
}
function hasNonAdminCredentials() {
    return !!(process.env.DIDAXIS_NON_ADMIN_EMAIL && process.env.DIDAXIS_NON_ADMIN_PASSWORD);
}
async function loginWithCredentials(page, email, password) {
    await page.goto(`${baseUrl()}/login`);
    await (0, test_1.expect)(locators_1.locators.login.signInHeading(page)).toBeVisible();
    await locators_1.locators.login.email(page).fill(email);
    await locators_1.locators.login.password(page).fill(password);
    await locators_1.locators.login.signInButton(page).click();
    await (0, test_1.expect)(locators_1.locators.login.dashboardHeading(page)).toBeVisible();
    await (0, test_1.expect)(locators_1.locators.login.welcomeText(page)).toBeVisible();
}
async function loginAsAdmin(page) {
    const { email, password } = requireEnvCredentials();
    await loginWithCredentials(page, email, password);
}
async function loginAsNonAdmin(page) {
    const email = process.env.DIDAXIS_NON_ADMIN_EMAIL;
    const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD;
    if (!email || !password) {
        throw new Error('DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD must be set in .env');
    }
    await loginWithCredentials(page, email, password);
}
async function waitForProgramsPage(page) {
    await (0, test_1.expect)(locators_1.locators.programsPage.heading(page)).toBeVisible();
    await (0, test_1.expect)(locators_1.locators.programsPage.subtitle(page)).toBeVisible();
    await (0, test_1.expect)(locators_1.locators.programsPage.table(page).or(locators_1.locators.programsPage.emptyState(page))).toBeVisible({ timeout: 15_000 });
    if (await locators_1.locators.programsPage.table(page).isVisible()) {
        await (0, test_1.expect)(locators_1.locators.programsPage.programColumnHeader(page)).toBeVisible();
    }
}
/** @deprecated Use waitForProgramsPage */
async function waitForProgramsTable(page) {
    await waitForProgramsPage(page);
}
async function goToPrograms(page) {
    await locators_1.locators.navigation.programsButton(page).click();
    await (0, test_1.expect)(page).toHaveURL(/\/programs/);
    await waitForProgramsPage(page);
}
function newProgramDialog(page) {
    return locators_1.locators.createProgramDialog.dialog(page);
}
function editProgramDialog(page) {
    return locators_1.locators.editProgramDialog.dialog(page);
}
async function openNewProgramDialog(page) {
    await locators_1.locators.programsPage.newProgramButton(page).click();
    const dialog = newProgramDialog(page);
    await (0, test_1.expect)(dialog).toBeVisible();
    await (0, test_1.expect)(locators_1.locators.createProgramDialog.heading(page)).toBeVisible();
    return dialog;
}
function extractProgramId(body) {
    if (!body || typeof body !== 'object')
        return undefined;
    const record = body;
    const data = record.data;
    return (data?.id ??
        data?.uuid ??
        record.id ??
        record.uuid);
}
function isProgramCreatePost(response) {
    if (response.request().method() !== 'POST')
        return false;
    try {
        return /\/programs\/?$/i.test(new URL(response.url()).pathname);
    }
    catch {
        return /\/programs/i.test(response.url());
    }
}
async function captureProgramCreate(page, action) {
    const responsePromise = page.waitForResponse(isProgramCreatePost, { timeout: 15_000 });
    await action();
    try {
        const response = await responsePromise;
        const body = await response.json();
        return extractProgramId(body);
    }
    catch {
        return undefined;
    }
}
async function watchProgramCreates(page, trackProgram) {
    await page.route('**/programs**', async (route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        const response = await route.fetch();
        const bodyBuffer = await response.body();
        let body = {};
        try {
            body = JSON.parse(bodyBuffer.toString());
        }
        catch {
            // Non-JSON response; still fulfill so the test can proceed.
        }
        const id = extractProgramId(body);
        if (id)
            trackProgram(id);
        await route.fulfill({
            status: response.status(),
            headers: response.headers(),
            body: bodyBuffer,
        });
    });
}
/** Submit the new-program dialog and return the created program UUID. */
async function submitNewProgram(page, dialog) {
    const programId = await captureProgramCreate(page, async () => {
        await locators_1.dialogFields.createButton(dialog).click();
    });
    if (!programId) {
        throw new Error('Program UUID not captured from POST /api/programs');
    }
    await (0, test_1.expect)(dialog).toBeHidden({ timeout: 15_000 });
    return programId;
}
/** Double-click Create and return UUID when a program is created. */
async function submitNewProgramDblClick(page, dialog) {
    const programId = await captureProgramCreate(page, async () => {
        await locators_1.dialogFields.createButton(dialog).dblclick();
    });
    await (0, test_1.expect)(dialog).toBeHidden({ timeout: 15_000 });
    return programId;
}
/** Run a create action and return UUID when POST succeeds (no throw if absent). */
async function tryCaptureProgramCreate(page, action) {
    return captureProgramCreate(page, action);
}
async function createProgram(page, name, description = '') {
    const programId = await captureProgramCreate(page, async () => {
        const dialog = await openNewProgramDialog(page);
        await locators_1.dialogFields.programName(dialog).fill(name);
        if (description) {
            await locators_1.dialogFields.description(dialog).fill(description);
        }
        await locators_1.dialogFields.createButton(dialog).click();
        await (0, test_1.expect)(dialog).toBeHidden({ timeout: 15_000 });
        await expectProgramInList(page, name);
    });
    if (!programId) {
        throw new Error('Program UUID not captured from POST /api/programs');
    }
    return programId;
}
async function openEditProgram(page, name) {
    await locators_1.locators.programList.editButton(page, name).click();
    const dialog = editProgramDialog(page);
    await (0, test_1.expect)(dialog).toBeVisible();
    await (0, test_1.expect)(locators_1.locators.editProgramDialog.heading(page)).toBeVisible();
    return dialog;
}
function programRow(page, name) {
    return locators_1.locators.programList.row(page, name);
}
async function expectProgramInList(page, name) {
    const row = programRow(page, name).first();
    await (0, test_1.expect)(row).toBeVisible();
    await (0, test_1.expect)(locators_1.locators.programList.programCell(row).getByText(name)).toBeVisible();
}
async function expectProgramDescriptionInList(page, name, description) {
    const row = programRow(page, name).first();
    await (0, test_1.expect)(row.getByText(description)).toBeVisible();
}
async function expectProgramNotInList(page, name) {
    await (0, test_1.expect)(programRow(page, name)).toHaveCount(0);
}
/** Program column cell with exact full name (avoids substring row-name false matches on rename). */
function exactProgramNameCell(page, name) {
    return locators_1.locators.programsPage.table(page).getByRole('cell').getByText(name, { exact: true });
}
async function expectExactProgramNameInList(page, name) {
    await (0, test_1.expect)(exactProgramNameCell(page, name)).toBeVisible();
}
async function expectExactProgramNameNotInList(page, name) {
    await (0, test_1.expect)(exactProgramNameCell(page, name)).toHaveCount(0);
}
async function countExactProgramsNamed(page, name) {
    return exactProgramNameCell(page, name).count();
}
/** Edit save blocked: dialog stays open and an inline or page-level error is shown. */
async function expectEditValidationOrError(dialog) {
    await (0, test_1.expect)(dialog).toBeVisible();
    const inlineError = dialog.getByText(/already exists|duplicate|unique|invalid|required|failed|too long|maximum/i);
    const pageError = locators_1.locators.programsPage.errorMessage(dialog.page());
    await (0, test_1.expect)(inlineError.or(pageError)).toBeVisible();
}
async function hasAiConfigSection(dialog) {
    if (await locators_1.dialogFields.aiConfigToggle(dialog).isVisible())
        return true;
    return locators_1.dialogFields.totalProgramHours(dialog).isVisible();
}
async function expandAiConfig(dialog) {
    const hoursField = locators_1.dialogFields.totalProgramHours(dialog);
    if (await hoursField.isVisible())
        return;
    const toggle = locators_1.dialogFields.aiConfigToggle(dialog);
    if (!(await toggle.isVisible()))
        return;
    await toggle.click();
    await (0, test_1.expect)(hoursField).toBeVisible({ timeout: 5_000 });
}
/**
 * When the edit form includes AI Generation Config, expand it and assert the fields are visible.
 * No-op if that section is not part of the current form (not required by DS-2 ACs).
 */
async function expectAiConfigFieldsVisible(dialog) {
    if (!(await hasAiConfigSection(dialog)))
        return;
    await expandAiConfig(dialog);
    await (0, test_1.expect)(locators_1.dialogFields.totalProgramHours(dialog)).toBeVisible();
    await (0, test_1.expect)(locators_1.dialogFields.defaultSessionHours(dialog)).toBeVisible();
    await (0, test_1.expect)(locators_1.dialogFields.defaultExamHours(dialog)).toBeVisible();
    await (0, test_1.expect)(locators_1.dialogFields.targetAudience(dialog)).toBeVisible();
    await (0, test_1.expect)(locators_1.dialogFields.focusAreas(dialog)).toBeVisible();
}
async function expectEditDiscarded(page, originalName, draftName, dismiss) {
    const dialog = await openEditProgram(page, originalName);
    await locators_1.dialogFields.programName(dialog).fill(draftName);
    await dismiss(dialog);
    await (0, test_1.expect)(dialog).toBeHidden();
    await expectExactProgramNameNotInList(page, draftName);
    await expectExactProgramNameInList(page, originalName);
    const reopen = await openEditProgram(page, originalName);
    await (0, test_1.expect)(locators_1.dialogFields.programName(reopen)).toHaveValue(originalName);
    await locators_1.dialogFields.cancelButton(reopen).click();
    await (0, test_1.expect)(reopen).toBeHidden();
}
/** Asserts success feedback when the product shows a toast or inline message after save. */
async function expectSaveSuccessFeedback(page) {
    const feedback = locators_1.locators.toast.success(page);
    if ((await feedback.count()) === 0)
        return;
    await (0, test_1.expect)(feedback.first()).toBeVisible();
}
async function dismissEditProgramIfOpen(page) {
    const dialog = editProgramDialog(page);
    if (await dialog.isVisible()) {
        await locators_1.dialogFields.cancelButton(dialog).click();
        await (0, test_1.expect)(dialog).toBeHidden();
    }
}
async function countProgramsNamed(page, name) {
    return programRow(page, name).count();
}
async function clickDeleteAndHandleDialog(page, name, action) {
    const row = programRow(page, name).first();
    await row.scrollIntoViewIfNeeded();
    let message = '';
    const dialogHandled = new Promise((resolve) => {
        page.once('dialog', async (dialog) => {
            message = dialog.message();
            if (action === 'accept') {
                await dialog.accept();
            }
            else {
                await dialog.dismiss();
            }
            resolve();
        });
    });
    await locators_1.locators.programList.deleteButton(page, name).click();
    await dialogHandled;
    return message;
}
async function deleteProgram(page, name) {
    await clickDeleteAndHandleDialog(page, name, 'accept');
    await expectProgramNotInList(page, name);
}
async function getProgramListNames(page) {
    const rows = locators_1.locators.programsPage
        .table(page)
        .getByRole('row')
        .filter({ has: page.getByRole('button', { name: /^Edit / }) });
    const count = await rows.count();
    const names = [];
    for (let i = 0; i < count; i += 1) {
        const cell = locators_1.locators.programList.programCell(rows.nth(i));
        const text = (await cell.textContent())?.trim();
        if (text)
            names.push(text.split('\n')[0]?.trim() ?? text);
    }
    return names;
}
//# sourceMappingURL=didaxis.js.map