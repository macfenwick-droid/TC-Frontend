import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ResellerNotice } from "@/components/site/reseller-notice";

/** Public pages: shared header + footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ResellerNotice />
      <Header />
      <main id="main" className="relative isolate flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
