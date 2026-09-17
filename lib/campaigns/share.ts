/** Share the canonical page, without local tab anchors or tracking parameters. */
export function campaignShareLinks(canonical: string, title: string) {
  const page = new URL(canonical);
  page.hash = "";
  page.search = "";
  const url = page.toString();
  return {
    url,
    vk: `https://vk.com/share.php?${new URLSearchParams({ url, title })}`,
    telegram: `https://t.me/share/url?${new URLSearchParams({ url, text: title })}`,
  };
}
