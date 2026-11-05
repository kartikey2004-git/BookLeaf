import Image from "next/image";
import { cn } from "./utils";
import {
  hero,
  messaging,
  platform,
  product,
  solution,
  workflow,
} from "../_content/landing-content";
import { EngineMockup, RequirementsMockup } from "./mockups";
import { ArrowLink, LinkButton, Rails, technologies } from "./primitives";

export function HeroSection() {
  return (
    <section id="top" className="relative">
      <div
        className="relative bg-[#C9D6D8] bg-cover bg-center pb-20 pt-16 md:pb-28 md:pt-20"
        style={{ backgroundImage: "url(/images/hero-sky.webp)" }}
      >
        <div className="mx-auto grid max-w-360 gap-8 px-6 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-24">
          <div className="flex max-w-4xl flex-col items-start text-left">
            <h1 className="text-[40px] font-medium leading-12 tracking-[-1.2px] text-[#121212] md:text-[56px] md:leading-16 md:tracking-[-1.5px]">
              <span className="block">{hero.headline.line1}</span>
              <span className="block">{hero.headline.highlight}</span>
              <span className="block">{hero.headline.line3}</span>
            </h1>
            <p className="mt-6 max-w-125 text-lg leading-7 text-[#121212]">
              {messaging.primary}
            </p>
            <div className="mt-9 flex flex-wrap gap-5">
              <LinkButton
                href={hero.primaryCta.href}
                tone="dark"
                accentArrow
                className="h-9.75 pl-5 text-white!"
              >
                {hero.primaryCta.label || "Access Author Portal"}
              </LinkButton>
              <LinkButton href={hero.secondaryCta.href} tone="light">
                {hero.secondaryCta.label}
              </LinkButton>
            </div>
          </div>
          <AuthorCollage />
        </div>
      </div>
    </section>
  );
}

const authorImages = [
  "/images/authors/author-reading-1.jpg",
  "/images/authors/author-reading-2.jpg",
  "/images/authors/author-reading-3.jpg",
  "/images/authors/author-reading-4.jpg",
  "/images/authors/author-reading-2.jpg",
  "/images/authors/author-reading-1.jpg",
] as const;

const collagePositions = [
  "left-[12%] top-[5%] h-[34%] w-[33%]",
  "right-[11%] top-[23%] h-[26%] w-[30%]",
  "left-[2%] top-[42%] h-[21%] w-[23%]",
  "left-[43%] top-[40%] h-[27%] w-[26%]",
  "bottom-[4%] left-[8%] h-[28%] w-[29%]",
  "bottom-[2%] right-[14%] h-[35%] w-[37%]",
] as const;

