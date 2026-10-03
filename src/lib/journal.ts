export type Article = {
  slug: string;
  title: string;
  kicker: string;
  image: string;
  excerpt: string;
  body: string[];
  date: string;
};

export const articles: Article[] = [
  {
    slug: "how-to-spot-real-zari",
    title: "How to Spot Real Zari",
    kicker: "Textile Notes",
    image: "/images/jewellery-gold.jpg",
    date: "March 2026",
    excerpt: "Silver-gilt thread, copper imitations and the burn test your grandmother already knew.",
    body: [
      "Real zari is a thread of silk or cotton wrapped in a fine strip of silver, electroplated with gold. It has a soft, warm glow — never the loud, mirror-like shine of metallic polyester.",
      "Look at the reverse of the weave. On a kadhua Banarasi, the motifs are woven separately, leaving floating threads on the back. Machine brocade is clean and tight, with little to no float.",
      "Real zari tarnishes slowly, and that is part of its charm. Store your saree in muslin, away from damp, and let the gold age gracefully.",
    ],
  },
  {
    slug: "kanchipuram-korvai-and-the-temple-border",
    title: "Korvai & the Temple Border",
    kicker: "Heritage",
    image: "/images/silk-green.jpg",
    date: "February 2026",
    excerpt: "Why a true Kanjivaram's border and body are woven separately — and joined by hand.",
    body: [
      "In Kanchipuram, weavers say their craft descends from Sage Markandeya, the weaver of the gods. The temple border — gopurams, rudraksha, peacocks — is the family signature.",
      "Korvai is the interlocking technique: the body and the border are woven separately in contrasting colours, then locked together weft by weft. The join is so strong the border can be pulled and the saree will not tear.",
      "That is the reason a Kanjivaram is heavy, and the reason it lasts three generations.",
    ],
  },
  {
    slug: "the-bridal-drape-guide",
    title: "The Bridal Drape Guide",
    kicker: "Bridal",
    image: "/images/bridal.jpg",
    date: "January 2026",
    excerpt: "Pleats, pallu and posture — how to wear a heavy Banarasi through a seven-hour wedding.",
    body: [
      "Start with a well-fitted petticoat and a sturdy waist knot. A heavy silk pulls downwards; secure the first tuck twice.",
      "Pin the pallu at the shoulder, not the blouse, so it falls with its own weight. Fan the pleats in even sevens for a structured silhouette.",
      "Wear flat sandals under the first fold and heels at the ceremony — and keep a spare safety pin in your clutch. Always.",
    ],
  },
];
