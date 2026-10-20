import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./RichText.module.css";

/** A block of text written in the admin with a small markup:
 *    ## Heading / ### Subheading
 *    - list item
 *    **bold** and [link text](/path, https://…, mailto:… or tel:…)
 *  Blank lines separate paragraphs. No HTML is ever rendered from it. */
export type RichBlock =
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";

export function parseRichText(source: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const ids = new Set<string>();
  let paragraph: string[] = [];
  let list: string[] = [];

  const endParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const endList = () => {
    if (list.length) blocks.push({ type: "ul", items: list });
    list = [];
  };

  for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const item = /^[-*]\s+(.+)$/.exec(line);

    if (!line) {
      endParagraph();
      endList();
    } else if (heading) {
      endParagraph();
      endList();
      // Unique ids, so the page's contents can link to each heading.
      let id = slugify(heading[2]);
      for (let n = 2; ids.has(id); n++) id = `${slugify(heading[2])}-${n}`;
      ids.add(id);
      blocks.push({ type: heading[1].length === 3 ? "h3" : "h2", text: heading[2], id });
    } else if (item) {
      endParagraph();
      list.push(item[1]);
    } else {
      endList();
      paragraph.push(line);
    }
  }
  endParagraph();
  endList();
  return blocks;
}

/** Only web, email, phone and on-site links. */
const safeHref = (href: string) => (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(href) ? href : null);

function inline(text: string): ReactNode[] {
  // Splitting on a capturing group puts the bold and link markup at odd
  // indices and plain text at even ones.
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/).map((part, i) => {
    if (i % 2 === 0) return part;
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const [, label, target] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part) ?? [];
    const href = target ? safeHref(target) : null;
    if (!label || !href) return part;
    if (href.startsWith("/")) {
      return (
        <Link key={i} href={href}>
          {label}
        </Link>
      );
    }
    const external = /^https?:/i.test(href);
    return (
      <a key={i} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {label}
      </a>
    );
  });
}

export function RichText({ blocks, className }: { blocks: RichBlock[]; className?: string }) {
  return (
    <div className={[styles.prose, className].filter(Boolean).join(" ")}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} id={block.id}>
                {inline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={block.id}>
                {inline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{inline(block.text)}</p>;
        }
      })}
    </div>
  );
}
