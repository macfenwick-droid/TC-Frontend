"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Cta } from "@/components/brand/cta";
import { errorMessage } from "@/components/auth/auth-ui";
import { PayoutMethodForm, type PayoutPlatform } from "@/components/portal/payout-method-form";
import { LoadingState } from "@/components/portal/states";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { sellerKeys, usePayoutMethods } from "@/hooks/use-seller-data";
import { api, type PayoutMethod } from "@/lib/api";
import { VENMO_RATE, defaultPayoutMethod, money } from "@/lib/sales";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payoutMethodId: number) => void;
  quoteTotal?: number;
};

/** "Select Payout Method" before accepting an offer — port of the current site's OfferPayoutModal. */
export function OfferPayoutModal({ open, onOpenChange, onConfirm, quoteTotal }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[28px] border-line bg-white p-6 sm:max-w-lg sm:p-8">
        <DialogTitle className="text-[28px] leading-tight font-extrabold">Select Payout Method</DialogTitle>
        <DialogDescription className="-mt-2 text-[15px] text-muted-foreground">
          Where should we send your money when the tickets are transferred?
        </DialogDescription>
        {/* Mounted only while open, so every open starts from the saved default. */}
        <PayoutPicker onCancel={() => onOpenChange(false)} onConfirm={onConfirm} quoteTotal={quoteTotal} />
      </DialogContent>
    </Dialog>
  );
}

function PayoutPicker({ onCancel, onConfirm, quoteTotal }: Omit<Props, "open" | "onOpenChange"> & { onCancel: () => void }) {
  const queryClient = useQueryClient();
  const methods = usePayoutMethods();
  const list = methods.data ?? [];
  const [picked, setPicked] = useState<number | null>(null);
  const [editing, setEditing] = useState<PayoutMethod | "new" | null>(null);
  const [saving, setSaving] = useState(false);

  // Until the seller picks one, the saved default (or the first) is selected.
  const selectedId = list.some((m) => m.id === picked) ? picked : (defaultPayoutMethod(list)?.id ?? null);
  const selected = list.find((m) => m.id === selectedId);
  const refresh = () => queryClient.invalidateQueries({ queryKey: sellerKeys.payoutMethods });

  const remove = async (id: number) => {
    try {
      await api.deletePayoutMethod(id);
      toast({ title: "Method deleted" });
      await refresh();
    } catch (err) {
      toast({ title: "Delete failed", description: errorMessage(err, ""), variant: "destructive" });
    }
  };

  const save = async (company: PayoutPlatform, account: string) => {
    if (!account.trim()) {
      toast({ title: "Account required", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      if (editing && editing !== "new") {
        await api.updatePayoutMethod(editing.id, { company, account });
        toast({ title: "Method updated" });
      } else {
        await api.createPayoutMethod({ company, account, is_default: list.length === 0 });
        toast({ title: "Method added" });
      }
      setEditing(null);
      await refresh();
    } catch (err) {
      toast({ title: "Save failed", description: errorMessage(err, ""), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirm = async () => {
    if (!selectedId) {
      toast({ title: "Select a payout method", variant: "destructive" });
      return;
    }
    // Payouts go to the default method, so make the chosen one the default.
    if (selected && !selected.is_default) {
      try {
        await api.setDefaultPayoutMethod(selectedId);
        void refresh();
      } catch {
        // Same as the current site: carry on accepting.
      }
    }
    onConfirm(selectedId);
  };

  if (editing) {
    return (
      <PayoutMethodForm
        key={editing === "new" ? "new" : editing.id}
        title={editing === "new" ? "Add a Payout Method" : "Edit Payout Method"}
        initialPlatform={editing !== "new" && editing.company === "Venmo" ? "Venmo" : "PayPal"}
        initialAccount={editing === "new" ? "" : editing.account}
        platformLabels={{ PayPal: "PayPal", Venmo: "Venmo (3% surcharge applies)" }}
        placeholders={{ PayPal: "Email...", Venmo: "Username or phone" }}
        saving={saving}
        saveLabel="Save Method"
        cancelLabel="Back"
        onSave={(company, account) => void save(company, account)}
        onCancel={() => setEditing(null)}
      />
    );
  }

  if (methods.isPending) return <LoadingState label="Loading your methods..." />;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-muted-foreground">You have no payout methods saved.</p>
        <Cta onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden="true" />
          Add a Payout Method
        </Cta>
      </div>
    );
  }

  const isVenmo = selected?.company === "Venmo";

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Payout method</legend>
        {list.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[20px] border-[1.5px] p-4 transition-colors",
              selectedId === m.id ? "border-ink bg-mint" : "border-line bg-white hover:border-ink/30"
            )}
          >
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="offer-payout"
                checked={selectedId === m.id}
                onChange={() => setPicked(m.id)}
                className="size-5 shrink-0 accent-ink"
              />
              <span className="flex min-w-0 flex-col">
                <span className="flex flex-wrap items-center gap-2 font-bold">
                  {m.company}
                  {m.company === "Venmo" && (
                    <span className="rounded-full bg-butter px-2 py-0.5 text-[11px] font-bold text-amber-fg">3% surcharge</span>
                  )}
                </span>
                <span className="truncate text-sm text-muted-foreground">{m.account}</span>
              </span>
            </label>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setEditing(m)}
                aria-label={`Edit ${m.company} ${m.account}`}
                className="grid size-9 place-items-center rounded-xl hover:bg-cream"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(m.id)}
                aria-label={`Delete ${m.company} ${m.account}`}
                className="grid size-9 place-items-center rounded-xl text-destructive hover:bg-peach"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </fieldset>

      <button
        type="button"
        onClick={() => setEditing("new")}
        className="flex min-h-12 items-center justify-center gap-2 rounded-[20px] border-[1.5px] border-dashed border-line font-bold text-muted-foreground hover:border-ink hover:text-ink"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add another method
      </button>

      {isVenmo && quoteTotal != null && (
        <div className="flex items-start gap-2.5 rounded-[20px] bg-butter p-4 text-sm text-amber-fg">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">Venmo 3% surcharge applies</p>
            <p className="mt-0.5">
              You&apos;ll receive <b>{money(quoteTotal * VENMO_RATE)}</b> (instead of {money(quoteTotal)}). Switch to PayPal to
              receive the full amount.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Cta variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Cta>
        <Cta size="sm" onClick={() => void confirm()} disabled={!selectedId} className="bg-brand text-ink hover:text-ink">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Accept Offer &amp; Continue
        </Cta>
      </div>
    </div>
  );
}
