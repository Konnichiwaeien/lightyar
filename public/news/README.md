# News hero cutouts

The active hero uses five transparent restored cutouts in `people-cutouts-v2/`: handover, team-together, community-care, group-training and volunteer-walk. These are AI-assisted edits of the shelter's real photographs, not untouched documentary extractions. Backgrounds were removed, fine detail was reconstructed and small grass-obscured footwear/paw edges were completed. Source identity, clothing and poses were the editing constraints; generated detail should not be treated as additional factual evidence about the event.

Sources: matching JPEGs in `public/about/real/`, with provenance in that folder's README. Four scenes are from https://vk.com/wall-228082117_6869; handover is from https://vk.com/wall-228082117_7162. No personal names are inferred.

Version 2 was prepared with the built-in imagegen editing tool. Original generated PNGs are archived in the outer workspace at `design/news-people-v2/`, together with source dimensions and export sizes in metrics.json. WebP exports use quality 92 with alpha quality 100; Next Image uses the already configured quality 90. Original JPEGs remain unchanged. The gallery still stages two images initially and loads later scenes as it advances.

Scene selection: handover retains the man, bouquet and white dog; team-together retains the two foreground women and black dog; community-care retains the two nearest women and two dogs; group-training isolates the man petting the black dog on the right; volunteer-walk retains both women and the tan dog. Distant people and unrelated dogs were removed to keep scenes legible at hero size.

Visual checks include all five images against cream and amber plus hair, fur, shoe and paw details at 1:1. Previews and the repeatable export script are in `tmp/news-assets/prepare-v2.cjs`, `v2-background-check.png` and `v2-edges-1to1.png`. The versioned URL avoids serving cached older cutouts.

The earlier `people-cutouts/` rembg results, `people/` full-frame WebP files and hero-rescued-dog.webp are unused candidates. Their earlier mask scripts remain in `tmp/news-assets/` for provenance; they do not produce the active version 2 assets.
