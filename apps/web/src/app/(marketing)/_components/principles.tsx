"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "./utils";
import { deterministicEngine } from "../_content/landing-content";
import { LinkButton } from "./primitives";

const SLIDE_MS = 7000;
export function PrinciplesSection() {
  const layers = deterministicEngine.layers;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const layer = layers[index]!;

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % layers.length),
      SLIDE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [index, paused, layers.length]);

  const go = (step: number) =>
    setIndex((current) => (current + step + layers.length) % layers.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={deterministicEngine.title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="lp-paint relative bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(11, 17, 16, 0.68) 0%, rgba(18, 28, 27, 0.52) 48%, rgba(18, 28, 27, 0.28) 100%), url(/images/ai-support-landscape.jpg)",
      }}
    >
      <div className="mx-auto max-w-360 px-4 pb-14 pt-16 md:px-6 md:pb-16 md:pt-20 lg:px-24">
        <h2 className="text-center text-[34px] font-medium leading-[1.15] tracking-[-1.2px] md:text-5xl md:leading-14.5 md:tracking-[-1.5px]">
          {deterministicEngine.title}
        </h2>

        <div
          key={layer.title}
          className="lp-fade mt-14 grid items-center gap-12 lg:grid-cols-[1fr_1fr]"
        >
          <div className="flex max-w-115 flex-col">
            <p className="text-xl font-bold uppercase tracking-[0.04em]">
              {layer.title}
            </p>
            <p className="mt-6 text-[40px] font-normal leading-none tracking-[-1px]">
              {layer.number}
            </p>
            <p className="mt-2 text-sm text-white/90">
              of {String(layers.length).padStart(2, "0")} support stages
            </p>
            <p className="mt-8 text-2xl leading-8 tracking-[-0.4px] md:text-[26px]">
              “{layer.description}”
            </p>
            <p className="mt-6 text-base text-white">
              {deterministicEngine.eyebrow}
            </p>
            <p className="mt-1 text-base text-white/70">
              {deterministicEngine.description}
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <ul className="flex w-full max-w-115 flex-col border border-white/60 bg-white/65 backdrop-blur-md">
              {layer.components.map((component, componentIndex) => (
                <li
                  key={component}
                  className="flex items-center justify-between border-b border-white/30 px-5 py-4 text-lg text-[#121212] last:border-b-0"
                >
                  {component}
                  <span className="font-mono text-xs text-[#121212]/60">
                    {String(componentIndex + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous layer"
            className="flex size-7.5 items-center justify-center rounded-full border border-white/60 transition-colors hover:bg-white/15"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next layer"
            className="flex size-7.5 items-center justify-center rounded-full border border-white/60 transition-colors hover:bg-white/15"
          >
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-center">
          <div
            className="flex flex-wrap gap-x-5 gap-y-3"
            role="tablist"
            aria-label="Support workflow stages"
          >
            {layers.map((item, itemIndex) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "flex flex-col gap-2 text-left text-xl font-bold uppercase tracking-[0.02em] transition-colors",
                  itemIndex === index
                    ? "text-white"
                    : "text-white/55 hover:text-white/80",
                )}
              >
                {item.title}
                <span className="h-0.75 w-full bg-white/25">
                  {itemIndex === index ? (
                    <span
                      key={`${index}-${paused}`}
                      className="lp-progress block h-full w-full bg-white"
                      style={{
                        ["--lp-duration" as string]: `${SLIDE_MS}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <LinkButton
            href="#portal-access"
            tone="white"
            arrow
            size="lg"
            className="lg:ml-6"
            style={{ color: "#121212" }}
          >
            Access Author Portal
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
