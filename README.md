# Turso Blog

A personal blog built with **Next.js 16 (App Router)** and **Turso** (libSQL) as the database.

- Public post list and post pages (Markdown rendered with `marked`)
- Password-protected `/admin` to create, edit, draft and delete posts
- Table is created automatically on first request, with a welcome post

## Run locally

```bash
npm install
cp .env.example .env.local   # defaults to a local SQLite file
npm run dev
```

Open http://localhost:3000, and http://localhost:3000/admin (password = `ADMIN_PASSWORD`).

## Connect to Turso

```bash
brew install tursodatabase/tap/turso
turso auth signup              # or: turso auth login
turso db create turso-blog
turso db show turso-blog --url # -> TURSO_DATABASE_URL
turso db tokens create turso-blog # -> TURSO_AUTH_TOKEN
```

Put both values in `.env.local`, set a real `ADMIN_PASSWORD`, and restart `npm run dev`.

## Deploy (Vercel)

Import the repo in Vercel and add the three env vars `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_PASSWORD`.

## Structure

```
lib/db.ts        Turso client, schema, queries
lib/auth.ts      admin cookie auth
app/actions.ts   server actions (login, create/update/delete posts)
app/page.tsx     home – published posts
app/posts/[slug] single post
app/admin/*      admin dashboard, login, new/edit forms
```
