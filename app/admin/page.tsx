import Link from "next/link";
import { listPosts, listTopicRequests } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deletePost, deleteTopicRequest, logout, setTopicRequestStatus } from "../actions";
import { formatDate } from "../lib-format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [posts, requests] = await Promise.all([listPosts(true), listTopicRequests()]);
  const newCount = requests.filter((r) => r.status === "new").length;
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

      <h2 className="admin-section">
        Topic requests {newCount > 0 && <span className="badge">{newCount} new</span>}
      </h2>
      {requests.length === 0 ? (
        <p className="muted">No requests yet.</p>
      ) : (
        <ul className="request-list">
          {requests.map((r) => (
            <li key={r.id} className={`card${r.status === "done" ? " done" : ""}`}>
              <strong>{r.topic}</strong>
              {r.details && <p>{r.details}</p>}
              <p className="muted">
                {r.name || "Anonymous"}
                {r.email && <> · <a href={`mailto:${r.email}`}>{r.email}</a></>} · {formatDate(r.created_at)}
              </p>
              <div className="row">
                <form action={setTopicRequestStatus.bind(null, r.id, r.status === "done" ? "new" : "done")}>
                  <button className="link">{r.status === "done" ? "Mark as new" : "Mark as done"}</button>
                </form>
                <form action={deleteTopicRequest.bind(null, r.id)}>
                  <button className="link danger">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
