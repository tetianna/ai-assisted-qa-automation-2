import type { Locator, Page } from '@playwright/test';

/** Role- and label-based locators mapped from the Didaxis accessibility tree (Playwright MCP). */
export const locators = {
  login: {
    email: (page: Page) => page.getByLabel('Email'),
    password: (page: Page) => page.getByLabel('Password'),
    signInButton: (page: Page) => page.getByRole('button', { name: 'Sign In' }),
    signInHeading: (page: Page) => page.getByText('Sign in to your account'),
    dashboardHeading: (page: Page) => page.getByRole('heading', { name: 'Dashboard' }),
    welcomeText: (page: Page) => page.getByText('Welcome to Didaxis Studio'),
  },

  navigation: {
    bar: (page: Page) => page.getByRole('navigation'),
    programsButton: (page: Page) =>
      page.getByRole('navigation').getByRole('button', { name: 'Programs' }),
    signOutButton: (page: Page) => page.getByRole('button', { name: 'Sign out' }),
  },

  programsPage: {
    main: (page: Page) => page.getByRole('main'),
    heading: (page: Page) => page.getByRole('heading', { name: 'Programs', exact: true }),
    subtitle: (page: Page) => page.getByText('Manage academic programs and semesters'),
    newProgramButton: (page: Page) => page.getByRole('button', { name: '+ New Program' }),
    emptyState: (page: Page) => page.getByText(/no programs yet|create your first program/i),
    table: (page: Page) => page.getByRole('table'),
    programColumnHeader: (page: Page) => page.getByRole('columnheader', { name: 'Program' }),
    dataRows: (page: Page) => page.getByRole('table').getByRole('row'),
    searchBox: (page: Page) => page.getByRole('searchbox'),
    errorMessage: (page: Page) =>
      page.getByRole('alert').or(page.getByRole('status')).or(
        page.getByText(/error|failed|unable|something went wrong/i),
      ),
  },

  createProgramDialog: {
    dialog: (page: Page) => page.getByRole('dialog', { name: 'New Program' }),
    heading: (page: Page) =>
      page.getByRole('dialog', { name: 'New Program' }).getByRole('heading', { name: 'New Program' }),
    programName: (page: Page) =>
      page.getByRole('dialog', { name: 'New Program' }).getByRole('textbox', { name: 'Program Name' }),
    description: (page: Page) =>
      page.getByRole('dialog', { name: 'New Program' }).getByRole('textbox', { name: 'Description' }),
    createButton: (page: Page) =>
      page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Create', exact: true }),
    cancelButton: (page: Page) =>
      page.getByRole('dialog', { name: 'New Program' }).getByRole('button', { name: 'Cancel' }),
  },

  editProgramDialog: {
    dialog: (page: Page) => page.getByRole('dialog', { name: 'Edit Program' }),
    heading: (page: Page) =>
      page.getByRole('dialog', { name: 'Edit Program' }).getByRole('heading', { name: 'Edit Program' }),
    programName: (page: Page) =>
      page.getByRole('dialog', { name: 'Edit Program' }).getByRole('textbox', { name: 'Program Name' }),
    description: (page: Page) =>
      page.getByRole('dialog', { name: 'Edit Program' }).getByRole('textbox', { name: 'Description' }),
    saveButton: (page: Page) =>
      page.getByRole('dialog', { name: 'Edit Program' }).getByRole('button', { name: 'Save' }),
    cancelButton: (page: Page) =>
      page.getByRole('dialog', { name: 'Edit Program' }).getByRole('button', { name: 'Cancel' }),
  },

  programList: {
    row: (page: Page, name: string) =>
      page.getByRole('table').getByRole('row').filter({
        has: page.getByText(name, { exact: true }),
      }),
    editButton: (page: Page, name: string) =>
      page.getByRole('button', { name: `Edit ${name}`, exact: true }),
    deleteButton: (page: Page, name: string) =>
      page.getByRole('button', { name: `Delete ${name}`, exact: true }),
    programCell: (row: Locator) => row.getByRole('cell').first(),
    actionsCell: (row: Locator) => row.getByRole('cell').last(),
  },

  toast: {
    success: (page: Page) =>
      page
        .getByRole('alert')
        .filter({ hasText: /saved|success|updated/i })
        .or(page.getByText(/successfully saved|program updated|saved successfully/i)),
  },
};

/** Scoped field accessors when a dialog locator is already resolved. */
export const dialogFields = {
  programName: (dialog: Locator) => dialog.getByRole('textbox', { name: 'Program Name' }),
  description: (dialog: Locator) => dialog.getByRole('textbox', { name: 'Description' }),
  createButton: (dialog: Locator) => dialog.getByRole('button', { name: 'Create', exact: true }),
  saveButton: (dialog: Locator) => dialog.getByRole('button', { name: 'Save' }),
  cancelButton: (dialog: Locator) => dialog.getByRole('button', { name: 'Cancel' }),
  closeButton: (dialog: Locator) =>
    dialog
      .getByRole('button', { name: /close/i })
      .or(dialog.locator('header, [class*="Modal-header"], [class*="modal-header"]').getByRole('button').first()),
  aiConfigToggle: (dialog: Locator) =>
    dialog.getByRole('button', { name: /AI Generation Config/i }),
  totalProgramHours: (dialog: Locator) => dialog.getByPlaceholder('e.g. 900'),
  defaultSessionHours: (dialog: Locator) => fieldInputNearLabel(dialog, 'Default Session Hours'),
  defaultExamHours: (dialog: Locator) => fieldInputNearLabel(dialog, 'Default Exam Hours'),
  targetAudience: (dialog: Locator) => dialog.getByPlaceholder('e.g. Career changers, no CS background'),
  focusAreas: (dialog: Locator) =>
    dialog.getByPlaceholder('e.g. Python, SQL, Machine Learning, Data Visualization'),
};

function fieldInputNearLabel(dialog: Locator, label: string): Locator {
  return dialog
    .getByText(label, { exact: true })
    .locator('xpath=ancestor::div[.//input][1]//input')
    .first();
}
