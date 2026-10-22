# Test table and column management locally

Use Node.js 24 and two terminals. All schema changes below must target the local
Worker and its disposable D1 database. Do not deploy `wrangler.local.json`; its
placeholder database ID is for local development only.

From the repository root, install and build:

```sh
npm install --package-lock=false
npm --prefix frontend ci
npm --prefix frontend run build
```

The root manifest currently includes `create-vite`, but the committed lockfile
omits it. `--package-lock=false` leaves the lockfile unchanged; fixing that
existing inconsistency is a separate task.

In terminal 1, from the repository root:

```sh
npx wrangler dev --local --config wrangler.local.json --port 8787
```

In terminal 2, set the frontend API URL to the local Worker, then start Vite.
PowerShell on Windows:

```powershell
cd frontend
$env:VITE_API_URL = "http://127.0.0.1:8787"
npm run dev
```

Bash:

```sh
cd frontend
VITE_API_URL=http://127.0.0.1:8787 npm run dev
```

Open the address printed by Vite on your own computer. Confirm the browser's
Network panel shows API calls to port 8787, not the deployed Cloudflare Worker.
The production API remains the default when `VITE_API_URL` is unset. The variable
is read when Vite starts or builds; restart Vite after changing it.

## Manual acceptance checklist

1. Create a table named `review_items`, add `title` (TEXT) and `score` (INTEGER),
   and insert two records with different IDs and titles. Press Enter in the last
   input to save each new row.
2. Search for a title, the same title with different letter casing, a numeric
   value, and an absent value. Check the matching count and empty message. Clear
   search to restore all rows. Search matches substrings in all loaded columns.
3. Select the table and click its rename button. Try an empty, invalid, or
   duplicate name, then a valid new name. Verify rows survive. Canceling the form
   must leave the original name unchanged.
4. Choose `title` in the column selector, rename it, and check its values survive.
   Try renaming it to an existing column name; check the error. Column editing
   means renaming only; changing data types is outside this change.
5. Confirm `id` and other primary key columns are unavailable for rename/delete.
6. Delete the renamed column: first cancel the confirmation and verify values
   remain, then confirm and verify only that column is removed. SQLite may reject
   deletion of columns used by indexes or constraints; check the error appears
   and existing data is retained.
7. Delete a row: cancel first, then confirm. Check only the intended row disappears.
8. Delete the table: cancel first, then confirm. Verify the table disappears, the
   selected data clears, and schema controls disable until another table is selected.
9. Refresh the page, reselect a retained table, and confirm changes persist. Stop
   the backend and try an action; verify an error is shown rather than success.

## Automated checks

From the root:

```sh
npm test -- --run
npx tsc --noEmit
npm --prefix frontend run build
npm --prefix frontend run lint
```

Worker tests use an isolated local D1 binding and do not need a Cloudflare token,
production database, or the missing production Wrangler configuration. No test
contacts the deployed API. Authentication is unchanged by this feature; this PR
must not be interpreted as adding access control.
