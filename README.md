# Dream Construction

Complete labour attendance and salary website, prepared for **GitHub → Cloudflare Workers + D1** deployment.

## Features
- Dream Construction logo and mobile-friendly interface.
- Admin login: workers, sites, attendance, payments and user management.
- Supervisor login: attendance and overtime only.
- Full days, half days, absences and overtime at ₹100/hour.
- Advances and salary payments with notes and editing.
- Monthly Excel export with attendance, wages, payments, and opening/closing balances.

## Deploy using GitHub

### 1. Create the database on Cloudflare

1. Sign in at https://dash.cloudflare.com/ and select your account.
2. Open **Storage & databases → D1 SQL Database** (or search the dashboard for D1).
3. Create a database named **dream-construction-db**.
4. Copy its **Database ID**. Keep it for step 3 below.
5. Copy your **Account ID** from the Cloudflare account overview.

Use a new empty database. This package contains the database schema, not the current live site's business records. Do not point migrations at an unrelated existing database.

### 2. Create a GitHub repository

1. Sign in at https://github.com/ and create a repository named `dream-construction`.
2. Extract this ZIP on your PC.
3. Upload the **contents** of the `dream-construction-cloudflare` folder to the repository root. Do not upload only the ZIP or put the project inside an extra nested folder.
4. Use `main` as the branch name.
5. Make sure `.github/workflows/deploy.yml`, `package.json`, `package-lock.json`, `wrangler.json`, `worker/` and `drizzle/` are present. Folders beginning with a dot can be hidden in file browsers; GitHub Desktop is an alternative for uploading the entire folder.

The first automatic deployment may fail until you add the settings below; that is expected.

### 3. Add Cloudflare credentials to GitHub

In Cloudflare, open **Account API tokens → Create Token** (or the API Tokens page for your profile). Use the **Edit Cloudflare Workers** template and add **Account → D1 → Edit** permission. Scope the token to your intended account. The workflow needs Workers Scripts edit access and D1 edit access. Keep any additional permissions required by the template for account/subdomain discovery.

In GitHub, open your repository → **Settings → Secrets and variables → Actions**.

Under **Secrets**, add:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |

Under **Variables**, add:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_D1_DATABASE_ID` | The Database ID from step 1 |

Do not paste API tokens into source files. No account credentials or tokens are supplied in this ZIP.

### 4. Publish

1. Open your GitHub repository's **Actions** tab.
2. Select **Deploy Dream Construction**.
3. Select **Run workflow → main → Run workflow**.
4. Wait for a green success result.
5. Open the **Publish website** step to find your actual URL, in the form `https://dream-construction.<your-subdomain>.workers.dev`.

The workflow installs dependencies, validates the app, applies only pending D1 migrations, and publishes the Worker. Future commits to `main` trigger deployment automatically.

If this is your first Worker, Cloudflare may ask you to choose a `workers.dev` subdomain in its Workers dashboard. Complete that setup and rerun the workflow.

This is a Workers application with a database. Use this included GitHub Actions workflow; a static file upload to Cloudflare Pages is not sufficient.

### 5. Sign in

The initial usernames are:

- Admin: `Dream@0186`
- Supervisor: `Dream@sup186`

Use the passwords you supplied earlier. Salted password hashes are included, not plaintext passwords. Initial accounts are inserted at the first login attempt. Admins can change passwords under **Users & roles**; password changes invalidate that account's existing sessions.

Monthly export: **Admin → Salary & payments → choose month → Export Excel**.

## Local development (optional)

Install Node.js 22 or newer. Open a terminal in the project folder:

```sh
npm ci
npm run db:local
npm run dev
```

Wrangler prints the local address. The local database is separate from production. Login uses Secure/HttpOnly cookies; if the browser rejects them over local HTTP, use `npm run dev -- --local-protocol https` and accept the local development certificate.

To deploy manually instead of GitHub Actions, replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.json` with the real ID, then run:

```sh
npx wrangler login
npm run build
npm run db:remote
npm run deploy
```

## Files

- `worker/index.js`: frontend, backend, authentication, Excel exporter and embedded logo.
- `assets/`: original company logo.
- `db/schema.ts`: database definitions.
- `drizzle/`: ordered SQL migrations and Drizzle metadata.
- `wrangler.json`: Cloudflare Worker and DB binding configuration.
- `.github/workflows/deploy.yml`: automatic GitHub deployment.
- `scripts/configure-cloudflare.mjs`: inserts your database ID during CI.
- `tests/`: role/login and monthly-export checks.

The deployment runs `tests/export.mjs` with synthetic test records in memory. It does not change your live database. `tests/roles.mjs` is a separate interactive test that reads test login credentials as JSON on stdin.

## Existing data and hosting

This creates a separate website in your Cloudflare account. The already-published ChatGPT Site is not moved or deleted. Its workers, attendance and payments are not copied automatically. This ZIP is the source project, not a live database backup.

Keep applied migration files unchanged. New schema changes should add new migration files. Cloudflare's free plan has request, CPU, database and storage limits; free lifetime hosting is not guaranteed.

## Official references

- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/d1/reference/migrations/
