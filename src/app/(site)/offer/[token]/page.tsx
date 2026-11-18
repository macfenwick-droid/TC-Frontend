import type { Metadata } from "next";
import { Suspense } from "react";
import { OfferView } from "@/components/offer/offer-view";
import { RequireAuth } from "@/components/portal/require-auth";
import { LoadingState } from "@/components/portal/states";
import { PageGlow } from "@/components/brand/glow";

export const metadata: Metadata = {
  title: "Your Offer",
  robots: { index: false, follow: false },
};

export default function OfferPage() {
  return (
    <>
      <PageGlow />
      {/* The offer id comes from the URL, so the page streams in after the static shell. */}
      <Suspense fallback={<LoadingState label="Loading offer details…" />}>
        <RequireAuth>
          <OfferView />
        </RequireAuth>
      </Suspense>
    </>
  );
}
