import {
  BarChart3, BookOpen, Briefcase, Calendar, Code2, FileText, Flame, Gamepad2, Globe, Home,
  Lightbulb, ListChecks, Music, Palette, Pin, Rocket, Star, StickyNote, Target, Wrench,
  type LucideIcon,
} from 'lucide-react';

// Page icons are saved as "lucide:<key>". Pages made before this keep their emoji, which still render.
const ICONS: Record<string, LucideIcon> = {
  page: FileText,
  note: StickyNote,
  tasks: ListChecks,
  pin: Pin,
  star: Star,
  goal: Target,
  idea: Lightbulb,
  hot: Flame,
  launch: Rocket,
  chart: BarChart3,
  home: Home,
  code: Code2,
  design: Palette,
  book: BookOpen,
  music: Music,
  games: Gamepad2,
  work: Briefcase,
  tools: Wrench,
  calendar: Calendar,
  web: Globe,
};

export const PAGE_ICON_KEYS = Object.keys(ICONS);
export const pageIconValue = (key: string) => `lucide:${key}`;

export function PageIcon({ icon, className = 'h-4 w-4' }: { icon?: string | null; className?: string }) {
  if (icon && !icon.startsWith('lucide:')) {
    return <span aria-hidden className="leading-none">{icon}</span>;
  }
  const Icon = (icon && ICONS[icon.slice('lucide:'.length)]) || FileText;
  return <Icon className={className} aria-hidden />;
}
