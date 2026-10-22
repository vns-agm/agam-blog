import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/db";
import { updatePost } from "../../../actions";
import PostForm from "../../PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const post = Number.isInteger(id) ? await getPostById(id) : null;
  if (!post) notFound();
  return (
    <>
      <h1>Edit post</h1>
      <PostForm action={updatePost.bind(null, post.id)} post={post} submitLabel="Save changes" />
    </>
  );
}
