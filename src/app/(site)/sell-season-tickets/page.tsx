import type { Metadata } from "next";
import { SeasonTicketForm } from "@/components/sell/season-ticket-form";
import { SellLayout } from "@/components/sell/sell-layout";

const description = "Select the games you want to sell and we'll send you a cash offer for each one.";

export const metadata: Metadata = {
  title: "Sell Season Tickets",
  description,
  alternates: { canonical: "/sell-season-tickets" },
};

export default function SellSeasonTicketsPage() {
  return (
    <SellLayout
      eyebrow="Sell Season Tickets"
      title={
        <>
          Get Offers on <span className="text-link">Every Game</span>
        </>
      }
      description={description}
    >
      <SeasonTicketForm />
    </SellLayout>
  );
}
