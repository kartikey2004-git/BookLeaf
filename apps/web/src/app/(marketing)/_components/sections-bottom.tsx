import { Check } from "lucide-react";
import { cn } from "./utils";
import {
  comparison,
  decisionEngine,
  developerExperience,
  finalCta,
  github,
  messaging,
  meta,
  roadmap,
  useCases,
  validation,
  waitlist,
} from "../_content/landing-content";
import {
  ArrowLink,
  Icon,
  LinkButton,
  Rails,
  SplitHeading,
  technologies,
} from "./primitives";

function DecisionVisual() {
  return (
    <ul className="flex flex-col gap-2">
      {decisionEngine.decisions.slice(0, 4).map((decision) => (
        <li
          key={decision.capability}
          className="flex items-center justify-between gap-3 rounded-md border border-[#E4E3DE] bg-white px-3.5 py-2.5"
        >
          <span className="text-xs uppercase tracking-wide text-[#6F6E6A]">
            {decision.capability}
          </span>
          <span className="rounded bg-[#F1F0EC] px-2 py-0.5 font-mono text-xs text-[#121212]">
            {decision.decision}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ValidationVisual() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-5">
      {validation.pipeline.map((step) => (
        <div
          key={step.step}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-[#E4E3DE] bg-white text-[11px] text-[#2B2B2B]"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-[#EAF7EF] text-[#23864A]">
            <Check className="size-3.5" />
          </span>
          {step.step}
        </div>
      ))}
    </div>
  );
}
function OrbitVisual() {
  const orbiting = technologies.slice(0, 7);
  const positions = [
    [12, 52],
    [28, 22],
    [50, 8],
    [72, 22],
    [88, 52],
    [34, 46],
    [66, 46],
  ];

  return (
    <div
      className="relative mx-auto aspect-4/3 w-full max-w-85 overflow-hidden"
      aria-hidden="true"
    >
      {[100, 72, 44].map((size) => (
        <span
          key={size}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#E4E3DE]"
          style={{ width: `${size}%`, aspectRatio: "1" }}
        />
      ))}
      {orbiting.map((technology, index) => {
        const [left, top] = positions[index]!;
        return (
          <span
            key={technology.name}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E4E3DE] bg-white px-2 py-1 text-[10px] font-semibold text-[#2B2B2B] shadow-sm"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {technology.name}
          </span>
        );
      })}
      <span className="absolute bottom-[6%] left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#121212] text-white">
        <Icon name="layers" className="size-6" />
      </span>
    </div>
  );
}

export function ReasonsSection() {
  const [explain, , , runValidation, workflowPrinciple] =
    developerExperience.principles;
  const cards = [
    { principle: explain!, visual: <DecisionVisual /> },
    { principle: runValidation!, visual: <ValidationVisual /> },
    { principle: workflowPrinciple!, visual: <OrbitVisual /> },
  ];

  return (
    <section id={developerExperience.id} className="border-b border-[#D3D2CD]">
      <Rails>
        <div className="grid gap-8 px-6 pb-12 pt-20 md:px-10 md:pt-24 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-12">
          <div className="flex flex-col items-start gap-7">
            <SplitHeading
              muted="More reasons to choose"
              strong={`${meta.name} ${messaging.positioning[3]}`}
            />
            <LinkButton href={waitlist.cta.href} arrow className="h-11.25">
              Access Author Portal
            </LinkButton>
          </div>
          <p className="text-lg leading-7 text-[#121212] lg:pt-2">
            {developerExperience.description}
          </p>
        </div>

        <div className="grid border-t border-[#D3D2CD] md:grid-cols-2">
          {[
            {
              title: comparison.title,
              body: comparison.description,
              link: { label: "Read the roadmap", href: "#roadmap" },
            },
            {
              title: github.title,
              body: github.description,
              link: { label: "See the workflow", href: "#product" },
            },
          ].map((card, index) => (
            <div
              key={card.title}
              className={cn(
                "flex flex-col items-start gap-3 px-8 py-9",
                index > 0 &&
                  "border-t border-[#D3D2CD] md:border-l md:border-t-0",
              )}
            >
              <h3 className="text-2xl font-normal leading-8 tracking-[-0.4px] text-[#121212]">
                {card.title}
              </h3>
              <p className="text-base leading-6 text-[#6F6E6A]">{card.body}</p>
              <ArrowLink href={card.link.href} className="text-base">
                {card.link.label}
              </ArrowLink>
            </div>
          ))}
        </div>

        <div className="grid border-t border-[#D3D2CD] md:grid-cols-3">
          {cards.map(({ principle, visual }, index) => (
            <div
              key={principle.title}
              className={cn(
                "flex flex-col gap-8 px-8 pb-10 pt-9",
                index > 0 &&
                  "border-t border-[#D3D2CD] md:border-l md:border-t-0",
              )}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-normal leading-8 tracking-[-0.4px] text-[#121212]">
                  {principle.title}
                </h3>
                <p className="text-base leading-6 text-[#6F6E6A]">
                  {principle.description}
                </p>
              </div>
              <div className="mt-auto">{visual}</div>
            </div>
          ))}
        </div>
      </Rails>
    </section>
  );
}

export function UseCasesSection() {
  return (
    <section id={useCases.id} className="border-b border-[#D3D2CD]">
      <Rails innerClassName="bg-white">
        <div className="px-6 pb-4 pt-10 text-center">
          <p className="text-lg uppercase text-[#4A4A4A]">{useCases.eyebrow}</p>
          <h2 className="mx-auto mt-3 max-w-180 text-[28px] font-medium leading-9 tracking-[-1px] text-[#121212] md:text-[32px] md:leading-10">
            {useCases.title}
          </h2>
        </div>
        <ul className="mt-6 grid border-t border-[#E4E3DE] sm:grid-cols-2 lg:grid-cols-3">
          {useCases.items.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-3 border-b border-[#E4E3DE] px-8 py-8 sm:odd:border-r lg:border-r lg:nth-[3n]:border-r-0 lg:nth-last-[-n+3]:border-b-0"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-[#F1F0EC] text-[#121212]">
                <Icon name={item.icon} className="size-4" />
              </span>
              <h3 className="text-xl font-medium tracking-[-0.4px] text-[#121212]">
                {item.title}
              </h3>
              <p className="text-base leading-6 text-[#6F6E6A]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </Rails>
    </section>
  );
}

export function AboutSection() {
  return (
    <section className="border-b border-[#D3D2CD]">
      <Rails>
        <div className="px-6 py-20 md:py-24">
          <h2 className="text-center text-[32px] font-medium leading-[1.2] tracking-[-1px] text-[#121212] md:text-[40px] md:leading-12.5">
            {messaging.positioning[0]} {messaging.positioning[3]}
          </h2>
          <p className="mx-auto mt-8 max-w-193 text-justify text-lg leading-7 text-[#4A4A4A]">
            {messaging.long} {roadmap.description}
          </p>
        </div>

        <ol
          id="roadmap"
          className="grid gap-px border-t border-[#D3D2CD] bg-[#D3D2CD] sm:grid-cols-2 lg:grid-cols-4"
        >
          {roadmap.phases.map((phase) => {
            const isCurrent = phase.status === "current";
            return (
              <li
                key={phase.version}
                className={cn(
                  "flex flex-col gap-4 px-7 py-8",
                  isCurrent ? "bg-white" : "bg-[#F5F4F0]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-[#6F6E6A]">
                    {phase.version}
                  </span>
                  <span
                    className={cn(
                      "rounded border px-1.5 text-[11px] capitalize leading-5",
                      isCurrent
                        ? "border-[#3FAE6A] text-[#23864A]"
                        : "border-[#D3D2CD] text-[#6F6E6A]",
                    )}
                  >
                    {phase.status}
                  </span>
                </div>
                <h3 className="text-xl font-medium tracking-[-0.4px] text-[#121212]">
                  {phase.title}
                </h3>
                <ul className="flex flex-col gap-1.5 border-t border-dashed border-[#D3D2CD] pt-4">
                  {phase.features.map((feature) => (
                    <li key={feature} className="text-sm text-[#6F6E6A]">
                      {feature}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </Rails>
    </section>
  );
}

export function ClosingCtaSection() {
  const upcoming = roadmap.phases
    .filter((phase) => phase.status !== "current")
    .flatMap((phase) => phase.features);

  return (
    <section id={waitlist.id}>
      <div
        className="bg-[#3C5644] bg-cover bg-center py-20 md:py-24"
        style={{ backgroundImage: "url(/images/cta-valley.webp)" }}
      >
        <div className="mx-auto grid max-w-360 items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:px-36">
          <div className="flex flex-col items-start text-white">
            <h2 className="text-[40px] font-medium leading-[1.12] tracking-[-1.5px] md:text-[56px] md:leading-16">
              {waitlist.title}
            </h2>
            <p className="mt-6 max-w-105 text-lg leading-7 text-white/95">
              {finalCta.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton
                href={waitlist.cta.href}
                tone="white"
                size="lg"
                arrow
                className="h-12.5"
              >
                {waitlist.submitLabel}
              </LinkButton>
              <LinkButton
                href={finalCta.secondary.href}
                tone="glass"
                size="lg"
                className="h-12.5"
              >
                {finalCta.secondary.label}
              </LinkButton>
            </div>
            <p className="mt-5 text-sm text-white/75">{waitlist.privacyNote}</p>
          </div>

          <div
            id="roadmap"
            aria-label="Coming next on the roadmap"
            className="lp-ticker-mask relative h-100 overflow-hidden bg-white/10 px-6 backdrop-blur-md md:h-120"
          >
            <ul className="lp-ticker flex flex-col gap-4 py-6">
              {[...upcoming, ...upcoming].map((feature, index) => (
                <li
                  key={`${feature}-${index}`}
                  aria-hidden={index >= upcoming.length}
                  className="text-[28px] leading-[1.2] tracking-[-0.8px] text-white/80 md:text-[34px]"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
