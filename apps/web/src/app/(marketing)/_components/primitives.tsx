import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "./utils";
import { supportedStack, WAITLIST_FORM_URL } from "../_content/landing-content";
import { HashLink } from "./hash-link";

export { Icon } from "./icons";

export type Technology = { name: string; category: string };
export const technologies: readonly Technology[] =
  supportedStack.categories.flatMap(
    (category): readonly Technology[] => category.technologies,
  );
export function Rails({
  children,
  className,
  innerClassName,
  rails = true,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  rails?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", className)}>
      <div className={cn(rails && "border-x border-[#D3D2CD]", innerClassName)}>
        {children}
      </div>
    </div>
  );
}

type PaintVariant =
  "mist" | "meadow" | "dune" | "sand" | "lavender" | "sea" | "ochre" | "valley";

export function Paint({
  variant,
  className,
  children,
}: {
  variant: PaintVariant;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("lp-paint", `lp-paint--${variant}`, className)}>
      {children}
    </div>
  );
}
function SmartLink({
  href,
  className,
  children,
  style,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  if (href === "#waitlist") {
    return (
      <a
        href={WAITLIST_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <HashLink href={href} className={className} style={style}>
        {children}
      </HashLink>
    );
  }

  return (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  );
}

const buttonStyles = {
  dark: "border-[#121212] bg-[#121212] text-white hover:bg-[#2a2a2a]",
  light: "border-[#D3D2CD] bg-white text-[#121212] hover:border-[#121212]",
  glass:
    "border-white/70 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
  white: "border-white bg-white text-[#121212] hover:bg-[#F5F4F0]",
} as const;

const buttonSizes = {
  sm: "h-10 px-3 text-sm font-medium",
  md: "h-10.75 px-5 text-base",
  lg: "h-12 px-5 text-lg",
} as const;

export function LinkButton({
  href,
  children,
  tone = "dark",
  size = "md",
  arrow = false,
  accentArrow = false,
  className,
  style,
}: {
  href: string;
  children: ReactNode;
  tone?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizes;
  arrow?: boolean;
  accentArrow?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const buttonStyle: CSSProperties = {
    color: tone === "dark" || tone === "glass" ? "#ffffff" : "#121212",
    ...style,
  };

  return (
    <SmartLink
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border transition-colors",
        buttonStyles[tone],
        buttonSizes[size],
        accentArrow && "pr-1.25",
        className,
      )}
      style={buttonStyle}
    >
      {children}
      {accentArrow ? (
        <span className="ml-1.5 flex size-7 items-center justify-center rounded bg-[#F26B21]">
          <ArrowRight className="size-3.5" />
        </span>
      ) : arrow ? (
        <ArrowRight className="size-4" />
      ) : null}
    </SmartLink>
  );
}

export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-lg text-[#121212]",
        className,
      )}
    >
      <span className="lp-link">{children}</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </SmartLink>
  );
}
export function Kicker({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-base uppercase tracking-[0.04em] text-[#4A4A4A]">
      {icon}
      {children}
    </p>
  );
}

export function PlannedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-[#E7A6C4] px-1.5 text-[11px] leading-5 text-[#C2417A]",
        className,
      )}
    >
      Planned
    </span>
  );
}
export function SplitHeading({
  muted,
  strong,
  as: Tag = "h2",
}: {
  muted: string;
  strong: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag className="text-[32px] font-medium leading-[1.2] tracking-[-1px] md:text-[40px] md:leading-12.5 md:tracking-[-1.5px]">
      <span className="block text-[#8A8985]">{muted}</span>
      <span className="block text-[#121212]">{strong}</span>
    </Tag>
  );
}
