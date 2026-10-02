import type { products } from "./schema";

type SeedProduct = typeof products.$inferInsert;
const image = (name: string) => `/images/${name}.jpg`;
const colors = {
  ruby: { name: "Ruby", hex: "#9B1B30" },
  maroon: { name: "Maroon", hex: "#6B1E2A" },
  emerald: { name: "Emerald", hex: "#0F5132" },
  ivory: { name: "Ivory", hex: "#F1E7D3" },
  blush: { name: "Blush", hex: "#E8B4B8" },
  indigo: { name: "Indigo", hex: "#1F2A44" },
  gold: { name: "Gold", hex: "#C9A24B" },
  noir: { name: "Noir", hex: "#1C1512" },
};

export const extraCategories = [
  { slug: "dupattas", name: "Dupattas", description: "A little more poetry. Handwoven silk, zari borders, and heirloom drapes.", image: image("dupatta-edit") },
  { slug: "blouses", name: "Blouses", description: "The finishing touch. Brocade blouses, cut and finished with care.", image: image("blouse-edit") },
  { slug: "kurta-sets", name: "Kurta Sets", description: "Unhurried elegance in handloom Chanderi and silk cotton.", image: image("kurta-edit") },
  { slug: "shawls-stoles", name: "Shawls & Stoles", description: "Wrap yourself in the warmth of Kashmiri needlework.", image: image("shawl-edit") },
];

export const extraCollections = [
  { slug: "bridal-vows", name: "The Bridal Vows", description: "For the beginning of forever. Ruby silks, luminous zari, and wedding heirlooms.", image: image("bridal"), featured: true },
  { slug: "temple-gold", name: "Temple & Gold", description: "From Kanchipuram, with devotion. Temple borders and the glow of pure silk.", image: image("m05"), featured: true },
  { slug: "moonlit-drapes", name: "Moonlit Drapes", description: "A little after-dark magic. Fluid georgettes and jewel-toned silks.", image: image("m10"), featured: true },
  { slug: "garden-of-blooms", name: "Garden of Blooms", description: "Petal-soft Chanderi, airy organza, and florals made for slow mornings.", image: image("m06"), featured: true },
  { slug: "indigo-stories", name: "Indigo Stories", description: "A love letter to blue. Ikat geometry and Kashmiri paisley in midnight hues.", image: image("m04"), featured: true },
  { slug: "everyday-poetry", name: "Everyday Poetry", description: "Because ordinary days deserve beautiful things. Easy cottons and considered sets.", image: image("kurta-edit"), featured: false },
];

const product = (p: SeedProduct): SeedProduct => ({
  category: "sarees",
  tagline: "Handloom heritage · Hand-finished",
  care: "Dry clean only. Store in a breathable muslin wrap.",
  stock: 12,
  rating: 4.8,
  reviewCount: 0,
  isNew: true,
  ...p,
});

