import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/lib/actions";
import { isCurrentUserAdmin } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import styles from "./layout.module.css";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user ? await isCurrentUserAdmin() : false;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          AI Food Scanner
        </Link>
        <nav className={styles.nav}>
          <Link href="/">Discover</Link>
          {user ? <Link href="/library">Library</Link> : null}
          {isAdmin ? <Link href="/admin">Admin</Link> : null}
          {user ? (
            <form action={signOut}>
              <button type="submit" className={styles.signOut}>
                Sign Out
              </button>
            </form>
          ) : (
            <Link href="/login">Sign In</Link>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
