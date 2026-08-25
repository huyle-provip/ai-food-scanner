import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/lib/actions";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          AI Food Scanner
        </Link>
        <nav className={styles.nav}>
          <Link href="/">My Dishes</Link>
          <Link href="/add">Add Manually</Link>
          <form action={signOut}>
            <button type="submit" className={styles.signOut}>
              Sign Out
            </button>
          </form>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
