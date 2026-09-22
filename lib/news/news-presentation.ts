interface NewsText { title: string; content?: string; excerpt?: string }

const compact = (text: string) => text.replace(/\s+/g, " ").trim();
const withoutEllipsis = (text: string) => text.replace(/(?:…|\.{3})$/, "").trim();

/** Move a repeated opening into the heading without editing the CMS original. */
export function newsPresentation(article: NewsText): NewsText {
  let title = article.title.trim();
  let content = article.content?.trim() ?? "";
  const firstLine = content.split(/\r?\n/)[0].trim();
  const original = compact(content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\\([\\`*_[\]<>])/g, "$1"));
  const titlePrefix = withoutEllipsis(title);
  // Imported headings are sometimes cut in the middle of the opening paragraph.
  // Use its complete first sentence, never delete a partial sentence.
  if (titlePrefix !== title && compact(firstLine).startsWith(titlePrefix) && !/[\[\]\\]/.test(firstLine)) {
    const firstSentence = [...new Intl.Segmenter("ru", { granularity: "sentence" }).segment(firstLine)][0]?.segment.trim();
    if (firstSentence && firstSentence.length >= 12 && firstSentence.length <= 180) title = firstSentence;
  }
  if (compact(firstLine) === compact(title)) {
    content = content.slice(firstLine.length).trimStart();
  } else if (content.startsWith(title) && /[.!?…]$/.test(title) && /^\s/.test(content.slice(title.length))) {
    content = content.slice(title.length).trimStart();
  }
  const excerpt = article.excerpt?.trim();
  const excerptPrefix = excerpt ? withoutEllipsis(compact(excerpt)) : "";
  const redundantExcerpt = excerptPrefix && (original.startsWith(excerptPrefix) || compact(title) === excerptPrefix);
  return { title, content, excerpt: redundantExcerpt ? undefined : excerpt };
}
