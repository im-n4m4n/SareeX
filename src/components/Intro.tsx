import { Lotus } from "./ui";

/** Silk-curtain intro: two espresso panels part over the Elite Weavers mark. Pure CSS. */
export default function Intro() {
  return (
    <div aria-hidden className="intro">
      <div className="intro-panel l">
        <div className="pattern-brocade pat-soft absolute inset-0" />
      </div>
      <div className="intro-panel r">
        <div className="pattern-brocade pat-soft absolute inset-0" />
      </div>
      <div className="intro-mark">
        <Lotus className="h-10 w-16" />
        <span className="word font-display mt-3 text-4xl md:text-6xl">Elite Weavers</span>
        <span className="line" />
      </div>
    </div>
  );
}
