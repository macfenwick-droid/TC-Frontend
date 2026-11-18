import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/brand/container";
import { Eyebrow } from "@/components/brand/eyebrow";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a question or need help? We're here for you. Reach out and we'll respond as quickly as possible.",
  alternates: { canonical: "/contact" },
};

const { contact } = siteConfig;

// Copy from the current site's Contact page.
const hours = [
  { days: "Mon – Fri", time: "9am – 9pm PST" },
  { days: "Sat – Sun", time: "10am – 6pm PST" },
];

export default function ContactPage() {
  return (
    <>
      <section>
        <Container className="flex flex-col gap-4 pt-12 pb-10 sm:pt-16">
          <Eyebrow className="animate-rise">Contact</Eyebrow>
          <h1 className="animate-rise text-5xl leading-[1.02] font-extrabold [animation-delay:0.05s] sm:text-6xl lg:text-7xl">
            Get In <span className="text-link">Touch</span>
          </h1>
          <p className="max-w-2xl animate-rise text-lg leading-relaxed text-muted-foreground [animation-delay:0.1s] sm:text-xl">
            Have a question or need help? We&apos;re here for you. Reach out and we&apos;ll respond as quickly as possible.
          </p>
        </Container>
      </section>

      <section>
        <Container className="grid gap-6 pb-20 sm:pb-24 lg:grid-cols-[380px_1fr] lg:gap-8">
          {/* Info panel */}
          <div className="flex h-fit flex-col gap-8 rounded-[28px] bg-ink p-7 text-white sm:p-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold">Contact Information</h2>
              <p className="text-sm leading-relaxed text-on-dark-muted">
                Reach us through any of these channels and we&apos;ll get back to you promptly.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={contact.phoneHref}
                  className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-ink">
                    <Phone className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wider text-on-dark-muted uppercase">Phone</span>
                    <span className="mt-0.5 block font-semibold">{contact.phone}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-butter text-ink">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold tracking-wider text-on-dark-muted uppercase">Location</span>
                  <span className="mt-0.5 block font-semibold">{contact.location}</span>
                </span>
              </li>
            </ul>

            <div className="border-t border-white/10 pt-6">
              <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-bold tracking-normal">
                <Clock className="size-4 text-brand" aria-hidden="true" />
                Business Hours
              </h3>
              <dl className="flex flex-col gap-1.5 text-sm">
                {hours.map((h) => (
                  <div key={h.days} className="flex justify-between">
                    <dt className="text-on-dark-muted">{h.days}</dt>
                    <dd className="font-medium">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
            <h2 className="mb-1 text-3xl font-extrabold">Send Us a Message</h2>
            <p className="mb-8 text-sm text-muted-foreground">We typically reply within a few hours.</p>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