export const extraProducts: SeedProduct[] = [
  product({
    slug: "sindoor-bridal-katan-saree", name: "Sindoor Bridal Katan Saree", price: 31500, compareAtPrice: 36000,
    weave: "banarasi", fabric: "Katan Silk", occasion: "wedding", collection: "bridal-vows",
    tagline: "Ruby silk · A vow in gold", work: "Kadhua zari floral jaal", badge: "Bridal Edit", featured: true, stock: 6,
    description: "A bridal drape in deep ruby katan silk, with gold floral jaal across the body and a generous brocade pallu. Made for a day you will remember forever.",
    story: "This design draws on the floral jaal patterns of Varanasi. Individual motifs are woven with separate shuttles in the traditional kadhua technique.",
    colors: [colors.ruby, colors.maroon], images: [image("bridal"), image("silk-maroon")],
  }),
  product({
    slug: "noor-ivory-chanderi-saree", name: "Noor Ivory Chanderi Saree", price: 16800,
    weave: "chanderi", fabric: "Silk Cotton", occasion: "wedding", collection: "bridal-vows",
    tagline: "An ivory wedding · Woven light", work: "Gold zari butis and border", stock: 8,
    description: "Soft ivory silk cotton with luminous zari butis and a delicate gold border. An understated choice for an intimate wedding or civil ceremony.",
    story: "The sheer texture of Chanderi comes from the balance of silk and fine cotton yarns, an enduring craft from Madhya Pradesh.",
    colors: [colors.ivory], images: [image("m13"), image("craft-loom")],
  }),
  product({
    slug: "anaar-brocade-bridal-lehenga", name: "Anaar Brocade Bridal Lehenga", price: 58500,
    category: "lehengas", weave: "banarasi", fabric: "Brocade Silk", occasion: "wedding", collection: "bridal-vows",
    tagline: "Three pieces · One unforgettable moment", work: "Zari brocade and hand finishing", blouse: "Stitched to measure", length: "Lehenga, blouse, and dupatta", stock: 4, badge: "Made to Measure",
    description: "A ruby brocade lehenga, fitted blouse, and zari-edged dupatta. Hand-finished and made to your measurements; allow 4–6 weeks for dispatch.",
    story: "Cut from brocade panels that preserve the continuity of the woven motif, then carefully finished in the atelier.",
    colors: [colors.ruby], images: [image("m03"), image("silk-maroon")],
  }),
  product({
    slug: "gopuram-emerald-kanjivaram-saree", name: "Gopuram Emerald Kanjivaram", price: 27900,
    weave: "kanjivaram", fabric: "Mulberry Silk", occasion: "festive", collection: "temple-gold",
    tagline: "Emerald silk · Temple devotion", work: "Korvai temple border", badge: "Collector's Edit", featured: true,
    description: "Emerald mulberry silk with a temple-inspired contrast border and gold butis. A rich, structured drape for festive celebrations.",
    story: "The gopuram motif echoes the architecture of South Indian temple towers. The contrast border is interlocked using the korvai technique.",
    colors: [colors.emerald, colors.maroon], images: [image("m05"), image("silk-green")],
  }),
  product({
    slug: "mayil-peacock-kanjivaram-saree", name: "Mayil Peacock Kanjivaram", price: 32800,
    weave: "kanjivaram", fabric: "Mulberry Silk", occasion: "wedding", collection: "temple-gold",
    tagline: "Mayura motifs · Jewel-toned silk", work: "Peacock zari butta", stock: 7,
    description: "Peacock-blue silk with a broad gold border and mayura-inspired motifs. A South Indian classic with an expressive, luminous pallu.",
    story: "Peacock motifs are a recurring language in the silk-weaving traditions of Kanchipuram, linking the loom to temple art.",
    colors: [colors.indigo, colors.emerald], images: [image("m04"), image("silk-green")],
  }),
  product({
    slug: "meenakshi-marigold-kanjivaram", name: "Meenakshi Marigold Kanjivaram", price: 23800,
    weave: "kanjivaram", fabric: "Mulberry Silk", occasion: "festive", collection: "temple-gold",
    tagline: "Marigold warmth · Antique zari", work: "Woven zari temple border",
    description: "A warm marigold silk saree with antique-gold zari, created for haldi celebrations and festive mornings.",
    story: "The warmth of marigold is paired with traditional temple-border geometry, a favourite combination across generations.",
    colors: [colors.gold], images: [image("m08"), image("m07")],
  }),
  product({
    slug: "chandni-midnight-georgette-saree", name: "Chandni Midnight Georgette", price: 13800,
    weave: "georgette", fabric: "Georgette", occasion: "evening", collection: "moonlit-drapes",
    tagline: "After-dark elegance · A liquid drape", work: "Antique-gold zari edge", featured: true,
    description: "Midnight georgette, a fluid pallu, and a quiet gold border. An elegant drape for receptions and after-dark gatherings.",
    story: "Contemporary fluid fabric meets a traditional woven edge, bringing the heritage border into a lighter silhouette.",
    colors: [colors.noir, colors.indigo], images: [image("m10"), image("m09")],
  }),
  product({
    slug: "mehfil-wine-crepe-silk-saree", name: "Mehfil Wine Crepe Silk", price: 18500,
    weave: "mysore", fabric: "Crepe Silk", occasion: "evening", collection: "moonlit-drapes",
    tagline: "Dinner-hour silk · A subtle sheen", work: "Slim woven zari border",
    description: "Wine crepe silk that catches the light with every step, edged in a slim line of zari. Pair with a brocade blouse for evening.",
    story: "Crepe yarns lend this silk a softly textured surface and a wonderfully fluid fall.",
    colors: [colors.maroon], images: [image("m09"), image("silk-maroon")],
  }),
  product({
    slug: "gulmohar-floral-organza-saree", name: "Gulmohar Floral Organza", price: 12400,
    weave: "organza", fabric: "Organza", occasion: "day", collection: "garden-of-blooms",
    tagline: "Petal-soft · Garden-party grace", work: "Floral hand embroidery", featured: true,
    description: "A softly embroidered organza drape with floral details and an airy pallu, made for garden weddings and sunlit celebrations.",
    story: "Petals and winding stems are interpreted in fine needlework along the edge of a sheer organza drape.",
    colors: [colors.blush, colors.ivory], images: [image("m15"), image("m06")],
  }),
  product({
    slug: "gulaab-blush-chanderi-saree", name: "Gulaab Blush Chanderi", price: 7800,
    weave: "chanderi", fabric: "Silk Cotton", occasion: "day", collection: "garden-of-blooms",
    tagline: "Blush pink · Woven air", work: "Fine zari butis",
    description: "Blush-pink Chanderi silk cotton with scattered zari butis. Easy to wear, light to carry, and quietly festive.",
    story: "A celebration of Chanderi's almost transparent silk-cotton texture, often described as woven air.",
    colors: [colors.blush], images: [image("m06"), image("m12")],
  }),
  product({
    slug: "neel-indigo-ikat-saree", name: "Neel Indigo Ikat Saree", price: 21900,
    weave: "patola", fabric: "Pure Silk", occasion: "evening", collection: "indigo-stories",
    tagline: "Indigo geometry · Thread by thread", work: "Ikat-inspired geometric weaving", badge: "Indigo Edit",
    description: "A deep-blue silk saree with geometric motifs inspired by the ikat traditions of Gujarat. Refined colour, expressive pattern, and a soft gold edge.",
    story: "Ikat is a language of pattern created through yarn preparation and the careful alignment of threads at the loom.",
    colors: [colors.indigo], images: [image("m04"), image("m16")],
  }),
  product({
    slug: "sanganer-everyday-handloom-cotton", name: "Sanganer Everyday Cotton", price: 3490,
    weave: "cotton", fabric: "Handloom Cotton", occasion: "casual", collection: "everyday-poetry",
    tagline: "Easy mornings · Handloom comfort", work: "Block-print floral details", care: "Gentle hand wash in cold water. Dry in shade.", stock: 30,
    description: "Breathable handloom cotton with charming floral details. For workdays, café afternoons, and moments that need no occasion.",
    story: "The simplicity of a cotton drape lets the rhythm of the handloom and the character of hand printing speak.",
    colors: [colors.ivory, colors.blush], images: [image("m11"), image("m13")],
  }),
  product({
    slug: "vasant-ivory-chanderi-kurta-set", name: "Vasant Ivory Chanderi Set", price: 11800,
    category: "kurta-sets", weave: "chanderi", fabric: "Silk Cotton", occasion: "day", collection: "garden-of-blooms",
    tagline: "Kurta, trousers & dupatta · Softly festive", work: "Woven zari butis", blouse: "Not applicable", length: "Three-piece kurta set", featured: true, badge: "New Category",
    description: "An ivory Chanderi kurta with matching trousers and a sheer blush dupatta. A light, polished three-piece set for intimate celebrations.",
    story: "Fine silk cotton keeps the silhouette airy while woven gold butis bring a touch of handloom occasionwear.",
    colors: [colors.ivory], images: [image("kurta-edit"), image("craft-loom")],
  }),
  product({
    slug: "savera-handloom-kurta-set", name: "Savera Handloom Kurta Set", price: 8600,
    category: "kurta-sets", weave: "cotton", fabric: "Cotton Silk", occasion: "casual", collection: "everyday-poetry",
    tagline: "Thoughtful essentials · Three-piece set", work: "Woven butis and hand-finished seams", blouse: "Not applicable", length: "Kurta, trousers, and dupatta",
    description: "An easy ivory kurta set with a soft dupatta and straight trousers. Considered essentials for everyday elegance.",
    story: "Traditional woven motifs find a home in an everyday silhouette, cut for movement and comfort.",
    colors: [colors.ivory], images: [image("kurta-edit"), image("m13")],
  }),
  product({
    slug: "shahi-maroon-banarasi-dupatta", name: "Shahi Banarasi Silk Dupatta", price: 6900,
    category: "dupattas", weave: "banarasi", fabric: "Katan Silk", occasion: "wedding", collection: "bridal-vows",
    tagline: "Maroon silk · A regal finishing touch", work: "Gold zari butis and brocade border", blouse: "Not applicable", length: "2.4 m × 0.9 m", featured: true, badge: "Handwoven",
    description: "A maroon Banarasi silk dupatta with gold butis and a generous brocade border. Drape over ivory, layer with a lehenga, or treasure as a gift.",
    story: "A smaller canvas for the intricacy of Banarasi weaving, carrying the same timeless floral border language.",
    colors: [colors.maroon], images: [image("dupatta-edit"), image("silk-maroon")],
  }),
  product({
    slug: "gulnaar-zari-silk-dupatta", name: "Gulnaar Zari Silk Dupatta", price: 8900,
    category: "dupattas", weave: "banarasi", fabric: "Pure Silk", occasion: "festive", collection: "heirloom-edit",
    tagline: "A legacy in miniature · Gold brocade", work: "Brocade zari border", blouse: "Not applicable", length: "2.5 m × 0.9 m",
    description: "A richly textured silk dupatta in maroon and gold, designed to bring an heirloom accent to the simplest outfit.",
    story: "Traditional butis and an ornate border make this a versatile piece of woven heritage.",
    colors: [colors.maroon, colors.gold], images: [image("dupatta-edit"), image("silk-maroon")],
  }),
  product({
    slug: "maharani-emerald-brocade-blouse", name: "Maharani Emerald Brocade Blouse", price: 5400,
    category: "blouses", weave: "banarasi", fabric: "Brocade Silk", occasion: "festive", collection: "temple-gold",
    tagline: "Emerald brocade · Made to measure", work: "Gold butis, silk piping", blouse: "Stitched to measure", length: "Blouse length: 14–16 inches", badge: "Made to Measure",
    description: "An emerald brocade blouse with delicate gold butis, a boat neckline, and clean silk piping. Made to your measurements in the atelier.",
    story: "A traditional woven brocade is carefully cut so its butis remain balanced across the finished blouse.",
    colors: [colors.emerald], images: [image("blouse-edit"), image("silk-green")],
  }),
  product({
    slug: "royal-zari-brocade-blouse", name: "Royal Zari Brocade Blouse", price: 6200,
    category: "blouses", weave: "banarasi", fabric: "Brocade Silk", occasion: "wedding", collection: "heirloom-edit",
    tagline: "The final detail · Couture finishing", work: "Woven butis and gold edging", blouse: "Stitched to measure", length: "Made-to-measure blouse",
    description: "A classic emerald blouse in woven brocade, finished with delicate gold edging and a refined fitted silhouette.",
    story: "The blouse completes the drape: a small, beautifully finished canvas for traditional zari work.",
    colors: [colors.emerald], images: [image("blouse-edit"), image("craft-loom")],
  }),
  product({
    slug: "neelam-sozni-pashmina-shawl", name: "Neelam Sozni Pashmina Shawl", price: 24500,
    category: "shawls-stoles", weave: "kashmiri", fabric: "Fine Wool", occasion: "evening", collection: "indigo-stories",
    tagline: "Kashmiri paisley · Indigo warmth", work: "Sozni-inspired needle embroidery", blouse: "Not applicable", length: "2 m × 1 m", featured: true, stock: 6, badge: "Winter Heirloom",
    description: "An indigo fine-wool shawl with ornate paisley borders in antique-gold and terracotta tones. A warm companion for winter celebrations.",
    story: "The boteh paisley and delicate needlework draw on the long textile traditions of the Kashmir valley.",
    colors: [colors.indigo], images: [image("shawl-edit"), image("m04")],
  }),
  product({
    slug: "kashmir-midnight-paisley-stole", name: "Kashmir Midnight Paisley Stole", price: 12800,
    category: "shawls-stoles", weave: "kashmiri", fabric: "Fine Wool", occasion: "evening", collection: "moonlit-drapes",
    tagline: "A midnight wrap · A timeless gift", work: "Paisley embroidered border", blouse: "Not applicable", length: "1.9 m × 0.7 m", stock: 10,
    description: "A refined indigo stole with paisley needlework along the border, made for cool evenings and thoughtful gifting.",
    story: "Kashmiri embroidery tells its stories in miniature, with vines and boteh motifs moving quietly around each border.",
    colors: [colors.indigo], images: [image("shawl-edit"), image("craft-loom")],
  }),
];

export const extraWeaves = [
  { slug: "kashmiri", name: "Kashmiri Needlework", region: "Kashmir Valley", tagline: "A story in every stitch", story: "Paisley borders and fine needlework, inspired by the textile traditions of Kashmir.", image: image("shawl-edit") },
];
