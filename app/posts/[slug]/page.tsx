import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPostBySlug } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { formatDate } from "../../lib-format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return { title: "Not found" };
  // Use the first image in the post (Markdown `![alt](src)`) as the link preview image.
  const image = post.content.match(/!\[[^\]]*\]\(([^)\s]+)\)/)?.[1];
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      siteName: "Agam's Blog",
      title: post.title,
      description: post.excerpt,
      url: `/posts/${post.slug}`,
      publishedTime: new Date(post.created_at.replace(" ", "T") + "Z").toISOString(),
      authors: ["Agam Srivastava"],
      images: image ? [image] : ["/images/agam.jpg"],
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: post.title, description: post.excerpt },
  };
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
