import type { ColorOption } from "./schema";

const I = (n: string) => `/images/${n}.jpg`;

const C = {
  maroon: { name: "Maroon", hex: "#6B1E2A" },
  ruby: { name: "Ruby", hex: "#9B1B30" },
  emerald: { name: "Emerald", hex: "#0F5132" },
  gold: { name: "Gold", hex: "#C9A24B" },
  indigo: { name: "Indigo", hex: "#1F2A44" },
  peacock: { name: "Peacock Blue", hex: "#1E5A7A" },
  blush: { name: "Blush", hex: "#E8B4B8" },
  ivory: { name: "Ivory", hex: "#F1E7D3" },
  marigold: { name: "Marigold", hex: "#E0A21B" },
  saffron: { name: "Saffron", hex: "#E2711D" },
  noir: { name: "Noir", hex: "#1C1512" },
  mint: { name: "Mint", hex: "#A9CDB5" },
  lilac: { name: "Lilac", hex: "#B79AC8" },
} satisfies Record<string, ColorOption>;

type Seed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  weave: string;
  fabric: string;
  occasion: string;
  collection: string;
  work: string;
  blouse?: string;
  length?: string;
  care?: string;
  colors: ColorOption[];
  images: string[];
  stock: number;
  badge?: string;
  isNew?: boolean;
  featured?: boolean;
  rating: number;
  reviewCount: number;
};

