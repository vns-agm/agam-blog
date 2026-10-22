import { requireAdmin } from "@/lib/auth";
import { createPost } from "../../actions";
import PostForm from "../PostForm";

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <>
      <h1>New post</h1>
      <PostForm action={createPost} submitLabel="Publish" />
    </>
  );
}
