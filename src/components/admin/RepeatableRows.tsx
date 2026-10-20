"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "./ui/Button";
import styles from "./RepeatableRows.module.css";

/** State for an editable list of rows (values, figures, links): each row
 *  gets a stable key so inputs keep focus while rows move. */
export function useRows<T extends object>(initial: T[]) {
  const [rows, setRows] = useState(() => initial.map((row, i) => ({ ...row, key: i })));
  const [nextKey, setNextKey] = useState(initial.length);

  return {
    rows,
    add(blank: T) {
      setRows((list) => [...list, { ...blank, key: nextKey }]);
      setNextKey((k) => k + 1);
    },
    update(key: number, patch: Partial<T>) {
      setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    },
    move(index: number, by: -1 | 1) {
      setRows((list) => {
        const next = [...list];
        [next[index], next[index + by]] = [next[index + by], next[index]];
        return next;
      });
    },
    remove(key: number) {
      setRows((list) => list.filter((row) => row.key !== key));
    },
  };
}

export function RowList({ children }: { children: ReactNode }) {
  return <ol className={styles.rows}>{children}</ol>;
}

/** One row: a small title with move and remove buttons, then its fields. */
export function RowItem({
  title,
  index,
  count,
  noun,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  noun: string;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <span className={styles.title}>{title}</span>
        <span className={styles.actions}>
          <Button variant="ghost" size="icon" aria-label={`Move ${noun} up`} onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Move ${noun} down`}
            onClick={() => onMove(1)}
            disabled={index === count - 1}
          >
            <ArrowDown size={16} aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Remove ${noun}`} onClick={onRemove}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </span>
      </div>
      {children}
    </li>
  );
}
