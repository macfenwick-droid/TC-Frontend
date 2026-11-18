"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Loader2, MapPin, Plus, Search, X } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { Cta } from "@/components/brand/cta";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError, type SellEvent, type SellSection } from "@/lib/api";
import { getStoredGclid } from "@/lib/attribution";
import { saveSubmission } from "@/lib/submission";
import { formatEventDate, parseLocal } from "@/lib/event-date";
import { takeSellEvent } from "@/lib/sell-handoff";
import { STATES_AND_PROVINCES } from "@/lib/states";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { ComboBox, FieldLabel, StepHeading, StepProgress, fieldClass, toQuantity } from "./form-bits";
import { handleSubmitError, trackSubmitted } from "./submit";

/**
 * Port of the current site's TicketForm: 2 steps (event → seats), event search via
 * findticker with a manual fallback, sign-in on submit, then /thank-you.
 */

interface FormData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  state: string;
  section: string;
  row: string;
  seats: string;
  quantity: number | "";
  limitedView: boolean;
  primarySite: string;
  findtickerEventId: string; // set when the event was chosen via search
  ftLocalDate: string; // raw findticker local_date, for pretty display
}

const initialFormData: FormData = {
  eventName: "",
  eventDate: "",
  eventTime: "",
  venue: "",
  state: "",
  section: "",
  row: "",
  seats: "",
  quantity: "",
  limitedView: false,
  primarySite: "",
  findtickerEventId: "",
  ftLocalDate: "",
};

const PRIMARY_SITES = ["Ticketmaster", "AXS", "SeatGeek", "Paciolan", "Livenation", "MLB"];

const pillClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] px-[18px] text-[15px] font-bold transition-colors",
    active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
  );

