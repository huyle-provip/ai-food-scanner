"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "@/components/AuthForm.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // The email link lands here with a `?code=` (PKCE) that must be exchanged for
  // a temporary recovery session before the password can be updated.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const urlError = params.get("error_description") ?? params.get("error");

    void (async () => {
      const supabase = createClient();
      if (urlError) {
        setError(urlError);
      } else if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) setError(exErr.message);
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError("This reset link is invalid or has expired. Request a new one.");
        }
      }
      setReady(true);
      window.history.replaceState({}, "", "/reset-password");
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setNotice("Password updated. Redirecting to sign in...");
    await supabase.auth.signOut();
    setTimeout(() => router.replace("/login"), 1200);
  }

  if (!ready) {
    return (
      <div className={styles.container}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Choose a new password</h1>
        <input
          className={styles.input}
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className={styles.error}>{error}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}
        <button className={styles.button} type="submit" disabled={loading || !!notice}>
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
