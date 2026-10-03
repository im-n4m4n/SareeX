/**
 * One container contract for the whole storefront.
 *
 * Before this existed the app used eleven different max-widths and five gutter
 * pairs, so vertically stacked sections did not share a left edge (the worst
 * offenders were /craft with 1200/1300/1000 and /shop with 1400/1500).
 * Use these constants instead of hand-written widths.
 */
export const CONTAINER = "mx-auto w-full max-w-[1400px] px-5 md:px-10";
export const CONTAINER_WIDE = "mx-auto w-full max-w-[1500px] px-5 md:px-10";
export const CONTAINER_NARROW = "mx-auto w-full max-w-[1200px] px-5 md:px-10";
export const CONTAINER_READING = "mx-auto w-full max-w-[900px] px-5 md:px-10";

/** Clearance under the fixed navbar. Two values, not four. */
export const PAGE_TOP = "pt-36";
/** For pages that open with a tall full-bleed hero. */
export const PAGE_TOP_HERO = "pt-40 md:pt-44";

/** Section rhythm. Two values, not six. */
export const SECTION_Y = "py-24 md:py-28";
export const SECTION_Y_TIGHT = "py-20";
