"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, slugify } from "@/lib/db";
import { checkPassword, clearAdminCookie, requireAdmin, setAdminCookie } from "@/lib/auth";

export type FormState = { error?: string; ok?: boolean };

function readPostForm(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();
  const excerpt = String(form.get("excerpt") ?? "").trim();
  const slug = slugify(String(form.get("slug") ?? "").trim() || title);
  const published = form.get("published") === "on" ? 1 : 0;
  return { title, content, excerpt, slug, published };
}

function isUniqueError(e: unknown) {
  return e instanceof Error && /UNIQUE constraint failed/i.test(e.message);
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "Wrong password." };
  await setAdminCookie();
  redirect("/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/");
}

export async function createPost(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const p = readPostForm(form);
  if (!p.title || !p.content) return { error: "Title and content are required." };
  try {
    const c = await db();
    await c.execute({
      sql: "INSERT INTO posts (title, slug, excerpt, content, published) VALUES (?, ?, ?, ?, ?)",
      args: [p.title, p.slug, p.excerpt, p.content, p.published],
    });
  } catch (e) {
    if (isUniqueError(e)) return { error: `The slug "${p.slug}" is already used.` };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function updatePost(id: number, _: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const p = readPostForm(form);
  if (!p.title || !p.content) return { error: "Title and content are required." };
  try {
    const c = await db();
    await c.execute({
      sql: `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, published = ?,
            updated_at = datetime('now') WHERE id = ?`,
      args: [p.title, p.slug, p.excerpt, p.content, p.published, id],
    });
  } catch (e) {
    if (isUniqueError(e)) return { error: `The slug "${p.slug}" is already used.` };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deletePost(id: number) {
  await requireAdmin();
  const c = await db();
  await c.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [id] });
  revalidatePath("/", "layout");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestTopic(_: FormState, form: FormData): Promise<FormState> {
  // Hidden field that people never see; bots that fill it are silently ignored.
  if (String(form.get("website") ?? "")) return { ok: true };

  const topic = String(form.get("topic") ?? "").trim();
  const details = String(form.get("details") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  if (topic.length < 3) return { error: "Please tell me the topic you'd like a post on." };
  if (topic.length > 150 || details.length > 1500 || name.length > 80 || email.length > 120)
    return { error: "That's a bit long. Please shorten it." };
  if (email && !EMAIL_RE.test(email)) return { error: "That email doesn't look right." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = createHash("sha256").update(`agam-blog-ip:${ip}`).digest("hex").slice(0, 32);

  const c = await db();
  const { rows } = await c.execute({
    sql: "SELECT COUNT(*) AS n FROM topic_requests WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')",
    args: [ipHash],
  });
  if (Number(rows[0].n) >= 5) return { error: "Thanks! You've sent a few already, please try again later." };

  await c.execute({
    sql: "INSERT INTO topic_requests (topic, details, name, email, ip_hash) VALUES (?, ?, ?, ?, ?)",
    args: [topic, details, name, email, ipHash],
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function setTopicRequestStatus(id: number, status: "new" | "done") {
  await requireAdmin();
  const c = await db();
  await c.execute({ sql: "UPDATE topic_requests SET status = ? WHERE id = ?", args: [status, id] });
  revalidatePath("/admin");
}

export async function deleteTopicRequest(id: number) {
  await requireAdmin();
  const c = await db();
  await c.execute({ sql: "DELETE FROM topic_requests WHERE id = ?", args: [id] });
  revalidatePath("/admin");
}
