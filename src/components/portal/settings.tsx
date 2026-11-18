"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Pencil, Plus, Trash2, User, Wallet } from "lucide-react";
import { Cta } from "@/components/brand/cta";
import { fieldClass, FieldLabel } from "@/components/brand/field";
import { PasswordInput, errorMessage } from "@/components/auth/auth-ui";
import { sellerKeys, usePayoutMethods } from "@/hooks/use-seller-data";
import { useAuth } from "@/hooks/useAuth";
import { api, type PayoutMethod } from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { PortalPageHeader } from "./page-header";
import { PayoutMethodForm, type PayoutPlatform } from "./payout-method-form";
import { EmptyState, LoadingState } from "./states";

type TabId = "personal" | "password" | "payout";

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "payout", label: "Payout Methods", icon: Wallet },
];

/** /settings — port of the current site's Settings page (tabs, copy and toasts). */
export function Settings() {
  const [active, setActive] = useState<TabId>("personal");

  return (
    <>
      <PortalPageHeader title="Settings" description="Manage your account preferences" />

      <div role="tablist" aria-label="Settings" className="flex w-full max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 sm:w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActive(id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors",
              active === id ? "bg-ink text-white" : "text-muted-foreground hover:text-ink"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <section
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="max-w-2xl rounded-[28px] border border-line bg-white p-5 sm:p-8"
      >
        {active === "personal" && <PersonalInfo />}
        {active === "password" && <PasswordPanel />}
        {active === "payout" && <PayoutMethods />}
      </section>
    </>
  );
}

/**
 * Read-only: the backend has no profile-update endpoint (the current site's "Save Changes"
 * only showed a success toast without saving anything).
 */
function PersonalInfo() {
  const { user } = useAuth();
  const readOnly = cn(fieldClass, "cursor-not-allowed bg-muted text-muted-foreground");
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
          <input id="firstName" value={user?.first_name || ""} readOnly className={readOnly} />
        </div>
        <div>
          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
          <input id="lastName" value={user?.last_name || ""} readOnly className={readOnly} />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input id="email" type="email" value={user?.email || ""} readOnly className={readOnly} />
        <p className="mt-2 text-sm text-muted-foreground">Email cannot be changed here.</p>
      </div>
      {user?.phone_number && (
        <div>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <input id="phone" type="tel" value={user.phone_number} readOnly className={readOnly} />
        </div>
      )}
    </div>
  );
}