export const seedProducts: Seed[] = [
  {
    slug: "royal-banarasi-silk-saree",
    name: "Royal Banarasi Silk Saree",
    tagline: "Intricate zari work · Rich heritage",
    description:
      "A regal katan silk saree handwoven in Varanasi with intricate gold zari butis and a kadhua border, inspired by Mughal-era brocade. Made for weddings, festivals and moments that matter.",
    story:
      "Woven over three weeks by a family of weavers in Madanpura, Varanasi, this saree uses the kadhua technique — each motif is woven separately with its own shuttle, leaving the characteristic floating threads on the reverse.",
    price: 12999,
    compareAtPrice: 16999,
    category: "sarees",
    weave: "banarasi",
    fabric: "Katan Silk",
    occasion: "wedding",
    collection: "heirloom-edit",
    work: "Gold zari kadhua weaving",
    colors: [C.maroon, C.emerald, C.marigold, C.blush, C.ivory],
    images: [I("m02"), I("silk-maroon"), I("m01"), I("bridal")],
    stock: 14,
    badge: "Bestseller",
    isNew: true,
    featured: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    slug: "rani-kinkhab-bridal-banarasi",
    name: "Rani Kinkhab Bridal Banarasi",
    tagline: "Pure zari · Bridal heirloom",
    description:
      "A heavy bridal Banarasi in ruby red with a kinkhab-style brocade pallu, woven with real silver-gilt zari. A saree to be passed down.",
    story:
      "Kinkhab — 'little dream' — was once woven only for royal courts. This piece takes 120 hours at the loom and carries a full-width jaal pallu.",
    price: 38500,
    compareAtPrice: 44000,
    category: "sarees",
    weave: "banarasi",
    fabric: "Katan Silk",
    occasion: "wedding",
    collection: "heirloom-edit",
    work: "Pure zari jaal brocade",
    colors: [C.ruby, C.maroon],
    images: [I("m01"), I("bridal"), I("silk-maroon")],
    stock: 4,
    badge: "Limited Edition",
    isNew: true,
    featured: true,
    rating: 5,
    reviewCount: 41,
  },
  {
    slug: "emerald-kanjivaram-temple-border",
    name: "Emerald Kanjivaram Temple Border",
    tagline: "Heritage weave · Rich texture",
    description:
      "A pure mulberry Kanjivaram in deep emerald with a contrast temple-border of gopuram motifs and gold buttis scattered across the body.",
    story:
      "Woven in Kanchipuram with the korvai technique — body and border are woven separately and interlocked by hand so the join never frays.",
    price: 24999,
    compareAtPrice: 28999,
    category: "sarees",
    weave: "kanjivaram",
    fabric: "Mulberry Silk",
    occasion: "festive",
    collection: "heirloom-edit",
    work: "Korvai temple border, gold zari",
    colors: [C.emerald, C.maroon, C.marigold, C.indigo],
    images: [I("silk-green"), I("m05"), I("m16")],
    stock: 9,
    badge: "Trending",
    isNew: true,
    featured: true,
    rating: 4.9,
    reviewCount: 88,
  },
  {
    slug: "mayura-kanjivaram-peacock-blue",
    name: "Mayura Kanjivaram Peacock Blue",
    tagline: "Peacock motifs · Temple zari",
    description:
      "A peacock-blue Kanjivaram with mayura motifs on the pallu and a wide rudraksha border in antique gold.",
    story:
      "The mayura — peacock — is a symbol of grace in South Indian temple art. These motifs are woven from a hand-drawn graph on a jacquard-free loom.",
    price: 29500,
    category: "sarees",
    weave: "kanjivaram",
    fabric: "Mulberry Silk",
    occasion: "wedding",
    collection: "heirloom-edit",
    work: "Peacock butta, rudraksha border",
    colors: [C.peacock, C.emerald, C.ruby],
    images: [I("m04"), I("silk-green")],
    stock: 6,
    isNew: true,
    rating: 4.9,
    reviewCount: 37,
  },
  {
    slug: "gulabi-chanderi-silk-cotton",
    name: "Gulabi Chanderi Silk Cotton",
    tagline: "Featherlight · Sheer zari",
    description:
      "A sheer, glass-like Chanderi in rose pink with a woven gold border. Light enough to float, rich enough to be noticed.",
    story:
      "From the town of Chanderi in Madhya Pradesh, where silk and fine cotton are woven together into a texture often compared to 'woven air'.",
    price: 6499,
    category: "sarees",
    weave: "chanderi",
    fabric: "Silk Cotton",
    occasion: "day",
    collection: "summer-muslin",
    work: "Woven zari border, butti body",
    colors: [C.blush, C.mint, C.ivory, C.lilac],
    images: [I("m06"), I("m12")],
    stock: 22,
    badge: "New",
    isNew: true,
    featured: true,
    rating: 4.7,
    reviewCount: 63,
  },
  {
    slug: "classic-handloom-cotton-saree",
    name: "Classic Handloom Cotton Saree",
    tagline: "Lightweight · Breathable · Everyday",
    description:
      "A soft handloom cotton in ivory with hand-block printed floral sprigs. Made for long days, easy drapes and monsoon afternoons.",
    story:
      "Block-printed by artisans in Sanganer, Rajasthan using natural dyes and hand-carved teak blocks, then sun-dried on the banks of the river.",
    price: 2999,
    category: "sarees",
    weave: "cotton",
    fabric: "Handloom Cotton",
    occasion: "casual",
    collection: "summer-muslin",
    work: "Hand block print",
    care: "Gentle hand wash in cold water",
    colors: [C.ivory, C.blush, C.emerald, C.indigo],
    images: [I("m11"), I("m13")],
    stock: 40,
    badge: "New",
    isNew: true,
    rating: 4.6,
    reviewCount: 212,
  },
  {
    slug: "sunset-bandhani-georgette",
    name: "Sunset Bandhani Georgette",
    tagline: "Tie-dyed by hand · Gujarat",
    description:
      "A saffron-to-marigold bandhani georgette with thousands of hand-tied dots, finished with a gota patti border.",
    story:
      "Each dot is pinched and tied with thread by the Khatri community of Kutch — a single saree can hold over 75,000 knots.",
    price: 8499,
    category: "sarees",
    weave: "bandhani",
    fabric: "Georgette",
    occasion: "festive",
    collection: "festival-of-colour",
    work: "Hand-tied bandhani, gota patti",
    colors: [C.saffron, C.marigold, C.ruby],
    images: [I("m07"), I("m08")],
    stock: 18,
    isNew: true,
    rating: 4.7,
    reviewCount: 52,
  },
  {
    slug: "patola-double-ikat-saree",
    name: "Patola Double Ikat Saree",
    tagline: "Patan heritage · Collector's piece",
    description:
      "A true double-ikat Patola from Patan, Gujarat, in wine and gold geometrics — a six-month commitment at the loom.",
    story:
      "In double ikat, both warp and weft threads are resist-dyed before weaving and must align perfectly. Only a handful of families still practise it.",
    price: 54000,
    compareAtPrice: 60000,
    category: "sarees",
    weave: "patola",
    fabric: "Pure Silk",
    occasion: "evening",
    collection: "heirloom-edit",
    work: "Double ikat, natural dyes",
    colors: [C.maroon, C.indigo],
    images: [I("m16"), I("silk-maroon")],
    stock: 2,
    badge: "Limited Edition",
    featured: true,
    rating: 5,
    reviewCount: 14,
  },
  {
    slug: "designer-organza-rose-saree",
    name: "Designer Organza Rose Saree",
    tagline: "Floral embroidery · Modern elegance",
    description:
      "A cloud-light organza saree in dusty rose, hand-embroidered with zardozi florals along the border. Pair with a velvet blouse for evenings.",
    story:
      "Embroidered in Lucknow by chikankari and zardozi artisans — a modern drape rooted in Awadhi craft.",
    price: 8999,
    category: "sarees",
    weave: "organza",
    fabric: "Organza",
    occasion: "evening",
    collection: "summer-muslin",
    work: "Zardozi floral embroidery",
    colors: [C.blush, C.lilac, C.ivory, C.mint],
    images: [I("m15"), I("m06")],
    stock: 16,
    badge: "Trending",
    isNew: true,
    rating: 4.8,
    reviewCount: 71,
  },
  {
    slug: "haldi-yellow-mulmul-saree",
    name: "Haldi Yellow Mulmul Saree",
    tagline: "Soft as muslin · Pure joy",
    description:
      "A buttery mulmul cotton in turmeric yellow with a tiny red bandhej border — made for haldi mornings and long lunches.",
    story: "Dyed with turmeric and pomegranate rind in small batches in Jaipur.",
    price: 4299,
    category: "sarees",
    weave: "cotton",
    fabric: "Mulmul Cotton",
    occasion: "festive",
    collection: "festival-of-colour",
    work: "Natural dye, bandhej border",
    care: "Gentle hand wash in cold water",
    colors: [C.marigold, C.blush, C.ivory],
    images: [I("m08"), I("m07")],
    stock: 25,
    rating: 4.6,
    reviewCount: 48,
  },
  {
    slug: "midnight-noir-zari-georgette",
    name: "Midnight Noir Zari Georgette",
    tagline: "Evening drama · Antique zari",
    description:
      "A flowing black georgette with an antique-gold zari border — a fresh, modern take on the evening saree.",
    story:
      "A collaboration with Surat weavers, combining a contemporary silhouette with a traditional woven zari border.",
    price: 11999,
    category: "sarees",
    weave: "georgette",
    fabric: "Georgette",
    occasion: "evening",
    collection: "summer-muslin",
    work: "Woven antique zari border",
    colors: [C.noir, C.indigo, C.maroon],
    images: [I("m10"), I("m09")],
    stock: 12,
    isNew: true,
    rating: 4.8,
    reviewCount: 33,
  },
  {
    slug: "ruby-banarasi-bridal-lehenga",
    name: "Ruby Banarasi Bridal Lehenga",
    tagline: "Brocade skirt · Zari dupatta",
    description:
      "A three-piece bridal lehenga set in ruby Banarasi brocade with a net dupatta bordered in gold zari. Made to measure in 4–6 weeks.",
    story:
      "The skirt is cut from a single Banarasi brocade panel so the jaal pattern flows uninterrupted round the hem.",
    price: 68000,
    compareAtPrice: 78000,
    category: "lehengas",
    weave: "banarasi",
    fabric: "Brocade Silk",
    occasion: "wedding",
    collection: "heirloom-edit",
    work: "Brocade, zardozi, hand-finished",
    blouse: "Stitched to measure",
    length: "3 pieces: lehenga, blouse, dupatta",
    colors: [C.ruby, C.maroon],
    images: [I("m03"), I("bridal")],
    stock: 5,
    badge: "Made to Measure",
    featured: true,
    rating: 5,
    reviewCount: 19,
  },
  {
    slug: "marigold-festive-lehenga",
    name: "Marigold Festive Lehenga",
    tagline: "Mirror work · Festive twirl",
    description:
      "A marigold raw-silk lehenga with kutchi mirror work, finished with a contrast indigo dupatta.",
    story:
      "Embroidered by women artisan collectives of Kutch, where mirror work is a language passed from mother to daughter.",
    price: 34500,
    category: "lehengas",
    weave: "bandhani",
    fabric: "Raw Silk",
    occasion: "festive",
    collection: "festival-of-colour",
    work: "Kutch mirror work",
    blouse: "Stitched to measure",
    length: "3 pieces: lehenga, blouse, dupatta",
    colors: [C.marigold, C.saffron],
    images: [I("m07"), I("m05")],
    stock: 7,
    isNew: true,
    rating: 4.9,
    reviewCount: 22,
  },
  {
    slug: "ivory-tussar-madhubani-saree",
    name: "Ivory Tussar Madhubani Saree",
    tagline: "Wild silk · Hand-painted",
    description:
      "A tussar silk saree in warm ivory with Madhubani fish and lotus motifs hand-painted in natural pigments.",
    story:
      "Painted by women artists from Mithila, Bihar, using bamboo nibs and pigments from turmeric, indigo and lac.",
    price: 9800,
    category: "sarees",
    weave: "tussar",
    fabric: "Tussar Silk",
    occasion: "day",
    collection: "summer-muslin",
    work: "Hand-painted Madhubani",
    colors: [C.ivory, C.marigold],
    images: [I("m13"), I("m14")],
    stock: 11,
    rating: 4.7,
    reviewCount: 29,
  },
  {
    slug: "mint-kota-doria-saree",
    name: "Mint Kota Doria Saree",
    tagline: "Square-weave · Weightless",
    description:
      "A weightless Kota Doria in mint with gold-edged border; its distinctive square checks let skin breathe in summer heat.",
    story:
      "Kota Doria is woven in Kaithoon, Rajasthan — the checks (khats) come from a combination of cotton and silk yarns.",
    price: 3800,
    category: "sarees",
    weave: "kota",
    fabric: "Cotton Silk",
    occasion: "casual",
    collection: "summer-muslin",
    work: "Khat weave, zari edge",
    colors: [C.mint, C.blush, C.ivory],
    images: [I("m14"), I("m12")],
    stock: 30,
    rating: 4.5,
    reviewCount: 57,
  },
  {
    slug: "wine-mysore-crepe-silk",
    name: "Wine Mysore Crepe Silk",
    tagline: "Fluid drape · Subtle sheen",
    description:
      "A fluid Mysore crepe silk in wine with a slim gold line border — effortless for office galas and dinners.",
    story:
      "Mysore silk is woven from a single pure mulberry thread; the crepe finish gives it a drape that moves like water.",
    price: 14500,
    category: "sarees",
    weave: "mysore",
    fabric: "Crepe Silk",
    occasion: "evening",
    collection: "heirloom-edit",
    work: "Pure zari line border",
    colors: [C.maroon, C.indigo, C.emerald],
    images: [I("m09"), I("m03")],
    stock: 10,
    rating: 4.8,
    reviewCount: 26,
  },
];

