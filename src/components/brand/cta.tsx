import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The design's pill buttons:
 *  - primary: ink pill with a green arrow circle that turns on hover
 *  - secondary: white pill with an ink outline
 *  - ghost: white pill with a light border (header secondary actions)
 *  - light: white pill for use on ink backgrounds
 */
export const ctaVariants = cva(
  "group/cta inline-flex shrink-0 items-center justify-center gap-3 rounded-full font-bold whitespace-nowrap no-underline transition-[transform,background-color,box-shadow] duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-white shadow-[0_12px_24px_-14px_rgba(22,19,31,0.6)] hover:text-white",
        secondary: "border-[1.5px] border-ink bg-white text-ink hover:bg-butter",
        ghost: "border border-line bg-white text-ink hover:bg-mint",
        light: "bg-white text-ink hover:bg-mint",
      },
      size: {
        sm: "min-h-11 px-4 text-sm",
        md: "min-h-12 px-6 text-base",
        lg: "min-h-14 px-7 text-[17px]",
      },
      withArrow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { withArrow: true, size: "sm", className: "py-1 pr-1 pl-4" },
      { withArrow: true, size: "md", className: "py-1.5 pr-1.5 pl-6" },
      { withArrow: true, size: "lg", className: "py-1.5 pr-1.5 pl-7" },
    ],
    defaultVariants: { variant: "primary", size: "md", withArrow: false },
  }
);

const arrowSize = { sm: "size-9", md: "size-10", lg: "size-11" } as const;

/** Green circle with an arrow, rotates -45° on hover of the parent CTA. */
export function ArrowCircle({ size = "md" }: { size?: keyof typeof arrowSize }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-full bg-brand text-ink transition-transform duration-300 group-hover/cta:-rotate-45",
        arrowSize[size]
      )}
    >
      <ArrowRight className="size-5" strokeWidth={2.4} />
    </span>
  );
}

type CtaStyleProps = VariantProps<typeof ctaVariants> & { className?: string; children: ReactNode };

type CtaLinkProps = CtaStyleProps & { href: string; external?: boolean } & Omit<
    ComponentProps<"a">,
    "href" | "className" | "children"
  >;

type CtaButtonProps = CtaStyleProps & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

/** Pill CTA. Renders a Next <Link> with `href`, an <a target=_blank> with `external`, else a <button>. */
export function Cta(props: CtaLinkProps | CtaButtonProps) {
  const { variant, size, withArrow, className, children } = props;
  const classes = cn(ctaVariants({ variant, size, withArrow }), className);
  const inner = (
    <>
      {children}
      {withArrow && <ArrowCircle size={size ?? "md"} />}
    </>
  );

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, size: _s, withArrow: _w, className: _c, children: _ch, href, external, ...rest } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {inner}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, withArrow: _w, className: _c, children: _ch, href: _h, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes} {...rest}>
      {inner}
    </button>
  );
}
