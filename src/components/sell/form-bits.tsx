"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export { fieldClass, FieldLabel } from "@/components/brand/field";
import { fieldClass } from "@/components/brand/field";

/** Two-segment progress bar from the design ("Event" / "Seats"). */
export function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol aria-label="Progress" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-col gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "h-2 rounded-full transition-colors duration-300",
                done ? "bg-brand" : active ? "bg-ink" : "bg-line"
              )}
            />
            <span className={cn("flex items-center gap-1.5 text-[13px] font-bold", n <= current ? "text-ink" : "text-subtle")}>
              {done && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
              {n}. {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Heading inside the form card for each step. */
export function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[28px] leading-tight font-bold">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

type ComboGroup = { heading?: string; options: { value: string; label: string }[] };

/** Searchable single-select (popover + command list), styled like the other fields. */
export function ComboBox({
  id,
  value,
  displayValue,
  onChange,
  groups,
  placeholder,
  searchPlaceholder = "Search…",
  emptyText,
  loading,
  footer,
}: {
  id?: string;
  value: string;
  /** Text shown in the trigger; defaults to the value. */
  displayValue?: string;
  onChange: (value: string) => void;
  groups: ComboGroup[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyText: string;
  loading?: boolean;
  /** Extra item under the list (e.g. "Add manually"). Receives a close callback. */
  footer?: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const close = () => setOpen(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(fieldClass, "flex items-center justify-between gap-2 text-left", !value && "font-normal text-subtle")}
        >
          <span className="truncate">{displayValue || value || (loading ? "Loading…" : placeholder)}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent id={listId} className="w-(--radix-popover-trigger-width) rounded-2xl p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : emptyText}</CommandEmpty>
            {groups.map((g, gi) => (
              <CommandGroup key={g.heading ?? gi} heading={g.heading}>
                {g.options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => {
                      onChange(o.value);
                      close();
                    }}
                  >
                    {o.label}
                    <Check className={cn("ml-auto size-4", value === o.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {footer?.(close)}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Keeps only digits; returns "" for empty so the field can be cleared. */
export function toQuantity(raw: string): number | "" {
  const val = raw.replace(/[^0-9]/g, "");
  return val ? parseInt(val, 10) : "";
}
