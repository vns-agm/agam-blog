"use client";

import { useActionState, useRef } from "react";
import { requestTopic, type FormState } from "./actions";

const ideas = [
  "Balancing chess and a full-time engineering job",
  "Challenges I faced early in my career",
  "My dev setup and tools",
  "How I prepare for chess tournaments",
];

export default function TopicRequestForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestTopic, {});
  const topicRef = useRef<HTMLInputElement>(null);

  if (state.ok) {
    return (
      <div className="request" aria-live="polite">
        <h2 id="request-heading">Thanks for the idea! 🙌</h2>
        <p className="muted">I&apos;ve got your suggestion and will keep it in mind for an upcoming post.</p>
        <button type="button" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="request">
      <h2 id="request-heading">Want me to write about something?</h2>
      <p className="muted">
        Curious how I juggle chess and my professional life, a challenge I&apos;ve faced, or anything else? Suggest a
        topic and I&apos;ll try to cover it.
      </p>
      <div className="idea-chips" aria-label="Topic ideas">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            className="idea-chip"
            onClick={() => {
              if (topicRef.current) {
                topicRef.current.value = idea;
                topicRef.current.focus();
              }
            }}
          >
            {idea}
          </button>
        ))}
      </div>
      <form action={action} className="form">
        {state.error && <p className="error">{state.error}</p>}
        <label>
          Topic
          <input ref={topicRef} name="topic" required minLength={3} maxLength={150} placeholder="e.g. How do you manage chess with work?" />
        </label>
        <label>
          <span>Anything specific you&apos;d like covered? <span className="muted">(optional)</span></span>
          <textarea name="details" rows={4} maxLength={1500} />
        </label>
        <div className="form-row">
          <label>
            <span>Name <span className="muted">(optional)</span></span>
            <input name="name" maxLength={80} autoComplete="name" />
          </label>
          <label>
            <span>Email <span className="muted">(optional, if you&apos;d like a reply)</span></span>
            <input name="email" type="email" maxLength={120} autoComplete="email" />
          </label>
        </div>
        <label className="hp" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send suggestion"}</button>
      </form>
    </div>
  );
}
