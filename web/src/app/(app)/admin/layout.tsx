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
      <div className={styles.bar}>
        <h1 className={styles.heading}>Recipe Admin</h1>
        <nav className={styles.nav}>
          <Link href="/admin">All recipes</Link>
          <Link href="/admin/new">+ New recipe</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