export const seedCategories = [
  { slug: "sarees", name: "Sarees", description: "Handwoven six-yard drapes", image: I("m02") },
  { slug: "lehengas", name: "Lehengas", description: "Bridal & festive three-piece sets", image: I("m03") },
];

export const seedWeaves = [
  { slug: "banarasi", name: "Banarasi", region: "Varanasi, Uttar Pradesh", tagline: "A legacy in every weave", story: "Mughal-era brocade, woven with gold and silver zari on katan silk.", image: I("silk-maroon") },
  { slug: "kanjivaram", name: "Kanjivaram", region: "Kanchipuram, Tamil Nadu", tagline: "Heritage from the South", story: "Temple-inspired borders, korvai-joined, in lustrous mulberry silk.", image: I("silk-green") },
  { slug: "chanderi", name: "Chanderi", region: "Chanderi, Madhya Pradesh", tagline: "Woven air", story: "Sheer silk-cotton with glass-like transparency.", image: I("m06") },
  { slug: "bandhani", name: "Bandhani", region: "Kutch, Gujarat", tagline: "Knots of celebration", story: "Thousands of hand-tied dots dyed in festive colour.", image: I("m07") },
  { slug: "patola", name: "Patola", region: "Patan, Gujarat", tagline: "The double-ikat masterpiece", story: "Resist-dyed warp and weft, aligned thread by thread.", image: I("m16") },
  { slug: "cotton", name: "Handloom Cotton", region: "Across India", tagline: "Everyday grace", story: "Breathable, block-printed and naturally dyed.", image: I("m11") },
  { slug: "organza", name: "Organza", region: "Lucknow & Surat", tagline: "For the modern muse", story: "Sheer drapes with zardozi and chikankari.", image: I("m15") },
  { slug: "georgette", name: "Georgette", region: "Surat, Gujarat", tagline: "Evening fluidity", story: "Fluid crepe with woven zari borders.", image: I("m10") },
  { slug: "tussar", name: "Tussar", region: "Bhagalpur, Bihar", tagline: "Wild silk", story: "Naturally golden wild silk, often hand-painted.", image: I("m13") },
  { slug: "kota", name: "Kota Doria", region: "Kaithoon, Rajasthan", tagline: "Square-check lightness", story: "Cotton-silk with khat checks.", image: I("m14") },
  { slug: "mysore", name: "Mysore Silk", region: "Mysuru, Karnataka", tagline: "Pure mulberry crepe", story: "Fluid crepe silk with subtle sheen.", image: I("m09") },
];

