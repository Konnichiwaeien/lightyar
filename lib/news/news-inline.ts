export interface NewsInlinePart { text: string; href?: string }

const unescape = (text: string) => text.replace(/\\([\\`*_[\]<>])/g, '$1');

/** Parse only the inline links used by the CMS. React renders all other text safely. */
export function parseNewsInline(text: string): NewsInlinePart[] {
  const pattern = /\\([\\`*_[\]<>])|\[((?:\\.|[^\]\\])+)\]\(([^)\s]+)\)/g;
  const parts: NewsInlinePart[] = [];
  let cursor = 0;
  const addText = (value: string) => {
    if (!value) return;
    const last = parts.at(-1);
    if (last && !last.href) last.text += value;
    else parts.push({ text: value });
  };
  for (const match of text.matchAll(pattern)) {
    addText(text.slice(cursor, match.index));
    if (match[1]) addText(match[1]);
    else {
      let safe = false;
      try {
        const url = new URL(match[3]);
        safe = /^https?:$/.test(url.protocol) && !url.username && !url.password;
      } catch { /* Invalid links remain literal text. */ }
      if (safe) parts.push({ text: unescape(match[2]), href: match[3] });
      else addText(unescape(match[0]));
    }
    cursor = match.index + match[0].length;
  }
  addText(text.slice(cursor));
  return parts;
}
