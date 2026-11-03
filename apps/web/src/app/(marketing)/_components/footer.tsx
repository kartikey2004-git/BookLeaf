import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { footer, product, roadmap } from "../_content/landing-content";
import { HashLink } from "./hash-link";
import { Logo } from "./header";
import { LinkButton } from "./primitives";

type FooterLink = { label: string; href: string };

const footerLinks: readonly FooterLink[] = footer.columns.flatMap(
  (column): readonly FooterLink[] => column.links,
);
const contactHref =
  footerLinks.find((link) => link.href.startsWith("mailto:"))?.href ??
  "#portal-access";

function FooterAnchor({ link }: { link: FooterLink }) {
  const className =
    "text-[15px] leading-7 text-white/65 transition-colors hover:text-white";

  return link.href.startsWith("#") ? (
    <HashLink href={link.href} className={className}>
      {link.label}
    </HashLink>
  ) : (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );
}

export function SiteFooter() {
  const columns: { title: string; links: readonly FooterLink[] }[] = [
    ...footer.columns,
    {
      title: "Workflows",
      links: product.features.map((feature) => ({
        label: feature.title,
        href: "#product",
      })),
    },
    {
      title: "Roadmap",
      links: roadmap.phases.map((phase) => ({
        label: `${phase.version}: ${phase.title}`,
        href: "#roadmap",
      })),
    },
  ];

  return (
    <footer className="bg-[#121212] text-white">
      <div className="mx-auto max-w-360 px-4 pt-14 md:px-6 md:pt-12.5">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.6fr] lg:gap-16">
          <div className="flex flex-col items-start">
            <span className="origin-left scale-[1.6]">
              <Logo inverted />
            </span>
            <p className="mt-10 max-w-115 text-lg leading-6 text-white/90">
              {footer.brand.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton
                href="#portal-access"
                tone="white"
                size="lg"
                arrow
                className="h-11.75"
              >
                Access Author Portal
              </LinkButton>
              <LinkButton
                href={contactHref}
                tone="glass"
                size="lg"
                className="h-11.75 bg-transparent"
              >
                Contact us
              </LinkButton>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4"
          >
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <p className="text-[13px] font-semibold uppercase text-white">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-1">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 border-t border-white/15 pb-8 pt-10">
          <a
            href={contactHref}
            className="group flex flex-wrap items-center gap-x-6 text-[44px] font-medium leading-[1.05] tracking-[-2px] text-white sm:text-[64px] lg:text-[120px] lg:tracking-[-4px]"
          >
            <span>How can we help?</span>
            <span className="flex items-center gap-2">
              Contact Us
              <ArrowRight
                className="size-10 transition-transform group-hover:translate-x-2 lg:size-20"
                strokeWidth={1.5}
              />
            </span>
          </a>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-white/55">
            <p>{footer.bottom.copyright}</p>
            <div className="flex items-center gap-2.5 text-white/75">
              <Image
                src={footer.bottom.credit.avatarSrc}
                alt={footer.bottom.credit.avatarAlt}
                width={32}
                height={32}
                className="size-8 rounded-full border border-white/20 object-cover"
              />
              <span>{footer.bottom.credit.label}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
