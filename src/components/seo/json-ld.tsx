import { siteConfig } from "@/config/site";
import type { Faq } from "@/content/faqs";

/** Renders schema.org data as a JSON-LD script. `<` is escaped so the payload can't close the tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd() {
  const { url, name, logo, description, contact, trustpilot } = siteConfig;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: `${url}${logo}`,
    description,
    email: contact.generalEmail,
    telephone: "+1-253-213-0319",
    address: { "@type": "PostalAddress", addressLocality: "Seattle", addressRegion: "WA", addressCountry: "US" },
    sameAs: [trustpilot.url],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function faqPageJsonLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
