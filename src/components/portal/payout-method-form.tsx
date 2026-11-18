"use client";

import { useId, useState, type FormEvent } from "react";
import { fieldClass, FieldLabel } from "@/components/brand/field";
import { Cta } from "@/components/brand/cta";
import { cn } from "@/lib/utils";

export type PayoutPlatform = "PayPal" | "Venmo";

/**
 * Add / edit a payout method: platform toggle + account. Used by Settings and the offer
 * payout picker; each passes the current site's own labels, placeholders and toasts.
 */
export function PayoutMethodForm({
  title,
  initialPlatform = "PayPal",
  initialAccount = "",
  platformLabels,
  placeholders,
  saving,
  saveLabel,
  cancelLabel,
  onSave,
  onCancel,
}: {
  title: string;
  initialPlatform?: PayoutPlatform;
  initialAccount?: string;
  platformLabels: Record<PayoutPlatform, string>;
  placeholders: Record<PayoutPlatform, string>;
  saving: boolean;
  saveLabel: string;
  cancelLabel: string;
  onSave: (platform: PayoutPlatform, account: string) => void;
  onCancel: () => void;
}) {
  const [platform, setPlatform] = useState<PayoutPlatform>(initialPlatform);
  const [account, setAccount] = useState(initialAccount);
  const id = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(platform, account);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-[24px] border-[1.5px] border-dashed border-ink/40 bg-cream p-5">
      <p className="font-bold" id={`${id}-title`}>
        {title}
      </p>
      <div>
        <span className="text-[15px] font-semibold" id={`${id}-platform`}>
          Platform
        </span>
        <div role="radiogroup" aria-labelledby={`${id}-platform`} className="mt-2 flex flex-wrap gap-2">
          {(["PayPal", "Venmo"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={platform === p}
              onClick={() => setPlatform(p)}
              className={cn(
                "min-h-11 rounded-full border-[1.5px] px-4 font-bold transition-colors",
                platform === p ? "border-ink bg-mint" : "border-line bg-white hover:border-ink"
              )}
            >
              {platformLabels[p]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel htmlFor={`${id}-account`}>Account</FieldLabel>
        <input
          id={`${id}-account`}
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder={placeholders[platform]}
          className={cn(fieldClass, "bg-white")}
          autoFocus
        />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Cta variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          {cancelLabel}
        </Cta>
        <Cta type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : saveLabel}
        </Cta>
      </div>
    </form>
  );
}
