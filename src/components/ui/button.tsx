import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary:
    "bg-ink-button text-ivory hover:bg-ink disabled:bg-stone/40 disabled:text-ivory",
  secondary:
    "border border-ink/20 bg-transparent text-ink hover:bg-sand disabled:text-stone",
} as const;

const base =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-terracotta disabled:cursor-not-allowed";

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
