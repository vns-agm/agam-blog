import Link from "next/link";
import { listPosts } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deletePost, logout } from "../actions";
import { formatDate } from "../lib-format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const posts = await listPosts(true);
  return (
    <>
      <div className="admin-bar">
        <h1>Admin</h1>
        <div className="row">
          <Link href="/admin/new" className="button">New post</Link>
          <form action={logout}><button className="secondary">Log out</button></form>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr><th>Title</th><th>Status</th><th>Created</th><th></th></tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td><Link href={`/posts/${p.slug}`}>{p.title}</Link></td>
              <td>{p.published ? "Published" : "Draft"}</td>
              <td>{formatDate(p.created_at)}</td>
              <td className="row">
                <Link href={`/admin/edit/${p.id}`}>Edit</Link>
                <form action={deletePost.bind(null, p.id)}>
                  <button className="link danger">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
