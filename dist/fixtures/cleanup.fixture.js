"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = exports.test = void 0;
exports.installProgramCreateTracker = installProgramCreateTracker;
const test_1 = require("@playwright/test");
Object.defineProperty(exports, "expect", { enumerable: true, get: function () { return test_1.expect; } });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
let cachedLoginToken = null;
function didaxisBaseUrl() {
    const url = process.env.DIDAXIS_URL || 'https://test.didaxis.studio';
    return url.replace(/\/$/, '');
}
function extractAuthToken(body) {
    const data = body.data;
    return (body.token ??
        data?.token ??
        data?.access_token ??
        body.accessToken ??
        body.access_token);
}
function extractProgramId(body) {
    const data = body.data;
    return data?.id ?? body.id;
}
async function getAuthToken() {
    const apiToken = process.env.DIDAXIS_API_TOKEN;
    if (apiToken)
        return apiToken;
    if (cachedLoginToken)
        return cachedLoginToken;
    const email = process.env.DIDAXIS_EMAIL;
    const password = process.env.DIDAXIS_PASSWORD;
    if (!email || !password) {
        throw new Error('Set DIDAXIS_API_TOKEN or DIDAXIS_EMAIL/DIDAXIS_PASSWORD in .env for program cleanup');
    }
    const baseUrl = didaxisBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        throw new Error(`Didaxis login failed for cleanup: HTTP ${res.status} ${await res.text()}`);
    }
    const body = (await res.json());
    const token = extractAuthToken(body);
    if (!token) {
        throw new Error('Didaxis login succeeded but no auth token was returned');
    }
    cachedLoginToken = token;
    return token;
}
async function deleteProgram(uuid, name) {
    const baseUrl = didaxisBaseUrl();
    const token = await getAuthToken();
    const res = await fetch(`${baseUrl}/api/programs/${uuid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        console.warn(`[cleanup] Failed to delete program ${name ?? uuid} (${uuid}): HTTP ${res.status} ${await res.text()}`);
        return false;
    }
    const label = name ?? uuid;
    console.log(`[cleanup] Program named "${label}" was deleted as part of trackProgram cleanup`);
    return true;
}
async function installProgramCreateTracker(page, trackProgram) {
    await page.route('**/api/programs', async (route) => {
        if (route.request().method() !== 'POST') {
            await route.continue();
            return;
        }
        const response = await route.fetch();
        let body = {};
        try {
            body = (await response.json());
        }
        catch {
            // Non-JSON response; still fulfill so the test can proceed.
        }
        const id = extractProgramId(body);
        if (id)
            trackProgram(id);
        await route.fulfill({ response });
    });
}
exports.test = test_1.test.extend({
    trackProgram: async ({}, use) => {
        const programIds = new Map();
        const trackProgram = (uuid, name) => {
            if (uuid)
                programIds.set(uuid, name);
        };
        await use(trackProgram);
        for (const [uuid, name] of programIds) {
            try {
                await deleteProgram(uuid, name);
            }
            catch (error) {
                console.warn(`[cleanup] Error deleting program ${name ?? uuid} (${uuid}):`, error);
            }
        }
    },
});
//# sourceMappingURL=cleanup.fixture.js.map