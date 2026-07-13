# Examples: Didaxis Bulk Program Cleanup

When to use bulk cleanup vs per-test cleanup.

## Bulk cleanup (this skill)

Use when the user explicitly wants **every** program removed from Didaxis Studio — for example, resetting a shared test environment before a demo.

**Dry run:**

```bash
node scripts/delete-all-programs.mjs
```

Example output:

```
Found 12 program(s)
  - a1b2c3d4-...  PW Test Program 2026-07-07
  - e5f6g7h8-...  Orphan Program
  ...

Dry run. Pass --confirm to delete all listed programs.
```

**After user confirms:**

```bash
node scripts/delete-all-programs.mjs --confirm
```

Example output:

```
Found 12 program(s)
  ...
Deleted a1b2c3d4-... (PW Test Program 2026-07-07)
...

Done: 12 deleted, 0 failed
```

## Per-test cleanup (playwright-test-cleanup)

Use inside Playwright specs so each test deletes only the programs it created.

```typescript
import { test, expect } from "../../fixtures/cleanup.fixture";

test("creates a program", async ({ page, trackProgram }) => {
  // capture UUID from POST /api/programs, then:
  trackProgram(programId);
});
```

Do **not** call `delete-all-programs.mjs --confirm` from test teardown — it would delete unrelated programs.

## Decision guide

| Scenario | Use |
|----------|-----|
| User says "delete all programs in Didaxis" | `didaxis-bulk-cleanup` |
| User says "clean up test data" (ambiguous) | Ask whether they mean **all** programs or just test-created ones |
| Writing or reviewing a Playwright spec | `playwright-test-cleanup` + `trackProgram` |
| Single test run finished | Fixture teardown only — no bulk script |

## .env credentials

```env
DIDAXIS_URL=https://test.didaxis.studio
DIDAXIS_API_TOKEN=your-bearer-token
```

Or email/password login:

```env
DIDAXIS_URL=https://test.didaxis.studio
DIDAXIS_EMAIL=your-email@example.com
DIDAXIS_PASSWORD=your-password
```

If auth fails, fix `.env` before retrying — do not hardcode tokens in the script or chat.