function AuthorCollage() {
  return (
    <div className="relative min-h-100 overflow-hidden lg:min-h-full">
      {authorImages.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={cn(
            "absolute overflow-hidden rounded-lg border border-white/80 bg-white shadow-[0_12px_28px_rgba(76,44,40,0.2)]",
            collagePositions[index],
          )}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 1024px) 30vw, 16vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
const wordmarkStyles = [
  "font-semibold tracking-[-0.5px]",
  "font-bold uppercase tracking-[0.08em] text-[17px]",
  "font-serif italic text-[22px]",
  "font-mono font-semibold tracking-[-0.5px]",
  "font-extrabold tracking-[-1px] text-[22px]",
  "font-medium uppercase tracking-[0.18em] text-sm",
  "font-semibold tracking-tight",
  "font-serif font-semibold text-[21px]",
];
const plusMarkers = new Set([3, 5, 9, 12]);

export function StackStrip() {
  return (
    <section
      aria-labelledby="stack-strip-title"
      className="border-y border-[#D3D2CD]"
    >
      <div className="py-12 md:py-16">
        <p
          id="stack-strip-title"
          className="text-center text-base uppercase tracking-[0.02em] text-[#4A4A4A] md:text-lg"
        >
          {hero.trustText}
        </p>

        <Rails rails={false} className="mt-10">
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {technologies.map(({ name }, index) => (
              <li
                key={name}
                className="relative flex h-17.5 items-center justify-center px-2"
              >
                <span
                  className={cn(
                    "text-center text-[19px] text-[#2B2B2B]",
                    wordmarkStyles[index % wordmarkStyles.length],
                  )}
                >
                  {name}
                </span>
                {plusMarkers.has(index) ? (
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 right-1 hidden size-5.5 items-center justify-center border border-[#D3D2CD] bg-[#F5F4F0] text-sm leading-none text-[#6F6E6A] lg:flex"
                  >
                    +
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Rails>
      </div>
    </section>
  );
}

const cardImages = {
  meadow: { src: "/images/card-meadow.webp", fallback: "#7F8C62" },
  valley: { src: "/images/card-valley.webp", fallback: "#B98455" },
} as const;

function ImageCard({
  image,
  title,
  description,
  link,
}: {
  image: keyof typeof cardImages;
  title: string;
  description: string;
  link: { label: string; href: string };
}) {
  return (
    <div
      className="flex min-h-140 flex-col bg-cover bg-center md:min-h-155"
      style={{
        backgroundColor: cardImages[image].fallback,
        backgroundImage: `url(${cardImages[image].src})`,
      }}
    >
      <div className="mt-auto bg-linear-to-t from-black/80 via-black/50 to-transparent px-6 pb-8 pt-24 text-white md:px-8">
        <h3 className="text-2xl font-medium tracking-[-0.8px] md:text-[28px]">
          {title}
        </h3>
        <p className="mt-3 max-w-130 text-base leading-7 text-white/90 md:text-lg">
          {description}
        </p>
        <ArrowLink href={link.href} className="mt-5 text-white">
          {link.label}
        </ArrowLink>
      </div>
    </div>
  );
}

export function EngineCardsSection() {
  const generate = product.features[0]!;
  const analyze = product.features[1]!;

  return (
    <section className="border-b border-[#D3D2CD]">
      <Rails>
        <h2 className="px-6 py-20 text-center text-[32px] font-medium leading-[1.2] tracking-[-1px] md:py-24 md:text-[40px] md:leading-12.5">
          {solution.title}
        </h2>
        <div className="grid border-t border-[#D3D2CD] md:grid-cols-2 [&>*+*]:border-t [&>*+*]:border-[#D3D2CD] md:[&>*+*]:border-l md:[&>*+*]:border-t-0">
          <ImageCard
            image="meadow"
            title={generate.title}
            description={generate.description}
            link={{ label: "See the workflow", href: "#product" }}
          />
          <ImageCard
            image="valley"
            title={analyze.title}
            description={analyze.description}
            link={{ label: "Explore the workflow", href: "#how-it-works" }}
          />
        </div>
      </Rails>
    </section>
  );
}

export function PlatformSection() {
  const bentoCards = [
    {
      label: "Author Portal",
      tone: "orange" as const,
      image: "/images/card-meadow.webp",
      mockup: <RequirementsMockup />,
      description:
        "A focused home for book information, royalty visibility, and support requests.",
      stages: platform.stages.slice(0, 3),
    },
    {
      label: "Support Operations",
      tone: "pink" as const,
      image: "/images/card-valley.webp",
      mockup: <EngineMockup />,
      description:
        "Practical operational assistance that helps the BookLeaf team review and respond with care.",
      stages: platform.stages.slice(3),
    },
  ];

  return (
    <section id={platform.id} className="border-b border-[#D3D2CD]">
      <Rails innerClassName="lp-dots">
        <div className="px-4 pb-16 pt-20 md:px-10 md:pb-24 md:pt-24 lg:px-14">
          <h2 className="text-center text-[32px] font-medium leading-[1.2] tracking-[-1px] md:text-[40px] md:leading-14.5">
            {platform.title}
          </h2>
          <p className="mx-auto mt-4 max-w-160 text-center text-base leading-7 text-[#4A4A4A]">
            {workflow.title}
          </p>

          <div className="mt-14 grid gap-4 lg:grid-cols-2">
            {bentoCards.map((card) => (
              <div
                key={card.label}
                className="flex min-h-155 flex-col overflow-hidden rounded-xl border border-white/50 bg-cover bg-center shadow-[0_12px_32px_-28px_rgba(18,18,18,0.5)]"
                style={{ backgroundImage: `url(${card.image})` }}
              >
                <div className="mt-auto bg-linear-to-t from-black/85 via-black/60 to-transparent px-6 pb-8 pt-28 text-white md:px-8">
                  <p
                    className={cn(
                      "text-sm font-medium uppercase tracking-[0.12em]",
                      card.tone === "orange"
                        ? "text-orange-200"
                        : "text-pink-200",
                    )}
                  >
                    {card.label}
                  </p>
                  <p className="mt-3 max-w-130 text-2xl font-medium leading-8 tracking-[-0.6px] md:text-[28px]">
                    {card.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {card.stages
                      .flatMap((stage) => stage.items)
                      .map((item) => (
                        <span
                          key={item.title}
                          className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-sm"
                        >
                          {item.title}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Rails>
    </section>
  );
}
