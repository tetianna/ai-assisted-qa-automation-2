"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';
async function gotoTodoApp(page) {
    await page.goto(TODO_URL);
}
function newTodoInput(page) {
    return page.getByPlaceholder('What needs to be done?');
}
function todoItems(page) {
    return page.locator('.todo-list li');
}
function todoCount(page) {
    return page.locator('.todo-count');
}
async function addTodo(page, text) {
    const input = newTodoInput(page);
    await input.fill(text);
    await input.press('Enter');
}
function todoItem(page, label, index = 0) {
    return todoItems(page)
        .filter({ has: page.locator('label', { hasText: label }) })
        .nth(index);
}
async function toggleTodo(page, label, index = 0) {
    await todoItem(page, label, index).locator('.toggle').click();
}
async function deleteTodo(page, label, index = 0) {
    const item = todoItem(page, label, index);
    await item.hover();
    await item.locator('.destroy').click();
}
function buildLongTodoText(length = 500) {
    const prefix = 'Plan quarterly roadmap:';
    const suffix = ' milestone review session.';
    let text = prefix;
    while (text.length + suffix.length <= length) {
        text += suffix;
    }
    return text.slice(0, length);
}
test_1.test.describe('TodoMVC — Positive flows', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await gotoTodoApp(page);
    });
    (0, test_1.test)('TC-001: single todo appears in the list after submission', async ({ page }) => {
        const input = newTodoInput(page);
        await input.click();
        await addTodo(page, 'Buy groceries');
        const item = todoItem(page, 'Buy groceries');
        await (0, test_1.expect)(item).toBeVisible();
        await (0, test_1.expect)(item.locator('.toggle')).not.toBeChecked();
        await (0, test_1.expect)(todoCount(page)).toHaveText('1 item left');
        await (0, test_1.expect)(input).toHaveValue('');
    });
    (0, test_1.test)('TC-002: multiple todos are retained in creation order', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await addTodo(page, 'Walk the dog');
        await addTodo(page, 'Pay electricity bill');
        await (0, test_1.expect)(todoItems(page)).toHaveText([
            'Buy groceries',
            'Walk the dog',
            'Pay electricity bill',
        ]);
        await (0, test_1.expect)(todoItems(page).locator('.toggle')).toHaveCount(3);
        for (const toggle of await todoItems(page).locator('.toggle').all()) {
            await (0, test_1.expect)(toggle).not.toBeChecked();
        }
        await (0, test_1.expect)(todoCount(page)).toHaveText('3 items left');
    });
    (0, test_1.test)('TC-003: todo is marked completed when the user toggles its checkbox', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await toggleTodo(page, 'Buy groceries');
        const item = todoItem(page, 'Buy groceries');
        await (0, test_1.expect)(item).toHaveClass(/completed/);
        await (0, test_1.expect)(item.locator('.toggle')).toBeChecked();
        await (0, test_1.expect)(todoCount(page)).toHaveText('0 items left');
        await (0, test_1.expect)(item.locator('label')).toHaveText('Buy groceries');
    });
    (0, test_1.test)('TC-004: completed todo returns to active state when toggled again', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await toggleTodo(page, 'Buy groceries');
        await toggleTodo(page, 'Buy groceries');
        const item = todoItem(page, 'Buy groceries');
        await (0, test_1.expect)(item).not.toHaveClass(/completed/);
        await (0, test_1.expect)(item.locator('.toggle')).not.toBeChecked();
        await (0, test_1.expect)(todoCount(page)).toHaveText('1 item left');
    });
    (0, test_1.test)('TC-005: todo is removed from the list when the user deletes it', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await addTodo(page, 'Walk the dog');
        await deleteTodo(page, 'Buy groceries');
        await (0, test_1.expect)(todoItem(page, 'Buy groceries')).toHaveCount(0);
        await (0, test_1.expect)(todoItem(page, 'Walk the dog')).toBeVisible();
        await (0, test_1.expect)(todoItem(page, 'Walk the dog')).not.toHaveClass(/completed/);
        await (0, test_1.expect)(todoCount(page)).toHaveText('1 item left');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(1);
    });
    (0, test_1.test)('TC-006: user can add, complete, and delete the same todo in one session', async ({ page, }) => {
        await addTodo(page, 'Schedule dentist appointment');
        await (0, test_1.expect)(todoCount(page)).toHaveText('1 item left');
        await toggleTodo(page, 'Schedule dentist appointment');
        await (0, test_1.expect)(todoItem(page, 'Schedule dentist appointment')).toHaveClass(/completed/);
        await (0, test_1.expect)(todoCount(page)).toHaveText('0 items left');
        await deleteTodo(page, 'Schedule dentist appointment');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
        await (0, test_1.expect)(page.locator('.todo-list')).toBeHidden();
        await (0, test_1.expect)(todoCount(page)).toBeHidden();
        await (0, test_1.expect)(newTodoInput(page)).toBeVisible();
    });
});
test_1.test.describe('TodoMVC — Negative flows', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await gotoTodoApp(page);
    });
    (0, test_1.test)('TC-007: empty submission does not create a todo', async ({ page }) => {
        await newTodoInput(page).click();
        await newTodoInput(page).press('Enter');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
        await (0, test_1.expect)(page.locator('.todo-list')).toBeHidden();
        await (0, test_1.expect)(todoCount(page)).toBeHidden();
    });
    (0, test_1.test)('TC-008: whitespace-only input does not create a todo', async ({ page }) => {
        const input = newTodoInput(page);
        await input.fill('   ');
        await input.press('Enter');
        await input.fill('\t');
        await input.press('Enter');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
        await (0, test_1.expect)(page.locator('.todo-list')).toBeHidden();
    });
    (0, test_1.test)('TC-009: deleting one item does not remove sibling todos', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await addTodo(page, 'Walk the dog');
        await addTodo(page, 'Pay electricity bill');
        await deleteTodo(page, 'Walk the dog');
        await (0, test_1.expect)(todoItem(page, 'Walk the dog')).toHaveCount(0);
        await (0, test_1.expect)(todoItem(page, 'Buy groceries')).toBeVisible();
        await (0, test_1.expect)(todoItem(page, 'Pay electricity bill')).toBeVisible();
        await (0, test_1.expect)(todoItem(page, 'Buy groceries')).not.toHaveClass(/completed/);
        await (0, test_1.expect)(todoItem(page, 'Pay electricity bill')).not.toHaveClass(/completed/);
        await (0, test_1.expect)(todoCount(page)).toHaveText('2 items left');
    });
    (0, test_1.test)('TC-010: completing a todo does not delete it from the list', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await toggleTodo(page, 'Buy groceries');
        const item = todoItem(page, 'Buy groceries');
        await (0, test_1.expect)(item).toBeVisible();
        await (0, test_1.expect)(item).toHaveClass(/completed/);
        await item.hover();
        await (0, test_1.expect)(item.locator('.destroy')).toBeVisible();
    });
    (0, test_1.test)('TC-011: Enter pressed outside the new-todo field does not add todos', async ({ page }) => {
        await page.locator('header h1').click();
        await page.keyboard.press('Enter');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
        await (0, test_1.expect)(page.locator('.todo-list')).toBeHidden();
    });
});
test_1.test.describe('TodoMVC — Edge cases', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await gotoTodoApp(page);
    });
    (0, test_1.test)('TC-012: todo text containing special characters is stored and displayed correctly', async ({ page, }) => {
        const text = 'Pay rent: $1,250.00 (due 6/30!)';
        await addTodo(page, text);
        const item = todoItem(page, text);
        await (0, test_1.expect)(item.locator('label')).toHaveText(text);
        await toggleTodo(page, text);
        await (0, test_1.expect)(item).toHaveClass(/completed/);
        await deleteTodo(page, text);
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
    });
    (0, test_1.test)('TC-013: duplicate todo titles are allowed as separate list entries', async ({ page }) => {
        await addTodo(page, 'Buy groceries');
        await addTodo(page, 'Buy groceries');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(2);
        await (0, test_1.expect)(todoCount(page)).toHaveText('2 items left');
        await toggleTodo(page, 'Buy groceries', 0);
        await (0, test_1.expect)(todoItem(page, 'Buy groceries', 0)).toHaveClass(/completed/);
        await (0, test_1.expect)(todoItem(page, 'Buy groceries', 1)).not.toHaveClass(/completed/);
        await (0, test_1.expect)(todoCount(page)).toHaveText('1 item left');
        await deleteTodo(page, 'Buy groceries', 1);
        await (0, test_1.expect)(todoItems(page)).toHaveCount(1);
        await (0, test_1.expect)(todoItem(page, 'Buy groceries', 0)).toHaveClass(/completed/);
    });
    (0, test_1.test)('TC-014: very long todo text is accepted and supports complete and delete', async ({ page, }) => {
        const longText = buildLongTodoText(500);
        await addTodo(page, longText);
        const item = todoItem(page, longText);
        await (0, test_1.expect)(item).toBeVisible();
        await (0, test_1.expect)(item.locator('label')).toHaveText(longText);
        await toggleTodo(page, longText);
        await (0, test_1.expect)(item).toHaveClass(/completed/);
        await deleteTodo(page, longText);
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
    });
    (0, test_1.test)('TC-015: single-character todo is valid', async ({ page }) => {
        await addTodo(page, 'A');
        const item = todoItem(page, 'A');
        await (0, test_1.expect)(item.locator('label')).toHaveText('A');
        await (0, test_1.expect)(todoCount(page)).toHaveText('1 item left');
        await toggleTodo(page, 'A');
        await (0, test_1.expect)(item).toHaveClass(/completed/);
        await deleteTodo(page, 'A');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
    });
    (0, test_1.test)('TC-016: unicode and emoji characters display correctly in todo labels', async ({ page, }) => {
        const text = '買い物 🛒 milk & パン';
        await addTodo(page, text);
        const item = todoItem(page, text);
        await (0, test_1.expect)(item.locator('label')).toHaveText(text);
        await toggleTodo(page, text);
        await (0, test_1.expect)(item).toHaveClass(/completed/);
        await deleteTodo(page, text);
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
    });
    (0, test_1.test)('TC-017: leading and trailing whitespace is trimmed on create', async ({ page }) => {
        await addTodo(page, '  Trim me  ');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(1);
        await (0, test_1.expect)(todoItem(page, 'Trim me')).toBeVisible();
        await (0, test_1.expect)(todoItem(page, 'Trim me').locator('label')).toHaveText('Trim me');
        await toggleTodo(page, 'Trim me');
        await deleteTodo(page, 'Trim me');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
    });
    (0, test_1.test)('TC-018: HTML-like input is shown as plain text, not executed', async ({ page }) => {
        page.on('dialog', (dialog) => {
            throw new Error(`Unexpected dialog: ${dialog.message()}`);
        });
        await addTodo(page, "<script>alert('xss')</script>");
        await addTodo(page, '<b>Bold todo</b>');
        await (0, test_1.expect)(todoItem(page, "<script>alert('xss')</script>")).toBeVisible();
        await (0, test_1.expect)(todoItem(page, '<b>Bold todo</b>')).toBeVisible();
        await (0, test_1.expect)(page.locator('.todo-list b')).toHaveCount(0);
    });
    (0, test_1.test)('TC-019: rapid sequential adds create distinct items without loss', async ({ page }) => {
        const tasks = ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'];
        for (const task of tasks) {
            await addTodo(page, task);
        }
        await (0, test_1.expect)(todoItems(page)).toHaveText(tasks);
        await (0, test_1.expect)(todoCount(page)).toHaveText('5 items left');
    });
    (0, test_1.test)('TC-020: delete last remaining todo returns app to initial empty state', async ({ page, }) => {
        await addTodo(page, 'Buy groceries');
        await deleteTodo(page, 'Buy groceries');
        await (0, test_1.expect)(todoItems(page)).toHaveCount(0);
        await (0, test_1.expect)(page.locator('.todo-list')).toBeHidden();
        await (0, test_1.expect)(page.locator('.filters')).toBeHidden();
        await (0, test_1.expect)(todoCount(page)).toBeHidden();
        await (0, test_1.expect)(newTodoInput(page)).toBeVisible();
    });
});
//# sourceMappingURL=block3.test.js.map