/** Split managed copy near its middle, without leaving a preposition hanging. */
export function CampaignTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return <h1 className="fund-cover__title">{title}</h1>;
  const connectors = /^(?:в|во|на|и|с|со|к|ко|от|до|для|по|о|об|за|из|без|перед|после|—|–)$/i;
  const adjective = /(?:ого|его|ому|ему|ый|ий|ые|ая|ое|ую|ых|их)$/i;
  let split = 1;
  let best = Infinity;
  for (let index = 1; index < words.length; index++) {
    if (connectors.test(words[index - 1]) || adjective.test(words[index - 1])) continue;
    const difference = Math.abs(words.slice(0, index).join(" ").length - words.slice(index).join(" ").length);
    if (difference < best) { split = index; best = difference; }
  }
  return (
    <h1 className="fund-cover__title">
      <em>{words.slice(0, split).join(" ")}</em>{" "}
      <span>{words.slice(split).join(" ")}</span>
    </h1>
  );
}
