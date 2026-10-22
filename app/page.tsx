import Link from "next/link";
import { listPosts } from "@/lib/db";
import { formatDate } from "./lib-format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await listPosts();
  return (
    <>
      <section className="hero">
        <h1>Notes & writing</h1>
        <p>Thoughts on code, learning and everything in between.</p>
      </section>
      {posts.length === 0 ? (
        <p className="muted">No posts yet.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p) => (
            <li key={p.id} className="card">
              <Link href={`/posts/${p.slug}`}>
                <h2>{p.title}</h2>
              </Link>
              <time className="muted">{formatDate(p.created_at)}</time>
              {p.excerpt && <p>{p.excerpt}</p>}
              <Link href={`/posts/${p.slug}`} className="read-more">Read more →</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
