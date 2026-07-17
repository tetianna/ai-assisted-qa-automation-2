"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialogFields = exports.locators = void 0;
/** Role- and label-based locators mapped from the Didaxis accessibility tree (Playwright MCP). */
exports.locators = {
    login: {
        email: (page) => page.getByLabel('Email'),
        password: (page) => page.getByLabel('Password'),
        signInButton: (page) => page.getByRole('button', { name: 'Sign In' }),
        signInHeading: (page) => page.getByText('Sign in to your account'),
        dashboardHeading: (page) => page.getByRole('heading', { name: 'Dashboard' }),
        welcomeText: (page) => page.getByText('Welcome to Didaxis Studio'),
    },
    navigation: {
        bar: (page) => page.getByRole('navigation'),
        programsButton: (page) => page.getByRole('navigation').getByRole('button', { name: 'Programs' }),
        signOutButton: (page) => page.getByRole('button', { name: 'Sign out' }),
    },
    programsPage: {
        main: (page) => page.getByRole('main'),
        heading: (page) => page.getByRole('heading', { name: 'Programs', exact: true }),
        subtitle: (page) => page.getByText('Manage academic programs and semesters'),
        newProgramButton: (page) => page.getByRole('button', { name: '+ New Program' }),
        emptyState: (page) => page.getByText(/no programs yet|create your first program/i),
        table: (page) => page.getByRole('table'),
        programColumnHeader: (page) => page.getByRole('columnheader', { name: 'Program' }),
        dataRows: (page) => page.getByRole('table').getByRole('row'),
        searchBox: (page) => page.getByRole('searchbox'),
        errorMessage: (page) => page.getByRole('alert').or(page.getByRole('status')).or(page.getByText(/error|failed|unable|something went wrong/i)),
    },
    createProgramDialog: {
        dialog: (page) => page.getByRole('dialog', { name: 'New Program' }),
        heading: (page) => page.getByRole('dialog', { name: 'New Program' }).getByRole('heading', { name: 'New Program' }),
        programName: (page) => page.getByRole('dialog', { name: 'New Program' }).getByRole('textbox', { name: 'Program Name' }),
        description: (page) => page.getByRole('dialog', { name: 'New Program' }).getByRole('textbox', { name: 'Description' }),
        createButton: (page) => page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Create', exact: true }),
        cancelButton: (page) => page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Cancel' }),
    },
    editProgramDialog: {
        dialog: (page) => page.getByRole('dialog', { name: 'Edit Program' }),
        heading: (page) => page.getByRole('dialog', { name: 'Edit Program' }).getByRole('heading', { name: 'Edit Program' }),
        programName: (page) => page.getByRole('dialog', { name: 'Edit Program' }).getByRole('textbox', { name: 'Program Name' }),
        description: (page) => page.getByRole('dialog', { name: 'Edit Program' }).getByRole('textbox', { name: 'Description' }),
        saveButton: (page) => page.getByRole('dialog', { name: 'Edit Program' }).getByRole('button', { name: 'Save' }),
        cancelButton: (page) => page.getByRole('dialog', { name: 'Edit Program' }).getByRole('button', { name: 'Cancel' }),
    },
    programList: {
        row: (page, name) => page.getByRole('table').getByRole('row').filter({
            has: page.getByText(name, { exact: true }),
        }),
        editButton: (page, name) => page.getByRole('button', { name: `Edit ${name}`, exact: true }),
        deleteButton: (page, name) => page.getByRole('button', { name: `Delete ${name}`, exact: true }),
        programCell: (row) => row.getByRole('cell').first(),
        actionsCell: (row) => row.getByRole('cell').last(),
    },
    toast: {
        success: (page) => page
            .getByRole('alert')
            .filter({ hasText: /saved|success|updated/i })
            .or(page.getByText(/successfully saved|program updated|saved successfully/i)),
    },
};
/** Scoped field accessors when a dialog locator is already resolved. */
exports.dialogFields = {
    programName: (dialog) => dialog.getByRole('textbox', { name: 'Program Name' }),
    description: (dialog) => dialog.getByRole('textbox', { name: 'Description' }),
    createButton: (dialog) => dialog.getByRole('button', { name: 'Create', exact: true }),
    saveButton: (dialog) => dialog.getByRole('button', { name: 'Save' }),
    cancelButton: (dialog) => dialog.getByRole('button', { name: 'Cancel' }),
    closeButton: (dialog) => dialog
        .getByRole('button', { name: /close/i })
        .or(dialog.locator('header, [class*="Modal-header"], [class*="modal-header"]').getByRole('button').first()),
    aiConfigToggle: (dialog) => dialog.getByRole('button', { name: /AI Generation Config/i }),
    totalProgramHours: (dialog) => dialog.getByPlaceholder('e.g. 900'),
    defaultSessionHours: (dialog) => fieldInputNearLabel(dialog, 'Default Session Hours'),
    defaultExamHours: (dialog) => fieldInputNearLabel(dialog, 'Default Exam Hours'),
    targetAudience: (dialog) => dialog.getByPlaceholder('e.g. Career changers, no CS background'),
    focusAreas: (dialog) => dialog.getByPlaceholder('e.g. Python, SQL, Machine Learning, Data Visualization'),
};
function fieldInputNearLabel(dialog, label) {
    return dialog
        .getByText(label, { exact: true })
        .locator('xpath=ancestor::div[.//input][1]//input')
        .first();
}
//# sourceMappingURL=locators.js.map