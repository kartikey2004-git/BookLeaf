"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { cn } from "./utils";
import {
  architectureGraph,
  messaging,
  product,
} from "../_content/landing-content";
import {
  ArrowLink,
  PlannedBadge,
  Rails,
  SplitHeading,
} from "./primitives";

type Feature = (typeof product.features)[number];

function featureById<Id extends Feature["id"]>(id: Id) {
  return product.features.find((feature) => feature.id === id) as Extract<
    Feature,
    { id: Id }
  >;
}

function isPlanned(feature: Feature) {
  return feature.status === "planned";
}

function Chips({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg text-[#4A4A4A]">{title}</p>
      <div className="flex flex-wrap gap-2.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded border border-[#D3D2CD] px-3.5 py-2 text-sm text-[#2B2B2B]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Accordion({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <div className="border-t border-[#D3D2CD]">
      {items.map((item) => (
        <details key={item.title} className="group border-b border-[#D3D2CD]">
          <summary className="flex items-center justify-between gap-4 py-4 text-lg text-[#4A4A4A]">
            {item.title}
            <ChevronDown className="lp-chevron size-4 shrink-0 transition-transform" />
          </summary>
          <p className="pb-5 text-base leading-6 text-[#6F6E6A]">{item.body}</p>
        </details>
      ))}
    </div>
  );
}

function Example({ text, caption }: { text: string; caption: string }) {
  return (
    <figure className="flex flex-col gap-4">
      <blockquote className="flex gap-3 text-lg leading-7 text-[#4A4A4A]">
        <Quote className="mt-1 size-4 shrink-0 text-[#8A8985]" />
        <span>{text}</span>
      </blockquote>
      <figcaption className="pl-7 text-sm text-[#6F6E6A]">{caption}</figcaption>
    </figure>
  );
}

type Tab = {
  id: string;
  label: string;
  icon: string;
  title: string;
  description: string;
  planned: boolean;
  extra: ReactNode;
};

function buildTabs(): Tab[] {
  const generate = featureById("new-project");
  const analyze = featureById("repo-analysis");
  const readiness = featureById("production-readiness");
  const fixes = featureById("fixes");
  const migrations = featureById("migrations");

  return [
    {
      id: "tab-generate",
      label: "Start",
      icon: generate.icon,
      title: generate.title,
      description: generate.description,
      planned: isPlanned(generate),
      extra: (
        <Example
          text={generate.input.content}
          caption="Start from the book or support question you need help with."
        />
      ),
    },
    {
      id: "tab-analyze",
      label: "Overview",
      icon: analyze.icon,
      title: analyze.title,
      description: analyze.description,
      planned: isPlanned(analyze),
      extra: (
        <Chips title="What can you review?" items={analyze.output.items} />
      ),
    },
    {
      id: "tab-readiness",
      label: "Royalties",
      icon: readiness.icon,
      title: readiness.title,
      description: readiness.description,
      planned: isPlanned(readiness),
      extra: (
        <Chips
          title="What can you find?"
          items={readiness.score.categories.map((category) => category.name)}
        />
      ),
    },
    {
      id: "tab-fixes",
      label: "Support",
      icon: fixes.icon,
      title: fixes.title,
      description: fixes.description,
      planned: isPlanned(fixes),
      extra: (
        <Chips
          title="What can you do?"
          items={fixes.fixes.map((fix) => fix.title)}
        />
      ),
    },
    {
      id: "tab-migrations",
      label: "Workflow",
      icon: migrations.icon,
      title: migrations.title,
      description: migrations.description,
      planned: isPlanned(migrations),
      extra: (
        <Accordion
          items={migrations.migration.map((phase) => ({
            title: phase.phase,
            body: phase.steps.join(" → "),
          }))}
        />
      ),
    },
    {
      id: architectureGraph.id,
      label: "Connected support",
      icon: "network",
      title: architectureGraph.title,
      description: architectureGraph.description,
      planned: false,
      extra: (
        <Accordion
          items={architectureGraph.capabilities.map((capability) => ({
            title: capability.title,
            body: capability.description,
          }))}
        />
      ),
    },
  ];
}

export function ProductTabsSection() {
  const tabs = buildTabs();
  const [active, setActive] = useState(tabs[0]!.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = tabs.findIndex((tab) => tab.id === active);
  const activeTab = tabs[activeIndex] ?? tabs[0]!;

  const selectTab = (index: number, focus = false) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    setActive(tabs[nextIndex]!.id);
    if (focus) tabRefs.current[nextIndex]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(index + 1, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(index - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(tabs.length - 1, true);
    }
  };

  return (
    <section id={product.id} className="border-b border-[#D3D2CD]">
      <Rails innerClassName="bg-[#F5F4F0]">
        <div className="grid gap-8 px-6 pb-12 pt-20 md:px-10 md:pt-24 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
          <div className="flex flex-col items-start gap-7">
            <SplitHeading
              muted="BookLeaf Author Portal"
              strong={messaging.short}
            />
          </div>
          <p className="text-lg leading-7 text-[#121212] lg:pt-10">
            {product.description}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Workflows"
          aria-orientation="horizontal"
          className="sticky top-16 z-30 flex snap-x snap-mandatory overflow-x-auto border-y border-[#D3D2CD] bg-[#F5F4F0] scrollbar-none"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${tab.id}-tab`}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`${tab.id}-panel`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                "relative min-w-31.25 shrink-0 snap-start border-r border-[#D3D2CD] px-4 py-3 text-sm whitespace-nowrap transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#121212] last:border-r-0 sm:min-w-37.5 sm:text-base md:min-w-0 md:flex-1",
                active === tab.id
                  ? "bg-[#121212] text-white"
                  : "text-[#4A4A4A] hover:text-[#121212]",
              )}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 -bottom-px h-0.5 transition-opacity",
                  active === tab.id
                    ? "bg-white opacity-100"
                    : "bg-[#121212] opacity-0",
                )}
              />
            </button>
          ))}
        </div>

        <article
          key={activeTab.id}
          id={`${activeTab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${activeTab.id}-tab`}
          className="lp-fade border-b border-[#D3D2CD] bg-white"
        >
          <div className="grid w-full lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col items-start bg-white px-5 py-10 sm:px-6 sm:py-12 lg:px-12 lg:py-14">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium uppercase tracking-[0.12em] text-[#6F6E6A]">
                  {activeTab.label}
                </span>
                {activeTab.planned ? <PlannedBadge /> : null}
              </div>
              <h3 className="mt-6 max-w-115 text-[28px] font-medium leading-9 tracking-[-1px] text-[#121212] sm:text-[32px] sm:leading-10">
                {activeTab.title}
              </h3>
              <p className="mt-4 max-w-115 text-lg leading-7 text-[#6F6E6A]">
                {activeTab.description}
              </p>
              <ArrowLink href="#portal-access" className="mt-8">
                {activeTab.planned ? "Learn more" : "Open the portal"}
              </ArrowLink>
            </div>
            <div className="border-t border-[#D3D2CD] bg-white px-5 py-8 sm:px-6 sm:py-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-14">
              {activeTab.extra}
            </div>
          </div>
        </article>
      </Rails>
    </section>
  );
}
