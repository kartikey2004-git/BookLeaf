export type MarketingLink = {
  label: string;
  href: string;
};

export type MarketingFeature = {
  id: string;
  title: string;
  description: string;
  supportingText: string;
  benefit: string;
  visualLabel?: string;
};

export type WorkflowStep = {
  id: string;
  title: string;
  description: string;
};

export const siteMetadata = {
  productName: "BookLeaf Author Support & Communication Portal",
  brandName: "BookLeaf",
  brandDescription:
    "An author-first support and communication portal for following books, royalty information, and support requests in one place.",
  tagline: "Your publishing journey deserves better support.",
  pageTitle: "BookLeaf | Author Support & Communication Portal",
  seoDescription:
    "Track books, review royalty information, and stay connected with BookLeaf support through one clear author portal.",
  keywords: [
    "BookLeaf",
    "author portal",
    "publishing support",
    "royalty information",
    "support ticket tracking",
  ],
  openGraph: {
    title: "BookLeaf Author Support & Communication Portal",
    description:
      "A clear, connected home for BookLeaf authors and support teams.",
    type: "website",
  },
} as const;

export const navigationContent = {
  logo: siteMetadata.brandName,
  links: [
    { label: "Product", href: "#product" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ] satisfies readonly MarketingLink[],
  authorPortalCta: { label: "Access Author Portal", href: "#portal-access" },
  supportPortalCta: { label: "Support Team Login", href: "#portal-access" },
  account: {
    getStarted: "Get started",
    menuLabel: "Open account menu",
    signedIn: "Signed in",
    portal: "Author portal",
    signOut: "Sign out",
  },
} as const;

export const heroContent = {
  eyebrow: "BookLeaf author portal",
  headline: "Your publishing journey deserves better support.",
  description:
    "Track your books, understand your royalties, and stay connected with the BookLeaf support team. Everything related to your publishing journey, in one place.",
  primaryCta: navigationContent.authorPortalCta,
  secondaryCta: navigationContent.supportPortalCta,
  supportingStatement: {
    eyebrow: "One connected view",
    text: "Books, royalty updates, and help requests, kept close to the work you care about.",
  },
  productPreview: {
    greeting: "Good morning, Ananya",
    booksLabel: "Your books",
    books: [
      { title: "The Last Monsoon", status: "In production" },
      { title: "Notes from Home", status: "Published" },
    ],
    royaltyCard: {
      label: "Royalty information",
      value: "Latest statement",
      action: "View statement",
    },
    ticketCard: {
      label: "Open support request",
      value: "Cover update",
      status: "Awaiting response",
    },
    notification: {
      title: "A response was added to your request",
      description:
        "Your conversations remain connected to the book and request they relate to.",
    },
  },
} as const;

export const productOverviewContent = {
  eyebrow: "A clearer publishing desk",
  headline: "Everything in view, without the chasing.",
  introduction:
    "BookLeaf brings author information and support communication into one focused portal.",
  problemStatement:
    "Publishing updates can be difficult to follow when book details, royalty information, and support conversations live in separate places.",
  valueProposition:
    "A shared view gives authors clearer context and gives BookLeaf teams the information needed to respond with care.",
  audiences: [
    {
      title: "For authors",
      description:
        "A clear place to follow books, revisit royalty information, and keep support requests moving.",
    },
    {
      title: "For BookLeaf teams",
      description:
        "A structured workspace for managing requests, reviewing AI assistance, and keeping each author conversation connected to its context.",
    },
  ],
} as const;

export const benefitsContent = {
  eyebrow: "Built around the author",
  headline: "Less uncertainty. More room to focus on the writing.",
  items: [
    {
      title: "Stay close to your book",
      description:
        "See the information and next steps associated with each of your titles in a single place.",
    },
    {
      title: "Understand royalty updates",
      description:
        "Keep royalty information easy to find when you need to review it.",
    },
    {
      title: "Keep support conversations moving",
      description:
        "Raise a request, follow its progress, and return to the full conversation at any time.",
    },
  ],
} as const;

export const featuresContent = {
  eyebrow: "Designed for the real work",
  headline: "A portal that makes space for clarity.",
  introduction:
    "Practical tools for the moments when an author needs an answer, an update, or a clear next step.",
  items: [
    {
      id: "author-dashboard",
      title: "A focused author dashboard",
      description:
        "Start with your books, current activity, and active support requests in one focused view.",
      supportingText:
        "The dashboard keeps useful publishing context visible without asking authors to navigate an internal support operation.",
      benefit:
        "Begin every visit with a clear picture of what needs attention.",
      visualLabel: "Dashboard overview",
    },
    {
      id: "book-management",
      title: "Book information that stays connected",
      description:
        "Move from your account to the title and publishing information that a question relates to.",
      supportingText:
        "Book context remains close to the support activity connected to that title.",
      benefit: "Spend less time explaining which book a request is about.",
      visualLabel: "Book details",
    },
    {
      id: "royalty-visibility",
      title: "Royalty information in reach",
      description:
        "Find royalty information alongside the rest of your BookLeaf journey.",
      supportingText:
        "The portal presents statements as account information for review, not as a replacement for BookLeaf royalty policy or calculation records.",
      benefit:
        "Return to the information you need without searching old messages.",
      visualLabel: "Royalty statement",
    },
    {
      id: "ticket-creation",
      title: "Support requests with useful context",
      description:
        "Create a request for a book or publishing question and keep the conversation connected to it.",
      supportingText:
        "A request creates a durable thread for updates, questions, and next steps.",
      benefit:
        "Give the support team the context needed to help from the start.",
      visualLabel: "Create request",
    },
    {
      id: "ticket-tracking",
      title: "Track progress without chasing updates",
      description:
        "Review a ticket's status and conversation whenever you need to know what is happening.",
      supportingText:
        "Updates remain attached to the same request so the full history is easy to revisit.",
      benefit: "Know where a question stands and what happens next.",
      visualLabel: "Request status",
    },
    {
      id: "ai-classification",
      title: "AI-assisted classification",
      description:
        "Support operations can use AI assistance to identify the likely category and context of an incoming request.",
      supportingText:
        "Classification helps organise work for review. It does not replace the support team's judgment.",
      benefit: "Help requests reach the right operational context sooner.",
      visualLabel: "Category suggestion",
    },
    {
      id: "priority-assessment",
      title: "Priority assessment with human review",
      description:
        "AI can surface signals that help a team assess the urgency of a request.",
      supportingText:
        "BookLeaf staff review the suggested priority before acting on it.",
      benefit: "Support teams can focus attention where it is most needed.",
      visualLabel: "Priority review",
    },
    {
      id: "response-drafting",
      title: "Response drafts, reviewed by people",
      description:
        "AI can prepare a draft from the request history and available context for an administrator to review.",
      supportingText:
        "A BookLeaf team member remains responsible for accuracy, tone, and the final response.",
      benefit:
        "Create a more consistent starting point for thoughtful support.",
      visualLabel: "Draft response",
    },
    {
      id: "admin-ticket-management",
      title: "Admin ticket management",
      description:
        "Support teams can organise tickets, review request details, and manage author communication from an operational workspace.",
      supportingText:
        "The admin view is designed for the team handling the work behind the author portal.",
      benefit: "Keep support work structured while preserving author context.",
      visualLabel: "Ticket queue",
    },
    {
      id: "internal-notes",
      title: "Internal notes for coordinated support",
      description:
        "Administrators can retain internal context while keeping author-facing communication focused and clear.",
      supportingText:
        "Internal notes support team coordination and are distinct from author-visible replies.",
      benefit: "Coordinate handoffs without losing the thread of the request.",
      visualLabel: "Internal context",
    },
  ] satisfies readonly MarketingFeature[],
} as const;

export const productPreviewContent = {
  illustrativeNotice: "Illustrative portal content",
  dashboardStats: [
    { label: "Books", value: "2" },
    { label: "Open requests", value: "1" },
    { label: "Latest royalty update", value: "Available" },
  ],
  bookInformationLabels: ["Title", "Publishing status", "Recent update"],
  royaltyBreakdownLabels: [
    "Statement period",
    "Royalty information",
    "View statement",
  ],
  ticketStatuses: ["Open", "Awaiting response", "In progress", "Resolved"],
  priorityLabels: ["Standard", "Needs review", "Priority"],
  categoryLabels: [
    "Book update",
    "Royalty question",
    "Production",
    "General support",
  ],
  ticketQueueExamples: [
    "Cover update for The Last Monsoon",
    "Royalty statement question",
    "Production timeline question",
  ],
  conversationExample: {
    author: "Could you confirm the next step for my cover update?",
    support:
      "We have reviewed your request and will share the next update in this conversation.",
  },
  aiResponseDraftExample:
    "Draft for review: Thanks for your update. I have checked the request context and outlined the next step for the team to confirm before sending.",
  adminWorkflowLabels: [
    "Review ticket",
    "Confirm category",
    "Assess priority",
    "Review draft",
    "Send response",
  ],
  authorWorkflowLabels: [
    "Open portal",
    "Choose a book or request",
    "Follow progress",
    "Read the response",
  ],
} as const;

export const workflowContent = {
  eyebrow: "How it works",
  headline: "Support should feel simple from the author's side.",
  authorJourney: [
    {
      id: "access",
      title: "Open your portal",
      description:
        "Start with a focused view of your books and the latest activity.",
    },
    {
      id: "ask",
      title: "View books or raise a ticket",
      description:
        "Move to the title, royalty information, or support topic you need.",
    },
    {
      id: "track",
      title: "Track progress",
      description:
        "Return to the request to see updates and the current status.",
    },
    {
      id: "respond",
      title: "Receive a response",
      description: "Read the support team's reply in the same conversation.",
    },
  ] satisfies readonly WorkflowStep[],
  adminJourney: [
    {
      id: "review",
      title: "Review the request",
      description: "Open the author, book, and ticket context together.",
    },
    {
      id: "organise",
      title: "Confirm the work",
      description:
        "Review category and priority assistance before assigning the next step.",
    },
    {
      id: "prepare",
      title: "Prepare a response",
      description:
        "Use the available context and, where useful, review an AI-assisted draft.",
    },
    {
      id: "reply",
      title: "Send a clear update",
      description: "A team member approves the author-facing response.",
    },
  ] satisfies readonly WorkflowStep[],
  aiProcessingStages: [
    {
      id: "incoming",
      title: "Incoming ticket",
      description: "A new author request enters the support workflow.",
    },
    {
      id: "classify",
      title: "Classification",
      description: "AI assistance suggests likely request context.",
    },
    {
      id: "priority",
      title: "Priority assessment",
      description: "Operational signals help inform a review of urgency.",
    },
    {
      id: "draft",
      title: "Response draft",
      description:
        "A draft can be prepared from the available request context.",
    },
    {
      id: "review",
      title: "Admin review",
      description: "A BookLeaf team member checks and approves the response.",
    },
    {
      id: "sent",
      title: "Response sent",
      description:
        "The author receives a clear update in the ticket conversation.",
    },
  ] satisfies readonly WorkflowStep[],
} as const;

export const aiContent = {
  eyebrow: "Operationally assisted",
  headline: "AI helps the support team focus on the author.",
  introduction:
    "AI-assisted workflows help organise request context and prepare support work. They are an operational advantage, not a substitute for the people responsible for author communication.",
  classification:
    "Classification suggestions can help a team recognise whether a request concerns a book update, royalty information, production, or general support.",
  priority:
    "Priority assistance can surface relevant signals for review. A BookLeaf administrator confirms the priority.",
  responseGeneration:
    "Draft responses can give the support team a context-aware starting point, while the administrator controls the final author-facing message.",
  humanApproval:
    "People remain responsible for reviewing context, making decisions, and approving every response sent to an author.",
  workflowLabels: [
    "Prepared context",
    "Support team review",
    "Author receives a clear update",
  ],
} as const;

export const faqContent = [
  {
    question: "What can I find in the Author Portal?",
    answer:
      "The portal brings together your books, royalty information, support requests, and the updates connected to them.",
  },
  {
    question: "How do I access the Author Portal?",
    answer:
      "Use your BookLeaf account access details. If you need help accessing the portal, contact the BookLeaf support team through the available support route.",
  },
  {
    question: "Can I see information for more than one book?",
    answer:
      "The portal is designed to help you move between the titles associated with your author account.",
  },
  {
    question: "Does the portal calculate my royalties?",
    answer:
      "The portal helps you review available royalty information and statements. For questions about a statement or calculation, create a support request so the BookLeaf team can review the relevant context.",
  },
  {
    question: "How do I create and follow a support request?",
    answer:
      "Create a request from the relevant portal area, then return to the same ticket to follow status changes and the ongoing conversation.",
  },
  {
    question: "Who responds to my support request?",
    answer:
      "BookLeaf support team members review and send author-facing responses. The portal keeps their replies connected to your request.",
  },
  {
    question: "How is AI used in support?",
    answer:
      "AI can assist with classification, priority assessment, and response drafting. A BookLeaf team member reviews the context and approves the final response.",
  },
] as const;

export const finalCtaContent = {
  eyebrow: "A better way to stay connected",
  headline: "Your books deserve attention. Your questions deserve answers.",
  description:
    "Return to your books, your royalty information, and your support conversations whenever you need them.",
  authorPortalCta: navigationContent.authorPortalCta,
  supportPortalCta: navigationContent.supportPortalCta,
} as const;

export const footerContent = {
  brandDescription:
    "A clearer support and communication experience for BookLeaf authors and teams.",
  navigationGroups: [
    { title: "Explore", links: navigationContent.links },
    {
      title: "Portal access",
      links: [
        navigationContent.authorPortalCta,
        navigationContent.supportPortalCta,
      ],
    },
  ],
  productLinks: [
    { label: "Author dashboard", href: "#product" },
    { label: "Support workflow", href: "#how-it-works" },
    { label: "Frequently asked questions", href: "#faq" },
  ] satisfies readonly MarketingLink[],
  copyright: "© BookLeaf. All rights reserved.",
  credit: {
    label: "Built by Kartikey for BookLeaf",
    avatarSrc: "/images/kartikey-avatar.avif",
    avatarAlt: "Kartikey",
  },
} as const;
export const meta = {
  name: siteMetadata.brandName,
  title: siteMetadata.brandName,
  badge: "Author support portal",
  url: "/",
};
export const navigation = {
  logo: { text: siteMetadata.brandName },
  links: navigationContent.links,
  actions: [navigationContent.authorPortalCta],
  account: navigationContent.account,
};
export const WAITLIST_FORM_URL = "#portal-access";
export const hero = {
  headline: {
    line1: "Your publishing",
    highlight: "journey deserves",
    line3: "better support.",
  },
  primaryCta: heroContent.primaryCta,
  secondaryCta: heroContent.secondaryCta,
  trustText: "Built for clearer author support",
};
export const messaging = {
  primary: heroContent.description,
  sectionKicker: productOverviewContent.eyebrow,
  short: productOverviewContent.headline,
  long: productOverviewContent.valueProposition,
  positioning: [
    "BookLeaf keeps authors",
    "connected to their books",
    "and support requests",
    "with clearer context.",
  ],
};
export const faq = {
  id: "faq",
  title: "Questions, answered clearly.",
  visibleCount: 4,
  eyebrow: "FAQ",
  headline: "Questions, answered clearly.",
  items: faqContent,
};
export const footer = {
  brand: { description: footerContent.brandDescription },
  columns: footerContent.navigationGroups,
  bottom: {
    copyright: footerContent.copyright,
    credit: footerContent.credit,
  },
};

type ProductFeatureBase = {
  id:
    | "new-project"
    | "repo-analysis"
    | "production-readiness"
    | "fixes"
    | "migrations";
  icon: string;
  title: string;
  description: string;
  status: "available" | "planned";
};

type NewProjectFeature = ProductFeatureBase & {
  id: "new-project";
  input: { content: string };
  output: { items: string[] };
};

type AuthorOverviewFeature = ProductFeatureBase & {
  id: "repo-analysis";
  input: { content: string };
  output: { items: string[] };
  shortDescription: string;
};

type RoyaltyFeature = ProductFeatureBase & {
  id: "production-readiness";
  score: {
    overall: string;
    categories: Array<{ name: string; score: number }>;
  };
  findings: Array<{ title: string; severity: string }>;
};

type SupportFeature = ProductFeatureBase & {
  id: "fixes";
  before: string[];
  request: string;
  fixes: Array<{ title: string }>;
};

type WorkflowFeature = ProductFeatureBase & {
  id: "migrations";
  before: string[];
  request: string;
  migration: Array<{ phase: string; steps: string[] }>;
};

export type ProductFeature =
  | NewProjectFeature
  | AuthorOverviewFeature
  | RoyaltyFeature
  | SupportFeature
  | WorkflowFeature;

type ProductData = {
  id: string;
  title: string;
  description: string;
  stages: readonly WorkflowStep[];
  tabs: readonly [];
  features: ProductFeature[];
};

export const product: ProductData = {
  id: "product",
  title: siteMetadata.productName,
  description: productOverviewContent.introduction,
  stages: workflowContent.authorJourney,
  tabs: [],
  features: [
    {
      id: "new-project",
      icon: "book-open",
      title: "Start from the right book context",
      description: featuresContent.items[1]!.description,
      status: "available",
      input: { content: "I need an update on the next step for my book." },
      output: {
        items: [
          "Book details",
          "Current publishing status",
          "Relevant support history",
        ],
      },
    },
    {
      id: "repo-analysis",
      icon: "search",
      title: "See the details that matter",
      description: featuresContent.items[0]!.description,
      status: "available",
      input: { content: "Author portal overview" },
      output: {
        items: ["Book status", "Recent updates", "Open support requests"],
      },
      shortDescription:
        "A focused view of the information connected to an author account.",
    },
    {
      id: "production-readiness",
      icon: "circle-check",
      title: "Review royalty information clearly",
      description: featuresContent.items[2]!.description,
      status: "available",
      score: {
        overall: "Clear",
        categories: [
          { name: "Statement period", score: 88 },
          { name: "Available information", score: 76 },
          { name: "Questions for support", score: 64 },
        ],
      },
      findings: [
        { title: "Latest statement available", severity: "info" },
        { title: "Review questions with support", severity: "info" },
      ],
    },
    {
      id: "fixes",
      icon: "message-circle",
      title: "Keep support requests moving",
      description: featuresContent.items[4]!.description,
      status: "available",
      before: ["Question", "Context"],
      request: "Clear author support",
      fixes: [
        "Create a request",
        "Follow the conversation",
        "Review the latest response",
      ].map((title) => ({ title })),
    },
    {
      id: "migrations",
      icon: "route",
      title: "A clear support workflow",
      description: workflowContent.authorJourney[2]!.description,
      status: "available",
      before: ["Question", "Context"],
      request: "Clear author support",
      migration: workflowContent.authorJourney.map((step) => ({
        phase: step.title,
        steps: [step.description],
      })),
    },
  ],
};
export const roadmap = {
  description:
    "The workflow keeps each request connected to the author and book it concerns.",
  phases: workflowContent.adminJourney.map((step, index) => ({
    version: `Step ${index + 1}`,
    title: step.title,
    status: index === 0 ? "current" : "planned",
    features: [step.description],
  })),
};
export const workflow = {
  title: aiContent.introduction,
  stages: workflowContent.aiProcessingStages,
};
export const platform = {
  id: "features",
  title: productOverviewContent.headline,
  stages: [
    {
      label: "Books",
      icon: "book-open",
      tone: "orange",
      items: featuresContent.items.slice(0, 2),
    },
    {
      label: "Royalties",
      icon: "file-text",
      tone: "violet",
      items: featuresContent.items.slice(2, 3),
    },
    {
      label: "Support",
      icon: "message-circle",
      tone: "green",
      items: featuresContent.items.slice(3, 5),
    },
    {
      label: "Operations",
      icon: "sparkles",
      tone: "pink",
      items: featuresContent.items.slice(5, 7),
    },
  ],
  outputs: ["Author portal", "Support context", "Clear updates"],
};
export const solution = {
  title: productOverviewContent.valueProposition,
  features: benefitsContent.items,
  visual: {
    nodes: [
      { id: "requirements", label: "Author request", type: "core" },
      { id: "architecture", label: "Book context", type: "core" },
      { id: "compatibility", label: "Royalty information", type: "core" },
      { id: "code", label: "Support review", type: "core" },
      { id: "infrastructure", label: "Internal notes", type: "core" },
      { id: "validation", label: "Human approval", type: "core" },
      { id: "github", label: "Author update", type: "core" },
    ],
  },
};
export const supportedStack = {
  categories: [
    {
      name: "Author experience",
      technologies: [
        { name: "Books", category: "Author experience" },
        { name: "Royalties", category: "Author experience" },
        { name: "Support requests", category: "Author experience" },
      ],
    },
    {
      name: "Support operations",
      technologies: [
        { name: "Ticket queue", category: "Support operations" },
        { name: "AI review", category: "Support operations" },
      ],
    },
  ],
};
export const architectureGraph = {
  id: "author-support-workflow",
  title: "Author support, connected",
  description: productOverviewContent.valueProposition,
  nodes: [],
  edges: [],
  capabilities: aiContent.workflowLabels.map((title) => ({
    title,
    description: aiContent.introduction,
  })),
};
export const github = {
  title: "Support work stays coordinated",
  description:
    "The team can retain the request history and operational context in one place.",
  features: [],
  pullRequest: {
    title: "Author request reviewed",
    branch: "support/review",
    files: [{ path: "author-request", status: "reviewed" }],
  },
};
export const deterministicEngine = {
  title: aiContent.headline,
  eyebrow: aiContent.eyebrow,
  description: aiContent.introduction,
  components: [],
  principles: [],
  layers: [
    {
      number: "01",
      title: "Context",
      description: "Book and request details stay connected.",
      components: ["Books", "Royalty information", "Support requests"],
    },
    {
      number: "02",
      title: "Review",
      description: "Operational assistance is checked by the BookLeaf team.",
      components: ["Classification", "Priority review", "Internal notes"],
    },
    {
      number: "03",
      title: "Response",
      description: "Authors receive clear updates in the same conversation.",
      components: ["Draft response", "Human approval", "Ticket history"],
    },
  ],
};
export const compiler = {
  stages: [],
  pipeline: workflowContent.aiProcessingStages,
};
export const validation = {
  checks: [],
  pipeline: workflowContent.adminJourney.map((step) => ({ step: step.title })),
};
export const comparison = {
  title: "Clearer author communication",
  description: productOverviewContent.valueProposition,
  items: [],
};
export const decisionEngine = {
  decisions: workflowContent.aiProcessingStages.map((step) => ({
    capability: step.title,
    decision: "review",
  })),
};
export const developerExperience = {
  id: "how-it-works",
  description: aiContent.introduction,
  items: [],
  principles: [
    {
      title: "Connected context",
      description:
        "Each request stays close to the book and author information it concerns.",
    },
    {
      title: "Human review",
      description:
        "BookLeaf staff remain responsible for every author-facing decision.",
    },
    {
      title: "Clear communication",
      description:
        "Authors can return to one thread for updates and next steps.",
    },
    {
      title: "Operational support",
      description: "AI can help prepare context for staff review.",
    },
    {
      title: "Thoughtful workflow",
      description:
        "Support stays structured without losing the human connection.",
    },
  ],
};
export const finalCta = {
  ...finalCtaContent,
  secondary: navigationContent.supportPortalCta,
};
export const useCases = {
  id: "use-cases",
  eyebrow: "Designed for authors and teams",
  title: "Support that keeps the publishing journey connected.",
  items: featuresContent.items
    .slice(0, 6)
    .map((item) => ({ ...item, icon: "circle-check" })),
};
export const waitlist = {
  id: "portal-access",
  title: finalCtaContent.headline,
  description: finalCtaContent.description,
  cta: finalCtaContent.authorPortalCta,
  submitLabel: finalCtaContent.authorPortalCta.label,
  privacyNote: "Use your BookLeaf account to continue.",
};
