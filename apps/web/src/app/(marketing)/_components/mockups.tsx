import { cn } from "./utils";
import {
  ArrowRight,
  Check,
  FileText,
  GitPullRequest,
  MousePointer2,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";
import {
  architectureGraph,
  github,
  product,
  solution,
  supportedStack,
} from "../_content/landing-content";

type Feature = (typeof product.features)[number];

function featureById<Id extends Feature["id"]>(id: Id) {
  return product.features.find((feature) => feature.id === id) as Extract<
    Feature,
    { id: Id }
  >;
}

function Tag({
  tone,
  children,
}: {
  tone: "blue" | "red" | "green" | "amber";
  children: string;
}) {
  const tones = {
    blue: "border-[#5B8DEF] text-[#3166D4]",
    red: "border-transparent bg-[#E5484D] text-white",
    green: "border-[#3FAE6A] text-[#23864A]",
    amber: "border-[#E2A33B] text-[#B5791A]",
  };

  return (
    <span
      className={cn(
        "rounded-full border px-1.5 text-[9px] font-semibold leading-4",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function Window({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-black/5 bg-white text-[#121212] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
export function HeroMockup() {
  const generate = featureById("new-project");
  const groups = [
    {
      title: "Identity & access",
      tag: "Must have",
      rows: [
        ["Organizations, members and invitations", "blue", "Better Auth"],
        ["Role-based access control per organization", "blue", "RBAC"],
      ],
    },
    {
      title: "Billing & storage",
      tag: "Must have",
      rows: [
        ["Subscription plans with webhook sync", "green", "Stripe"],
        ["User file uploads with signed URLs", "green", "S3"],
        ["Email notifications from background jobs", "amber", "BullMQ"],
      ],
    },
  ] as const;

  return (
    <div className="relative w-full max-w-140">
      <Window>
        {groups.map((group) => (
          <div
            key={group.title}
            className="border-b border-[#EEE] last:border-b-0"
          >
            <div className="flex items-center justify-between bg-[#FAFAF8] px-4 py-2">
              <div className="flex items-center gap-2 text-[11px] text-[#555]">
                <FileText className="size-3" />
                {group.title}
                <Tag tone="red">{group.tag}</Tag>
              </div>
              <span className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={cn(
                      "h-1.5 w-1",
                      bar < 4 ? "bg-[#E5484D]" : "bg-[#E5E5E5]",
                    )}
                  />
                ))}
              </span>
            </div>
            {group.rows.map(([label, tone, tech]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-t border-[#F1F1F1] px-4 py-3 text-[11px] font-semibold"
              >
                <span className="truncate">{label}</span>
                <Tag tone={tone}>{tech}</Tag>
              </div>
            ))}
          </div>
        ))}

        <div className="flex items-center justify-end gap-2 border-t border-[#EEE] bg-white px-4 py-3">
          <span className="rounded border border-[#DDD] px-2.5 py-1 text-[10px] font-semibold text-[#333]">
            {generate.output.items.length} details in view
          </span>
          <span className="flex items-center gap-1 rounded bg-[#2FAF64] px-2.5 py-1 text-[10px] font-semibold text-white">
            <Sparkles className="size-3" />
            Open author portal
          </span>
        </div>
      </Window>

      <MousePointer2
        aria-hidden="true"
        className="absolute bottom-1 right-16 size-8 fill-[#121212] text-white drop-shadow"
      />
    </div>
  );
}
export function RequirementsMockup() {
  return (
    <Window className="w-full">
      <div className="flex flex-col gap-4 p-5">
        <div className="h-2 w-4/5 rounded-full bg-[#EFEFEF]" />
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-[#E5E5E5] px-2.5 py-1 text-[11px] text-[#444]">
            <FileText className="size-3 text-[#3166D4]" /> BookLeaf author
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#E5E5E5] px-2.5 py-1 text-[11px] text-[#444]">
            <FileText className="size-3 text-[#3166D4]" /> publishing_overview
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-[#F1F1F1] px-5 py-4">
        <span className="flex size-7 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F5BD5]">
          <Sparkles className="size-3.5" />
        </span>
        <span className="rounded bg-[#F3F6FF] px-3 py-1.5 text-xs text-[#4F5BD5]">
          Resolving architecture graph….
        </span>
      </div>
      {["Lowest · Capability", "Medium · Dependency"].map((row) => (
        <div
          key={row}
          className="flex flex-col gap-2 border-t border-[#F1F1F1] px-5 py-3.5"
        >
          <div className="h-1.5 w-3/4 rounded-full bg-[#EFEFEF]" />
          <span className="text-[10px] text-[#999]">{row}</span>
        </div>
      ))}
    </Window>
  );
}
export function EngineMockup() {
  const menu = ["Generate", "Analyze", "Validate", "Migrate"];

  return (
    <Window className="relative w-full">
      <div className="grid grid-cols-3 gap-2 p-4 pl-[44%]">
        {["Graph", "Rules", "Executors", "Checks", "Diff", "PR"].map(
          (label) => (
            <div
              key={label}
              className="flex h-16 flex-col justify-between rounded border border-[#EEE] p-1.5"
            >
              <span className="text-[8px] text-[#666]">{label}</span>
              <svg
                viewBox="0 0 40 10"
                className="h-2.5 w-10 self-end text-[#E8955A]"
              >
                <polyline
                  points="0,8 8,6 14,9 22,3 30,7 40,2"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
            </div>
          ),
        )}
      </div>
      <div className="mx-4 mb-4 flex flex-col gap-2 rounded border border-[#EEE] p-3">
        <span className="text-[9px] font-semibold">Recent runs</span>
        {[0, 1].map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                row ? "bg-[#121212]" : "border border-[#999]",
              )}
            />
            <span className="h-1.5 w-2/5 rounded-full bg-[#EFEFEF]" />
          </div>
        ))}
      </div>
      <div className="absolute left-3 top-3 flex w-[40%] flex-col gap-0.5 rounded-md border border-[#EEE] bg-white p-2 shadow-lg">
        {menu.map((item) => (
          <span
            key={item}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-[#222]"
          >
            <ArrowRight className="size-3 text-[#888]" />
            {item}
          </span>
        ))}
      </div>
    </Window>
  );
}
export function PromptMockup() {
  const generate = featureById("new-project");

  return (
    <div className="flex w-full max-w-140 flex-col items-center gap-5">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#121212] text-white shadow-xl">
        <Sparkles className="size-6" />
      </span>
      <p className="text-center text-2xl font-semibold tracking-[-0.5px] text-white drop-shadow md:text-[26px]">
        What do you need help with?
      </p>
      <Window className="w-full">
        <div className="flex flex-col gap-3 p-4">
          <span className="flex w-fit items-center gap-1 rounded border border-[#E5E5E5] px-2 py-0.5 text-[10px] text-[#444]">
            <FileText className="size-3" /> support_request
          </span>
          <p className="text-xs leading-relaxed text-[#222]">
            {generate.input.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[#C9D6FA] bg-[#F3F6FF] px-2 py-0.5 text-[10px] text-[#3166D4]">
              Create support request
            </span>
            <div className="flex items-center gap-2 text-[#777]">
              <Paperclip className="size-3.5" />
              <span className="flex size-6 items-center justify-center rounded-full bg-[#121212] text-white">
                <Send className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}
export function AuthorOverviewMockup() {
  const analysis = featureById("repo-analysis");
  const isGap = (item: string) =>
    item.startsWith("No ") || item.startsWith("Unknown");

  return (
    <Window className="w-full max-w-140">
      <div className="flex items-center gap-2 border-b border-[#EEE] px-4 py-3 text-xs font-semibold">
        <FileText className="size-4 text-[#3166D4]" />
        {analysis.input.content}
        <span className="ml-auto rounded-full bg-[#EAF7EF] px-2 py-0.5 text-[10px] font-medium text-[#23864A]">
          Scanned
        </span>
      </div>
      <div className="grid grid-cols-2">
        {analysis.output.items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between border-b border-r border-[#F1F1F1] px-4 py-3 text-xs even:border-r-0"
          >
            <span>{item}</span>
            <span
              className={cn(
                "size-2 rounded-full",
                isGap(item) ? "bg-[#E5484D]" : "bg-[#2FAF64]",
              )}
            />
          </div>
        ))}
      </div>
      <p className="px-4 py-3 text-[11px] text-[#777]">
        {analysis.shortDescription}
      </p>
    </Window>
  );
}
export function ReadinessMockup() {
  const readiness = featureById("production-readiness");

  return (
    <Window className="w-full max-w-140">
      <div className="flex items-center justify-between border-b border-[#EEE] px-4 py-3">
        <span className="text-xs font-semibold">Royalty information</span>
        <span className="text-[11px] text-[#777]">BookLeaf author portal</span>
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center gap-5 p-5">
        <div className="flex flex-col items-center">
          <span className="text-[44px] font-semibold leading-none tracking-[-2px]">
            {readiness.score.overall}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-[#888]">
            Overall
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {readiness.score.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-[72px_1fr_24px] items-center gap-2 text-[11px]"
            >
              <span className="text-[#555]">{category.name}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-[#F0F0F0]">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    category.score >= 70
                      ? "bg-[#2FAF64]"
                      : category.score >= 50
                        ? "bg-[#E2A33B]"
                        : "bg-[#E5484D]",
                  )}
                  style={{ width: `${category.score}%` }}
                />
              </span>
              <span className="text-right text-[#333]">{category.score}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[#EEE]">
        {readiness.findings.slice(0, 4).map((finding) => (
          <div
            key={finding.title}
            className="flex items-center gap-3 border-b border-[#F4F4F4] px-4 py-2.5 text-[11px] last:border-b-0"
          >
            <Tag tone={finding.severity === "critical" ? "red" : "amber"}>
              {finding.severity}
            </Tag>
            <span>{finding.title}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}
export function PullRequestMockup() {
  return (
    <Window className="w-full max-w-140">
      <div className="flex flex-col gap-1 border-b border-[#EEE] px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <GitPullRequest className="size-4 text-[#2FAF64]" />
          {github.pullRequest.title}
        </span>
        <span className="font-mono text-[10px] text-[#777]">
          {github.pullRequest.branch} → main
        </span>
      </div>
      {github.pullRequest.files.map((file) => (
        <div
          key={file.path}
          className="flex items-center justify-between border-b border-[#F4F4F4] px-4 py-2.5 font-mono text-[11px]"
        >
          <span>{file.path}</span>
          <span className="text-[#2FAF64]">+ {file.status}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 px-4 py-3 text-[11px] text-[#23864A]">
        <Check className="size-3.5" /> Lint · Typecheck · Tests · Build passed
      </div>
    </Window>
  );
}
export function MigrationMockup() {
  const migration = featureById("migrations");

  return (
    <Window className="w-full max-w-140">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#EEE] px-4 py-3 text-[11px]">
        {migration.before.map((tech) => (
          <span
            key={tech}
            className="rounded border border-[#E5E5E5] px-2 py-0.5"
          >
            {tech}
          </span>
        ))}
        <ArrowRight className="size-3.5 text-[#999]" />
        <span className="text-[#555]">{migration.request}</span>
      </div>
      <ol className="flex flex-col">
        {migration.migration.map((phase, index) => (
          <li
            key={phase.phase}
            className="grid grid-cols-[18px_64px_1fr] items-center gap-2 border-b border-[#F4F4F4] px-4 py-2.5 text-[11px] last:border-b-0"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                index < 2 ? "bg-[#2FAF64]" : "border border-[#BBB]",
              )}
            />
            <span className="font-semibold">{phase.phase}</span>
            <span className="text-[#555]">{phase.steps.join(" · ")}</span>
          </li>
        ))}
      </ol>
    </Window>
  );
}
export function GraphMockup() {
  const nodesById = new Map<string, (typeof solution.visual.nodes)[number]>(
    solution.visual.nodes.map((node) => [node.id, node]),
  );
  const columns = [
    ["requirements"],
    ["architecture"],
    ["compatibility"],
    ["code", "infrastructure"],
    ["validation"],
    ["github"],
  ];

  return (
    <Window className="w-full max-w-140 p-4">
      <p className="mb-3 text-[11px] font-semibold text-[#555]">
        {architectureGraph.title}
      </p>
      <div className="flex items-center justify-between gap-1.5">
        {columns.map((column, index) => (
          <div key={column.join()} className="flex items-center gap-1.5">
            <div className="flex flex-col gap-1.5">
              {column.map((id) => {
                const node = nodesById.get(id);
                const strong = node?.type === "core" || node?.type === "engine";
                return (
                  <span
                    key={id}
                    className={cn(
                      "rounded border px-1.5 py-1 text-center text-[9px] leading-tight",
                      strong
                        ? "border-[#121212] bg-[#121212] text-white"
                        : "border-[#DDD] bg-[#FAFAF8]",
                    )}
                  >
                    {node?.label}
                  </span>
                );
              })}
            </div>
            {index < columns.length - 1 ? (
              <ArrowRight className="size-3 shrink-0 text-[#AAA]" />
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#F1F1F1] pt-3">
        {supportedStack.categories.slice(0, 5).map((category) => (
          <span
            key={category.name}
            className="rounded-full border border-[#E5E5E5] px-2 py-0.5 text-[10px] text-[#555]"
          >
            {category.name}: {category.technologies[0]?.name}
          </span>
        ))}
      </div>
    </Window>
  );
}
