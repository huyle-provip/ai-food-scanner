"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./AuthForm.module.css";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignIn = mode === "sign-in";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (isSignIn) {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (authError) return setError(authError.message);
      router.replace("/");
      router.refresh();
    } else {
      const { error: authError } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (authError) return setError(authError.message);
      setNotice("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>{isSignIn ? "Sign in" : "Create an account"}</h1>
        <input
          className={styles.input}
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignIn ? "Sign In" : "Sign Up"}
        </button>
        <p className={styles.switchRow}>
          {isSignIn ? "Need an account? " : "Have an account? "}
          <Link className={styles.switch} href={isSignIn ? "/signup" : "/login"}>
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </form>
    </div>
  );
}
