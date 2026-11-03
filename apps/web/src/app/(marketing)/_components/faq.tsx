"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./utils";
import { faq } from "../_content/landing-content";
import { Rails } from "./primitives";

export function FaqSection() {
  const [expanded, setExpanded] = useState(false);
  const items = expanded ? faq.items : faq.items.slice(0, faq.visibleCount);
  const hasMore = faq.items.length > faq.visibleCount;

  return (
    <section id={faq.id} className="border-b border-(--lp-line)">
      <Rails innerClassName="grid lg:grid-cols-[0.66fr_1fr]">
        <h2 className="px-8 pb-10 pt-16 text-4xl font-medium leading-[1.15] tracking-[-1.5px] text-(--lp-ink) md:px-16 md:pt-17.5 md:text-[44px] md:leading-13">
          {faq.title}
        </h2>

        <div className="flex flex-col border-(--lp-line) lg:border-l lg:pt-17.5">
          {items.map((item: { question: string; answer: string }) => (
            <details
              key={item.question}
              className="border-t border-(--lp-line) bg-white"
            >
              <summary className="flex items-center justify-between gap-6 px-6 py-6 text-lg tracking-[-0.4px] text-(--lp-ink)">
                {item.question}
                <span aria-hidden="true" className="relative size-4 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-(--lp-ink)" />
                  <span className="lp-plus-v absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-(--lp-ink) transition-transform" />
                </span>
              </summary>
              <p className="px-6 pb-6 text-base leading-7 text-(--lp-body)">
                {item.answer}
              </p>
            </details>
          ))}

          {hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="flex items-center justify-center gap-2 border-t border-(--lp-line) bg-white py-5 text-lg text-(--lp-ink)"
            >
              {expanded ? "View fewer questions" : "View more questions"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>
          ) : null}
        </div>
      </Rails>
    </section>
  );
}
