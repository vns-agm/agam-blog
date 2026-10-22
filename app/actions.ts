"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, slugify } from "@/lib/db";
import { checkPassword, clearAdminCookie, requireAdmin, setAdminCookie } from "@/lib/auth";

export type FormState = { error?: string };

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