export const seedOccasions = [
  { slug: "wedding", name: "Wedding & Bridal", tagline: "Heirlooms for the aisle", image: I("bridal") },
  { slug: "evening", name: "Evening", tagline: "After-dark drapes", image: I("m10") },
  { slug: "day", name: "Casual Day", tagline: "Light, luminous, easy", image: I("m12") },
  { slug: "casual", name: "Everyday", tagline: "Cotton comforts", image: I("m11") },
  { slug: "festive", name: "Festive Ethnic", tagline: "Colour, gold & celebration", image: I("m07") },
];

export const seedCollections = [
  { slug: "heirloom-edit", name: "The Heirloom Edit", description: "Zari-rich silks meant to be passed down.", image: I("m02"), featured: true },
  { slug: "summer-muslin", name: "Summer Muslin", description: "Weightless weaves for warm days.", image: I("m06"), featured: true },
  { slug: "festival-of-colour", name: "Festival of Colour", description: "Bandhani, mulmul and marigold.", image: I("m08"), featured: true },
];

export const seedCoupons = [
  { code: "ELITE10", type: "percent", value: 10, minOrder: 0 },
  { code: "WELCOME500", type: "flat", value: 500, minOrder: 5000 },
];

export const seedReviews = [
  { name: "Priya S.", rating: 5, title: "Outstanding quality", body: "The saree looks even more beautiful in person. The zari is rich and it drapes like a dream. Loved the packaging and quick delivery." },
  { name: "Ananya R.", rating: 5, title: "Worth every rupee", body: "Absolutely in love! The weave is so elegant and the pallu pleats beautifully. I received so many compliments at the wedding." },
  { name: "Meera K.", rating: 5, title: "My first of many", body: "My first purchase and I'm already planning the next. Beautiful collection and excellent customer service over WhatsApp." },
  { name: "Lakshmi V.", rating: 4, title: "Authentic weave", body: "Authentic handloom, you can feel the craft. Colour was slightly deeper than on screen, but gorgeous." },
];
