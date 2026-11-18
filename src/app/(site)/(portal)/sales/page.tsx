import type { Metadata } from "next";
import { MySales } from "@/components/portal/my-sales";

export const metadata: Metadata = {
  title: "My Sales",
  robots: { index: false, follow: false },
};

export default function SalesPage() {
  return <MySales />;
}
