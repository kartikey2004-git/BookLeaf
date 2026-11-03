import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Boxes,
  Circle,
  CheckCircle,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Code,
  Code2,
  Copy,
  Cpu,
  Database,
  FileCode,
  FolderTree,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Layers,
  Menu,
  MinusCircle,
  Network,
  PanelLeft,
  PanelRight,
  RefreshCw,
  Rocket,
  RotateCcw,
  Scan,
  Search,
  Shield,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Table2,
  Users,
  Wand,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { GithubMark } from "./marks";

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  "arrow-right": ArrowRight,
  bot: Bot,
  boxes: Boxes,
  "check-circle": CheckCircle,
  "chevrons-left": ChevronsLeft,
  "chevrons-right": ChevronsRight,
  clock: Clock,
  code: Code,
  "code-2": Code2,
  copy: Copy,
  cpu: Cpu,
  database: Database,
  "file-code": FileCode,
  "folder-tree": FolderTree,
  "git-branch": GitBranch,
  "git-merge": GitMerge,
  "git-pull-request": GitPullRequest,
  layers: Layers,
  menu: Menu,
  "minus-circle": MinusCircle,
  network: Network,
  "panel-left": PanelLeft,
  "panel-right": PanelRight,
  "refresh-cw": RefreshCw,
  rocket: Rocket,
  "rotate-ccw": RotateCcw,
  scan: Scan,
  search: Search,
  shield: Shield,
  "shield-check": ShieldCheck,
  shuffle: Shuffle,
  sparkles: Sparkles,
  "table-2": Table2,
  users: Users,
  wand: Wand,
  wrench: Wrench,
  x: X,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  if (name === "github") {
    return <GithubMark className={className} />;
  }

  const IconComponent = iconMap[name] ?? Circle;

  return <IconComponent className={className} />;
}
