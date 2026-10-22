"use client";

import { useRef, useState } from "react";
import TopicRequestForm from "./TopicRequestForm";

export default function TopicRequestDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Bumped on each open so the form starts fresh after a previous submission.
  const [formKey, setFormKey] = useState(0);

  function open() {
    setFormKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" className="chip chip-accent" onClick={open} aria-haspopup="dialog">
        ✍️ Suggest a topic
      </button>
      <dialog
        ref={dialogRef}
        className="request-dialog"
        aria-labelledby="request-heading"
        onClick={(e) => {
          // Clicking the dimmed backdrop (outside the panel) closes the dialog.
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="request-panel">
          <button type="button" className="dialog-close" onClick={close} aria-label="Close">
            ×
          </button>
          <TopicRequestForm key={formKey} onClose={close} />
        </div>
      </dialog>
    </>
  );
}
