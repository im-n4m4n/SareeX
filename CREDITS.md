# Image credits

Every photograph shipped in `public/images/` is either supplied by the site
owner or sourced from a stock library whose licence permits commercial use
without attribution.

## Sourced from Pexels and Unsplash

Pexels Licence (https://www.pexels.com/license/) and the Unsplash Licence
(https://unsplash.com/license) both allow free use for commercial and
non-commercial purposes, with no attribution required. Attribution is given
here as a courtesy.

| File | Source |
|---|---|
| hero.jpg | supplied by the site owner (hero reference) |
| og-hero.jpg | crop of hero.jpg |
| m01, m02, m03, m04, m05, m06, m07, m09, m12, m13, silk-maroon | Pexels / Unsplash |
| bridal.jpg | Pexels |
| saree-editorial.jpg | Unsplash |
| jewellery-gold.jpg | Pexels |
| festive-diya.jpg | Pexels |
| m08, m10, m11, m14, m15, m16, silk-green, craft-loom | catalogue originals |

## Replacing these with your own photography

Drop a file over the same name in `public/images/` and nothing else needs to
change — the database stores image *paths*, so the catalogue picks the new file
up immediately. Keep portrait product shots at 3:4 and at least 1200px wide for
crisp cards, and update `src/db/seed-data.ts` if you also want fresh seeds to
use the new asset.

Originals of every replaced file are kept in `assets-backup/` (not served).
