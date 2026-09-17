import { Fragment } from "react";

/** CMS richtext is Markdown. Render its basic editorial blocks as React nodes,
 * never as raw HTML. Unrecognised markup stays plain text. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part.startsWith("*") && part.endsWith("*") ? <em key={index}>{part.slice(1, -1)}</em>
        : <Fragment key={index}>{part}</Fragment>,
  );
}

export function CampaignStory({ text }: { text: string }) {
  const blocks: { kind: "p" | "h3" | "ul" | "ol"; lines: string[] }[] = [];
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    const value = line.trim();
    if (!value) { if (blocks.at(-1)?.lines.length) blocks.push({ kind: "p", lines: [] }); continue; }
    const heading = value.match(/^#{1,6}\s+(.+)/);
    const bullet = value.match(/^[-*+]\s+(.+)/);
    const ordered = value.match(/^\d+[.)]\s+(.+)/);
    const kind = heading ? "h3" : bullet ? "ul" : ordered ? "ol" : "p";
    const content = heading?.[1] ?? bullet?.[1] ?? ordered?.[1] ?? value;
    if (blocks.at(-1)?.kind !== kind || kind === "h3") blocks.push({ kind, lines: [] });
    blocks.at(-1)!.lines.push(content);
  }
  return <>{blocks.filter(block => block.lines.length).map((block, index) => {
    if (block.kind === "ul" || block.kind === "ol") {
      const List = block.kind;
      return <List key={index}>{block.lines.map((line, i) => <li key={i}>{inline(line)}</li>)}</List>;
    }
    const Tag = block.kind;
    return <Tag key={index}>{block.lines.map((line, i) => <Fragment key={i}>{i > 0 && <br />}{inline(line)}</Fragment>)}</Tag>;
  })}</>;
}
