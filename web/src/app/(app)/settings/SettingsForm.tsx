"use client";

import { useState, useTransition } from "react";
import { updateDisplayName } from "@/lib/profile-actions";
import styles from "./page.module.css";

export function SettingsForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateDisplayName(name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Display name</span>
        <input
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <small className={styles.hint}>Shown in the app instead of your email.</small>
      </label>

      <label className={styles.field}>
        <span>Email</span>
        <input value={email} disabled />
        <small className={styles.hint}>Used to sign in. Contact support to change it.</small>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
