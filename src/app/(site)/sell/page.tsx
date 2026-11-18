import type { Metadata } from "next";
import { SellLayout } from "@/components/sell/sell-layout";
import { TicketForm } from "@/components/sell/ticket-form";
import { PageGlow } from "@/components/brand/glow";

const description = "Fill in your ticket details and we'll send you a cash offer within minutes.";

export const metadata: Metadata = {
  title: "Sell Tickets",
  description,
  alternates: { canonical: "/sell" },
};

export default function SellPage() {
  return (
    <>
      <PageGlow />
      <SellLayout
        eyebrow="Sell Tickets"
        title={
          <>
            Get Your <span className="text-link">Instant Offer</span>
          </>
        }
        description={description}
      >
        <TicketForm />
      </SellLayout>
    </>
  );
}
