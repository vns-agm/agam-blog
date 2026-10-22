"use client";

import { useActionState } from "react";
import { login } from "../../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="form narrow">
      <h1>Admin login</h1>
      {state.error && <p className="error">{state.error}</p>}
      <label>
        Password
        <input type="password" name="password" required autoFocus />
      </label>
      <button disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