export function TicketForm() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"search" | "manual">("search");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomPrimarySite, setShowCustomPrimarySite] = useState(false);
  const [showCustomState, setShowCustomState] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // event search (findticker)
  const [eventQuery, setEventQuery] = useState("");
  const [eventResults, setEventResults] = useState<SellEvent[] | null>(null);
  const [searchingEvents, setSearchingEvents] = useState(false);
  const [showEventDrop, setShowEventDrop] = useState(false);

  // section/row lists (findticker)
  const [sections, setSections] = useState<SellSection[] | null>(null);
  const [rows, setRows] = useState<string[] | null>(null);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasFtEvent = mode === "search" && !!formData.findtickerEventId;
  const queryReady = eventQuery.trim().length >= 2;

  const applyEvent = (ev: SellEvent) => {
    const { date, time } = parseLocal(ev.local_date);
    setFormData((prev) => ({
      ...prev,
      eventName: ev.name || "",
      eventDate: date,
      eventTime: time,
      venue: ev.venue || "",
      state: ev.city || "",
      findtickerEventId: ev.event_id,
      ftLocalDate: ev.local_date || "",
      section: "",
      row: "",
    }));
    setEventQuery(ev.name || "");
    setShowEventDrop(false);
    setEventResults(null);
    setSections(null);
    setRows(null);
  };

  const clearEvent = () => {
    setFormData((prev) => ({
      ...prev,
      findtickerEventId: "",
      ftLocalDate: "",
      eventName: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      state: "",
      section: "",
      row: "",
    }));
    setEventQuery("");
    setSections(null);
    setRows(null);
  };

  // An event picked on the full-results page (/sell/search) arrives via sessionStorage.
  const applyHandoff = useEffectEvent(() => {
    const pre = takeSellEvent();
    if (pre) {
      setMode("search");
      applyEvent(pre);
    }
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of external storage after mount (not available during prerender)
    applyHandoff();
  }, []);

  // Debounced event search for the inline dropdown.
  useEffect(() => {
    if (mode !== "search" || formData.findtickerEventId) return;
    const q = eventQuery.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearchingEvents(true);
      try {
        const r = await api.ticketPricingSearch(q);
        if (cancelled) return;
        setEventResults(r);
        setShowEventDrop(true);
      } catch (err) {
        if (cancelled) return;
        setEventResults([]);
        if (err instanceof ApiError && err.status === 429) {
          toast({ title: "Slow down a moment", description: err.message, variant: "destructive" });
        }
      } finally {
        if (!cancelled) setSearchingEvents(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [eventQuery, mode, formData.findtickerEventId]);

  const loadSections = (eventId: string) => {
    setLoadingSections(true);
    api
      .ticketPricingSections(eventId)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false));
  };

  const selectSection = (sec: string) => {
    setFormData((prev) => ({ ...prev, section: sec, row: "" }));
    setRows(null);
    if (formData.findtickerEventId) {
      setLoadingRows(true);
      api
        .ticketPricingRows(formData.findtickerEventId, sec)
        .then(setRows)
        .catch(() => setRows([]))
        .finally(() => setLoadingRows(false));
    }
  };

  const goToAllResults = () => {
    const q = eventQuery.trim();
    if (q.length < 2) {
      toast({ title: "Type an event name", description: "Enter at least 2 characters to search.", variant: "destructive" });
      return;
    }
    router.push(`/sell/search?q=${encodeURIComponent(q)}`);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (mode === "search") {
        return !!(formData.findtickerEventId && formData.eventName && formData.eventDate);
      }
      return !!(
        formData.eventName &&
        formData.eventDate &&
        formData.eventTime &&
        formData.venue &&
        formData.state &&
        formData.primarySite
      );
    }
    if (currentStep === 2) {
      return !!(formData.section && formData.row && Number(formData.quantity) > 0);
    }
    return false;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      // Load sections when we reach step 2 with a searched event.
      if (hasFtEvent && sections === null && !loadingSections) loadSections(formData.findtickerEventId);
      setStep(2);
    } else {
      toast({
        title: mode === "search" && step === 1 ? "Pick your event" : "Missing Information",
        description:
          mode === "search" && step === 1
            ? "Search and select your event, or switch to entering it manually."
            : "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => setStep(1);

  const persistTicketGroup = async () => {
    if (!validateStep(2)) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await api.createTicketGroup({
        event_name: formData.eventName,
        event_date: formData.eventDate,
        event_time: formData.eventTime || null,
        venue: formData.venue,
        state: formData.state,
        section: formData.section,
        row: formData.row,
        seat_numbers: formData.seats || null,
        quantity: Number(formData.quantity),
        is_restricted_view: formData.limitedView,
        primary_site: formData.primarySite || null,
        findticker_event_id: formData.findtickerEventId || null,
        gclid: getStoredGclid(),
      });
      saveSubmission({
        kind: "single",
        orderId: created?.ticket_group_id ?? null,
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        venue: formData.venue,
        state: formData.state,
        section: formData.section,
        row: formData.row,
        seats: formData.seats,
        quantity: Number(formData.quantity),
        restrictedView: formData.limitedView,
        primarySite: formData.primarySite,
      });
      trackSubmitted(user, { id: formData.eventName, name: formData.eventName, quantity: formData.quantity });
      toast({ title: "Submitted Successfully!", description: "We'll send you an offer shortly." });
      router.push("/thank-you");
    } catch (error) {
      // Session died between loading the form and submitting it: sign in again, then
      // the effect below resubmits.
      if (handleSubmitError(error, "tickets") === "reauth") {
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
    if (!validateStep(2)) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!user && !loading) {
      setPendingSubmit(true);
      setAuthModalOpen(true);
      return;
    }
    void persistTicketGroup();
  };

  // Submit right after the visitor signs in from the modal.
  const submitAfterSignIn = useEffectEvent(() => {
    setAuthModalOpen(false);
    setPendingSubmit(false);
    void persistTicketGroup();
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to sign-in finishing (auth state is external to this form)
    if (pendingSubmit && user) submitAfterSignIn();
  }, [pendingSubmit, user]);

  const stateLabel = formData.state
    ? STATES_AND_PROVINCES.find((s) => s.value === formData.state || s.label === formData.state)?.label || formData.state
    : "";

  return (
    <>
      <StepProgress steps={["Event", "Seats"]} current={step} />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex animate-rise flex-col gap-6 rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_60px_-36px_rgba(22,19,31,0.3)] [animation-delay:0.1s] sm:p-9"
      >
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <StepHeading
              title="Event Details"
              subtitle={mode === "search" ? "Search for your event" : "Enter the event manually"}
            />

            {mode === "search" &&
              (!hasFtEvent ? (
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="eventSearch">Find your event *</FieldLabel>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-4 mt-1 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
                        <input
                          id="eventSearch"
                          type="search"
                          autoComplete="off"
                          placeholder="Search team, artist or event… (e.g. Cowboys Eagles)"
                          value={eventQuery}
                          onChange={(e) => setEventQuery(e.target.value)}
                          onFocus={() => eventResults && setShowEventDrop(true)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              goToAllResults();
                            }
                          }}
                          className={cn(fieldClass, "pr-10 pl-10")}
                        />
                        {searchingEvents && (
                          <Loader2 className="absolute top-1/2 right-4 mt-1 size-4 -translate-y-1/2 animate-spin text-subtle" aria-hidden="true" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={goToAllResults}
                        className="mt-2 h-[52px] shrink-0 rounded-[14px] bg-ink px-5 font-bold text-white transition-colors hover:bg-ink-2"
                      >
                        Search
                      </button>
                    </div>

                    {/* inline dropdown of top matches */}
                    {showEventDrop && queryReady && eventResults && (
                      <div className="absolute z-20 mt-2 max-h-80 w-full overflow-hidden overflow-y-auto rounded-2xl border border-line bg-white shadow-[0_18px_32px_-16px_rgba(22,19,31,0.3)]">
                        {eventResults.length === 0 && !searchingEvents && (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            No matches. Try team names, or enter the event manually.
                          </div>
                        )}
                        {eventResults.slice(0, 8).map((ev) => (
                          <button
                            type="button"
                            key={ev.event_id}
                            onClick={() => applyEvent(ev)}
                            className="w-full border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-mint"
                          >
                            <div className="truncate text-sm font-semibold">{ev.name}</div>
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                              {formatEventDate(ev.local_date)}
                              {ev.venue ? ` • ${ev.venue}` : ""}
                              {ev.city ? `, ${ev.city}` : ""}
                            </div>
                          </button>
                        ))}
                        {eventResults.length > 8 && (
                          <button
                            type="button"
                            onClick={goToAllResults}
                            className="w-full px-4 py-2.5 text-center text-sm font-semibold text-link hover:bg-mint"
                          >
                            See all {eventResults.length} results →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className="w-fit text-sm font-semibold text-link underline underline-offset-2 hover:text-ink"
                  >
                    Can&apos;t find your event? Enter it manually
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border-[1.5px] border-brand bg-mint p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 text-xs font-bold tracking-wide text-link uppercase">Selected event</div>
                      <div className="truncate font-heading text-lg font-bold">{formData.eventName}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
                        <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                        {formatEventDate(formData.ftLocalDate) ||
                          [formData.eventDate, formData.eventTime].filter(Boolean).join(" • ")}
                      </div>
                      {(formData.venue || formData.state) && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
                          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                          {[formData.venue, formData.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearEvent}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold hover:bg-cream"
                    >
                      <X className="size-4" aria-hidden="true" /> Change
                    </button>
                  </div>
                </div>
              ))}

            {mode === "manual" && (
              <>
                <div>
                  <FieldLabel htmlFor="eventName">Event Name *</FieldLabel>
                  <input
                    id="eventName"
                    placeholder="e.g., Taylor Swift Eras Tour"
                    value={formData.eventName}
                    onChange={(e) => updateField("eventName", e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="eventDate">Event Date *</FieldLabel>
                    <input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => updateField("eventDate", e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="eventTime">Event Time *</FieldLabel>
                    <input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => updateField("eventTime", e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <fieldset className="flex flex-col gap-2.5">
                  <legend className="text-[15px] font-semibold">Primary Site *</legend>
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    {PRIMARY_SITES.map((site) => (
                      <button
                        key={site}
                        type="button"
                        aria-pressed={!showCustomPrimarySite && formData.primarySite === site}
                        onClick={() => {
                          setShowCustomPrimarySite(false);
                          updateField("primarySite", site);
                        }}
                        className={pillClass(!showCustomPrimarySite && formData.primarySite === site)}
                      >
                        {site}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-pressed={showCustomPrimarySite}
                      onClick={() => {
                        setShowCustomPrimarySite(true);
                        updateField("primarySite", "");
                      }}
                      className={pillClass(showCustomPrimarySite)}
                    >
                      <Plus className="size-4" aria-hidden="true" /> Add Custom
                    </button>
                  </div>
                  {showCustomPrimarySite && (
                    <input
                      id="primarySite"
                      aria-label="Primary site"
                      placeholder="Type the marketplace name"
                      value={formData.primarySite}
                      onChange={(e) => updateField("primarySite", e.target.value)}
                      className={fieldClass}
                      autoFocus
                    />
                  )}
                </fieldset>

                <div>
                  <FieldLabel htmlFor="venue">Venue *</FieldLabel>
                  <input
                    id="venue"
                    placeholder="e.g., Madison Square Garden"
                    value={formData.venue}
                    onChange={(e) => updateField("venue", e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="state">State / Province *</FieldLabel>
                  {showCustomState ? (
                    <input
                      id="state"
                      placeholder="Type your state or province"
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className={fieldClass}
                      autoFocus
                    />
                  ) : (
                    <ComboBox
                      id="state"
                      value={formData.state}
                      displayValue={stateLabel}
                      onChange={(v) => updateField("state", v)}
                      groups={[{ options: STATES_AND_PROVINCES.map((s) => ({ value: s.value, label: s.label })) }]}
                      placeholder="Select state..."
                      searchPlaceholder="Search state..."
                      emptyText="No state found."
                      footer={(close) => (
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setShowCustomState(true);
                              updateField("state", "");
                              close();
                            }}
                            className="mt-1 border-t font-semibold text-link"
                          >
                            <Plus className="size-4" aria-hidden="true" /> Add manually
                          </CommandItem>
                        </CommandGroup>
                      )}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setMode("search")}
                  className="w-fit text-sm font-semibold text-link underline underline-offset-2 hover:text-ink"
                >
                  Search for your event instead
                </button>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <StepHeading title="Seat Information" subtitle="Where are your seats?" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="section">Section *</FieldLabel>
                {hasFtEvent && sections && sections.length > 0 ? (
                  <ComboBox
                    id="section"
                    value={formData.section}
                    onChange={selectSection}
                    groups={[{ options: sections.map((s) => ({ value: s.section, label: s.section })) }]}
                    placeholder="Select section"
                    loading={loadingSections}
                    emptyText="No section found"
                  />
                ) : (
                  <input
                    id="section"
                    placeholder={loadingSections ? "Loading…" : "e.g., 101"}
                    value={formData.section}
                    onChange={(e) => updateField("section", e.target.value)}
                    className={fieldClass}
                  />
                )}
              </div>
              <div>
                <FieldLabel htmlFor="row">Row *</FieldLabel>
                {hasFtEvent && rows && rows.length > 0 ? (
                  <ComboBox
                    id="row"
                    value={formData.row}
                    onChange={(v) => updateField("row", v)}
                    groups={[{ options: rows.map((r) => ({ value: r, label: r })) }]}
                    placeholder="Select row"
                    loading={loadingRows}
                    emptyText="No row found"
                  />
                ) : (
                  <input
                    id="row"
                    placeholder={loadingRows ? "Loading…" : "e.g., A"}
                    value={formData.row}
                    onChange={(e) => updateField("row", e.target.value)}
                    className={fieldClass}
                  />
                )}
              </div>
            </div>
            {hasFtEvent && formData.section && rows !== null && rows.length === 0 && !loadingRows && (
              <p className="-mt-2 text-xs text-muted-foreground">No listed rows for this section — type the row above.</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="seats">Seat Numbers</FieldLabel>
                <input
                  id="seats"
                  placeholder="e.g., 1-4 (optional)"
                  value={formData.seats}
                  onChange={(e) => updateField("seats", e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="quantity">Quantity *</FieldLabel>
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

            <label
              htmlFor="limitedView"
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-cream p-4 text-[15px] font-medium"
            >
              <Checkbox
                id="limitedView"
                checked={formData.limitedView}
                onCheckedChange={(checked) => updateField("limitedView", checked === true)}
                className="size-5"
              />
              These seats have limited or obstructed view
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-bold hover:bg-cream"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span />
          )}
          <Cta type="submit" size="lg" withArrow disabled={isSubmitting}>
            {step < 2 ? "Continue" : isSubmitting ? "Submitting..." : "Get My Offer"}
          </Cta>
        </div>
      </form>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
