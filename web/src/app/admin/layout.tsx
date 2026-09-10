import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isCurrentUserAdmin } from "@/lib/profile";
import styles from "./layout.module.css";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // proxy.ts already bounces signed-out users to /login; this gates non-admins.
  if (!(await isCurrentUserAdmin())) redirect("/");

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <span className={styles.brand}>Recipe Admin</span>
          <Link href="/" className={styles.exit}>
            ← Back to site
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin">All recipes</Link>
          <Link href="/admin/new">+ New recipe</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
