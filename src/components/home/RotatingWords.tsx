"use client";

import { useEffect, useState } from "react";
import styles from "./RotatingWords.module.css";

type RotatingWordsProps = {
  words: string[];
  intervalMs: number;
};

/** Cycles through `words` in place. Decorative: the parent provides the
 *  screen-reader text. */
export function RotatingWords({ words, intervalMs }: RotatingWordsProps) {
  const [{ current, prev }, setIndex] = useState({ current: 0, prev: -1 });

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((s) => ({ prev: s.current, current: (s.current + 1) % words.length }));
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return (
    <span className={styles.rotator} aria-hidden="true">
      {words.map((word, i) => (
        <span
          key={word}
          className={styles.word}
          data-state={i === current ? "active" : i === prev ? "leaving" : undefined}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