function PasswordPanel() {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const providers = new Set((user?.provider || "").split(",").filter(Boolean));
  const isGoogleOnly = providers.has("google") && !providers.has("email");

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (isGoogleOnly) {
      toast({
        title: "Password managed by Google",
        description: "Use Google to sign in or request a password reset email to add email login.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure the new password and confirmation match.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await updatePassword(newPassword);
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({ title: "Could not update password", description: errorMessage(error, "Try again later."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      {isGoogleOnly && (
        <p className="rounded-[20px] bg-butter p-4 text-[15px] leading-relaxed text-amber-fg">
          You signed up with Google OAuth. To add an email/password, click &quot;Forgot password&quot; from the login
          screen — we&apos;ll email you a link to set one. Password change is disabled here.
        </p>
      )}
      <fieldset disabled={isGoogleOnly} className="flex flex-col gap-5 disabled:opacity-60">
        <div>
          <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
          <PasswordInput id="current-password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
        </div>
        <div>
          <FieldLabel htmlFor="new-password">New Password</FieldLabel>
          <PasswordInput id="new-password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        </div>
        <div>
          <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
          <PasswordInput id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        </div>
      </fieldset>
      <div className="border-t border-line pt-5">
        <Cta type="submit" disabled={saving || isGoogleOnly || !newPassword || !confirmPassword}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {saving ? "Saving..." : "Update Password"}
        </Cta>
      </div>
    </form>
  );
}

function PayoutMethods() {
  const queryClient = useQueryClient();
  const methods = usePayoutMethods();
  const [editing, setEditing] = useState<PayoutMethod | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [settingDefault, setSettingDefault] = useState<number | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: sellerKeys.payoutMethods });
  const list = methods.data ?? [];

  const remove = async (id: number) => {
    try {
      setDeleting(id);
      await api.deletePayoutMethod(id);
      await refresh();
      toast({ title: "Method Deleted", description: "Payout method has been removed." });
    } catch (err) {
      toast({ title: "Delete failed", description: errorMessage(err, "Try again later."), variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const makeDefault = async (id: number) => {
    try {
      setSettingDefault(id);
      await api.setDefaultPayoutMethod(id);
      await refresh();
    } catch (err) {
      toast({ title: "Could not set default", description: errorMessage(err, "Try again later."), variant: "destructive" });
    } finally {
      setSettingDefault(null);
    }
  };

  const save = async (company: PayoutPlatform, account: string) => {
    if (!account.trim()) {
      toast({ title: "Error", description: "Account is required.", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      if (editing && editing !== "new") {
        await api.updatePayoutMethod(editing.id, { company, account });
        toast({ title: "Method Updated", description: "Payout method has been updated." });
      } else {
        await api.createPayoutMethod({ company, account, is_default: list.length === 0 });
        toast({ title: "Method Added", description: "New payout method has been added." });
      }
      await refresh();
      setEditing(null);
    } catch (err) {
      toast({ title: "Save failed", description: errorMessage(err, "Try again later."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (methods.isPending) return <LoadingState label="Loading payout methods…" />;

  return (
    <div className="flex flex-col gap-4">
      {methods.isError ? (
        <p className="rounded-[20px] bg-peach p-4 font-medium" role="alert">
          Could not load payout methods. {methods.error.message || "Try again later."}
        </p>
      ) : list.length === 0 ? (
        <EmptyState icon={Wallet} title="No payout methods added yet." />
      ) : (
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Default payout method</legend>
          {list.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[20px] border-[1.5px] p-4 transition-colors",
                m.is_default ? "border-brand bg-mint" : "border-line bg-white hover:border-ink/30"
              )}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="default-payout"
                  checked={m.is_default}
                  onChange={() => void makeDefault(m.id)}
                  disabled={settingDefault === m.id || saving}
                  className="size-5 shrink-0 accent-ink"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2 font-bold">
                    {m.company}
                    {m.is_default && <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold">Default</span>}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">{m.account}</span>
                </span>
              </label>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(m)}
                  disabled={saving || deleting === m.id}
                  aria-label={`Edit ${m.company} ${m.account}`}
                  className="grid size-10 place-items-center rounded-xl border border-line bg-white hover:bg-cream disabled:opacity-50"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(m.id)}
                  disabled={saving || deleting === m.id}
                  aria-label={`Delete ${m.company} ${m.account}`}
                  className="grid size-10 place-items-center rounded-xl border border-line bg-white text-destructive hover:bg-peach disabled:opacity-50"
                >
                  {deleting === m.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {editing ? (
        <PayoutMethodForm
          key={editing === "new" ? "new" : editing.id}
          title={editing === "new" ? "Add Payout Method" : "Edit Payout Method"}
          initialPlatform={editing !== "new" && editing.company === "Venmo" ? "Venmo" : "PayPal"}
          initialAccount={editing === "new" ? "" : editing.account}
          platformLabels={{ PayPal: "PayPal", Venmo: "Venmo" }}
          placeholders={{ PayPal: "Email or username", Venmo: "Username or phone" }}
          saving={saving}
          saveLabel="Save"
          cancelLabel="Cancel"
          onSave={(company, account) => void save(company, account)}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="border-t border-line pt-4">
          <Cta onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden="true" />
            Add Payout Method
          </Cta>
        </div>
      )}
    </div>
  );
}
