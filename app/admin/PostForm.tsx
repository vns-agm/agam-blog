"use client";

import { useActionState } from "react";
import type { FormState } from "../actions";
import type { Post } from "@/lib/db";

type Props = {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  post?: Post;
  submitLabel: string;
};

export default function PostForm({ action, post, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="form">
      {state.error && <p className="error">{state.error}</p>}
      <label>
        Title
        <input name="title" defaultValue={post?.title} required />
      </label>
      <label>
        <span>Slug <span className="muted">(optional — generated from title)</span></span>
        <input name="slug" defaultValue={post?.slug} />
      </label>
      <label>
        Excerpt
        <input name="excerpt" defaultValue={post?.excerpt} />
      </label>
      <label>
        <span>Content <span className="muted">(Markdown)</span></span>
        <textarea name="content" rows={16} defaultValue={post?.content} required />
      </label>
      <label className="checkbox">
        <input type="checkbox" name="published" defaultChecked={post ? !!post.published : true} />
        Published
      </label>
      <button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
    </form>
  );
}
