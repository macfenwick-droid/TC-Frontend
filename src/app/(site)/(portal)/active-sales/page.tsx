import type { Metadata } from "next";
import { ActiveSales } from "@/components/portal/active-sales";

export const metadata: Metadata = {
  title: "Active Sales",
  robots: { index: false, follow: false },
};

export default function ActiveSalesPage() {
  return <ActiveSales />;
}
