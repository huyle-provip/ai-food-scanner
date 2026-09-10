"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

/** Transient confirmation banner shown after a meal is saved or deleted. */
export function SavedNotice({ message }: { message: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    router.replace("/library"); // drop the ?saved / ?deleted query param
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [router]);

  if (!visible) return null;
  return <div className={styles.notice}>{message}</div>;
}
