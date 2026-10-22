import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPostBySlug } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { formatDate } from "../../lib-format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug);
  return { title: post ? post.title : "Not found" };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug);
  if (!post || (!post.published && !(await isAdmin()))) notFound();
  // Content is authored only by the admin, so rendering its Markdown as HTML is trusted.
  const html = await marked.parse(post.content);
  return (
    <article className="post">
      <Link href="/" className="muted">← All posts</Link>
      <h1>{post.title}</h1>
      <time className="muted">
        {formatDate(post.created_at)}
        {!post.published && " · Draft"}
      </time>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
