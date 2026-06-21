# AGENTS.md

## Local Run With Constructor

Run dashboard and constructor together for authenticated local testing:

```bash
# terminal 1, from this repo
NODE_OPTIONS=--no-experimental-webstorage npm run dev

# terminal 2, from ../bot-constructor-panel
NODE_OPTIONS=--no-experimental-webstorage DASHBOARD_URL=http://localhost:3010 ADMIN_PANEL=http://localhost:3010 MONO=1 npx next dev --port 3001
```

- Dashboard runs on `http://localhost:3010`.
- Constructor runs on `http://localhost:3001`.
- `.env.local` should keep `NEXT_PUBLIC_CONSTRUCTOR_URL=http://localhost:3001`.
- If constructor runs from a git worktree outside its repo, make sure that worktree has the same `.env` values as the main constructor checkout. A local symlink is fine: `ln -s /path/to/bot-constructor-panel/.env .env`.
- Keep `SESSION_SECRET` and `SESSION_COOKIE_NAME` the same in both apps. Current defaults are `dev-secret-change-me-please-32chars` and `bm_session`.
- On Node 25, use `NODE_OPTIONS=--no-experimental-webstorage`; otherwise SSR can fail with `localStorage.getItem is not a function`.
