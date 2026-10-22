import { createClient, type Client } from "@libsql/client";

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: number;
  created_at: string;
  updated_at: string;
};

export type TopicRequest = {
  id: number;
  topic: string;
  details: string;
  name: string;
  email: string;
  status: "new" | "done";
  created_at: string;
};

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
  }
  return client;
}

async function ensureSchema(db: Client) {
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS topic_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        details TEXT NOT NULL DEFAULT '',
        name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        ip_hash TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_topic_requests_ip ON topic_requests(ip_hash, created_at)`,
    ],
    "write"
  );
  const existing = await db.execute(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'posts'"
  );
  if (existing.rows.length > 0) return;
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        published INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)`,
    ],
    "write"
  );
  // Seed a welcome post only when the table is first created.
  await db.execute({
    sql: "INSERT INTO posts (title, slug, excerpt, content) VALUES (?, ?, ?, ?)",
    args: [
      "Hello, Turso!",
      "hello-turso",
      "The first post on this blog, stored in a Turso (libSQL) database.",
      "# Hello, Turso!\n\nThis blog is built with **Next.js** and stores every post in **Turso**.\n\nHead to `/admin` to write your own posts. Content is written in Markdown.",
    ],
  });
}

export async function db(): Promise<Client> {
  const c = getClient();
  schemaReady ??= ensureSchema(c).catch((e) => {
    schemaReady = null;
    throw e;
  });
  await schemaReady;
  return c;
}

const toPost = (r: Record<string, unknown>) => r as unknown as Post;

export async function listPosts(includeDrafts = false): Promise<Post[]> {
  const c = await db();
  const { rows } = await c.execute(
    includeDrafts
      ? "SELECT * FROM posts ORDER BY created_at DESC, id DESC"
      : "SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC, id DESC"
  );
  return rows.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT * FROM posts WHERE slug = ?", args: [slug] });
  return rows[0] ? toPost(rows[0]) : null;
}

export async function getPostById(id: number): Promise<Post | null> {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT * FROM posts WHERE id = ?", args: [id] });
  return rows[0] ? toPost(rows[0]) : null;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "") || "post";
}

export async function listTopicRequests(): Promise<TopicRequest[]> {
  const c = await db();
  const { rows } = await c.execute(
    `SELECT id, topic, details, name, email, status, created_at FROM topic_requests
     ORDER BY status = 'done', created_at DESC, id DESC`
  );
  return rows as unknown as TopicRequest[];
}
