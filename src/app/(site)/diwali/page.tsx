import { listProducts } from "@/lib/queries";
import DiwaliClient from "./DiwaliClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diwali & Dussehra Special — Elite Weavers",
  description:
    "A festival edit of Diwali and Dussehra sarees: diya-glow Banarasi silks, marigold Kanjivarams and festive Bandhani, with a special season offer.",
};

export default async function DiwaliPage() {
  const festive = await listProducts({ occasion: "festive", limit: 8, sort: "newest" });

  return <DiwaliClient festive={festive} />;
}
