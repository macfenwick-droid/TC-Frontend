"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { Cta } from "@/components/brand/cta";
import { TEAMS, type Team } from "@/data/teams";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getStoredGclid } from "@/lib/attribution";
import { saveSubmission } from "@/lib/submission";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { ComboBox, FieldLabel, StepHeading, StepProgress, fieldClass, toQuantity } from "./form-bits";
import { handleSubmitError, trackSubmitted } from "./submit";

/** Port of the current site's SeasonTicketForm: seats → pick games → sign in → submit. */

interface SeasonFormData {
  team: string;
  section: string;
  row: string;
  seats: string;
  quantity: number | "";
  faceValue: number | "";
}

const initialFormData: SeasonFormData = { team: "", section: "", row: "", seats: "", quantity: "", faceValue: "" };

const SPORTS = ["NFL", "NBA", "MLB", "NHL", "MLS"];

const formatDate = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const teamGroups = SPORTS.map((sport) => ({
  heading: sport,
  options: TEAMS.filter((t) => t.sport === sport).map((t) => ({ value: t.name, label: t.name })),
})).filter((g) => g.options.length > 0);

export function SeasonTicketForm() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SeasonFormData>(initialFormData);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const selectedTeam: Team | undefined = TEAMS.find((t) => t.name === formData.team);
  const games = selectedTeam?.games.filter((g) => g.time) ?? [];

  const updateField = <K extends keyof SeasonFormData>(field: K, value: SeasonFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () =>
    !!(formData.team && formData.section && formData.row && Number(formData.quantity) > 0 && Number(formData.faceValue) > 0);
  const validateStep2 = () => selectedGames.length > 0;

  const nextStep = () => {
    if (validateStep1()) {
      setSelectedGames([]);
      setStep(2);
    } else {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
    }
  };

  const toggleGame = (gameId: string) => {
    setSelectedGames((prev) => (prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]));
  };

  const persistSeasonTickets = async () => {
    if (!validateStep2()) {
      toast({ title: "No Games Selected", description: "Please select at least one game.", variant: "destructive" });
      return;
    }
    const picked = selectedTeam?.games.filter((g) => selectedGames.includes(g.id)) ?? [];
    try {
      setIsSubmitting(true);
      const created = await api.createSeasonTicketGroups({
        team: formData.team,
        section: formData.section,
        row: formData.row,
        seat_numbers: formData.seats || null,
        quantity: Number(formData.quantity),
        face_value: Number(formData.faceValue),
        games: picked.map((g) => ({ name: g.name, date: g.date, time: g.time, venue: g.venue, state: g.state })),
        gclid: getStoredGclid(),
      });
      saveSubmission({
        kind: "season",
        orderIds: created?.ticket_group_ids ?? [],
        team: formData.team,
        section: formData.section,
        row: formData.row,
        seats: formData.seats,
        quantity: Number(formData.quantity),
        faceValue: Number(formData.faceValue),
        games: picked.map((g) => ({ name: g.name, date: g.date, time: g.time, venue: g.venue, state: g.state })),
      });
      trackSubmitted(user, {
        id: formData.team,
        name: `${formData.team} season tickets`,
        quantity: Number(formData.quantity),
      });
      toast({
        title: "Submitted Successfully!",
        description: `We'll send you offers for ${picked.length} game${picked.length > 1 ? "s" : ""} shortly.`,
      });
      router.push("/thank-you");
    } catch (error) {
      if (handleSubmitError(error, "season tickets") === "reauth") {
        setPendingSubmit(true);
        setAuthModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      nextStep();
      return;
    }
    if (!validateStep2()) {
      toast({ title: "No Games Selected", description: "Please select at least one game.", variant: "destructive" });
      return;
    }
    if (!user && !loading) {
      setPendingSubmit(true);
      setAuthModalOpen(true);
      return;
    }
    void persistSeasonTickets();
  };

  const submitAfterSignIn = useEffectEvent(() => {
    setAuthModalOpen(false);
    setPendingSubmit(false);
    void persistSeasonTickets();
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to sign-in finishing (auth state is external to this form)
    if (pendingSubmit && user) submitAfterSignIn();
  }, [pendingSubmit, user]);

  const allSelected = games.length > 0 && selectedGames.length === games.length;

  return (
    <>
      <StepProgress steps={["Your Seats", "Pick Games"]} current={step} />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex animate-rise flex-col gap-6 rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_60px_-36px_rgba(22,19,31,0.3)] [animation-delay:0.1s] sm:p-9"
      >
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <StepHeading title="Your Seat Details" subtitle="Tell us about your season tickets" />

            <div>
              <FieldLabel htmlFor="team">Team *</FieldLabel>
              <ComboBox
                id="team"
                value={formData.team}
                onChange={(v) => updateField("team", v)}
                groups={teamGroups}
                placeholder="Search team..."
                searchPlaceholder="Type team name..."
                emptyText="No team found."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="section">Section *</FieldLabel>
                <input
                  id="section"
                  placeholder="e.g., 101"
                  value={formData.section}
                  onChange={(e) => updateField("section", e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="row">Row *</FieldLabel>
                <input
                  id="row"
                  placeholder="e.g., A"
                  value={formData.row}
                  onChange={(e) => updateField("row", e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="seats">Seats</FieldLabel>
                <input
                  id="seats"
                  placeholder="e.g., 1-4"
                  value={formData.seats}
                  onChange={(e) => updateField("seats", e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="quantity">Number of Tickets *</FieldLabel>
                <input
                  id="quantity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g., 2"
                  value={formData.quantity}
                  onChange={(e) => updateField("quantity", toQuantity(e.target.value))}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="faceValue">Face Value per Ticket *</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 mt-1 -translate-y-1/2 font-medium text-subtle">$</span>
                <input
                  id="faceValue"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  placeholder="0.00"
                  value={formData.faceValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    updateField("faceValue", val ? parseFloat(val) : "");
                  }}
                  className={cn(fieldClass, "pl-8")}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <StepHeading title="Select Games" subtitle={`${selectedTeam?.name ?? ""} — pick the games you want to sell`} />

            {games.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedGames(allSelected ? [] : games.map((g) => g.id))}
                  className="w-fit text-sm font-bold text-link hover:text-ink"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>

                {games.map((game) => {
                  const checked = selectedGames.includes(game.id);
                  return (
                    <button
                      key={game.id}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleGame(game.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                        checked ? "border-ink bg-mint" : "border-line bg-white hover:border-subtle"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                          checked ? "border-ink bg-ink text-brand" : "border-line bg-white"
                        )}
                      >
                        {checked && <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] leading-tight font-semibold">{game.name}</span>
                        <span className="mt-1 block text-sm text-ink-2">
                          {formatDate(game.date)} · {formatTime(game.time)}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {game.venue}, {game.state}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No games scheduled for this team.</p>
            )}

            {selectedGames.length > 0 && (
              <div className="sticky bottom-3 rounded-full bg-ink px-5 py-2.5 text-center text-sm font-bold text-white shadow-lg" aria-live="polite">
                {selectedGames.length} game{selectedGames.length > 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-bold hover:bg-cream"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          <Cta type="submit" size="lg" withArrow disabled={step === 2 && (isSubmitting || selectedGames.length === 0)}>
            {step < 2 ? "Continue" : isSubmitting ? "Submitting..." : "Get My Offers"}
          </Cta>
        </div>
      </form>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
