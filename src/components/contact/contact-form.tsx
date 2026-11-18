"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ctaVariants } from "@/components/brand/cta";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Field = "firstName" | "lastName" | "email" | "subject" | "message";
type Edits = Partial<Record<Field, string>>;

const fieldClass = "mt-1.5 h-12 rounded-xl border-[1.5px] border-line bg-white px-4 text-base focus-visible:border-ink";

/**
 * Contact form — same fields, copy and toasts as the current site.
 * Name and email prefill from the signed-in user until the visitor edits them.
 */
export function ContactForm() {
  const { user } = useAuth();
  const [edits, setEdits] = useState<Edits>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const values: Record<Field, string> = {
    firstName: edits.firstName ?? user?.first_name ?? "",
    lastName: edits.lastName ?? user?.last_name ?? "",
    email: edits.email ?? user?.email ?? "",
    subject: edits.subject ?? "",
    message: edits.message ?? "",
  };

  const bind = (name: Field) => ({
    id: name,
    name,
    value: values[name],
    onChange: (e: { target: { value: string } }) => setEdits((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitContact({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        subject: values.subject,
        message: values.message,
      });
      toast({ title: "Message Sent!", description: "We'll get back to you as soon as possible." });
      // Back to the signed-in user's details (or empty), like the current site.
      setEdits({});
    } catch {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="text-sm font-semibold">
            First Name
          </Label>
          <Input {...bind("firstName")} placeholder="John" required autoComplete="given-name" className={fieldClass} />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-semibold">
            Last Name
          </Label>
          <Input {...bind("lastName")} placeholder="Doe" required autoComplete="family-name" className={fieldClass} />
        </div>
      </div>
      <div>
        <Label htmlFor="email" className="text-sm font-semibold">
          Email
        </Label>
        <Input
          {...bind("email")}
          type="email"
          placeholder="john@example.com"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </div>
      <div>
        <Label htmlFor="subject" className="text-sm font-semibold">
          Subject
        </Label>
        <Input {...bind("subject")} placeholder="How can we help?" required className={fieldClass} />
      </div>
      <div>
        <Label htmlFor="message" className="text-sm font-semibold">
          Message
        </Label>
        <Textarea
          {...bind("message")}
          placeholder="Tell us more about your question..."
          rows={5}
          required
          className="mt-1.5 min-h-36 resize-none rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-base focus-visible:border-ink"
        />
      </div>
      <button type="submit" disabled={isSubmitting} className={cn(ctaVariants({ size: "lg" }), "w-full")}>
        {isSubmitting ? "Sending..." : "Send Message"}
        <Send className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
