import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  BellSimpleRinging,
  BookmarkSimple,
  BookOpen,
  Buildings,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  ChatCircleText,
  ChatsCircle,
  CheckCircle,
  Clock,
  Code,
  Cookie,
  DownloadSimple,
  EnvelopeSimple,
  Feather,
  FileText,
  Flag,
  FolderSimple,
  Gear,
  GithubLogo,
  Globe,
  HardDrive,
  House,
  Info,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Monitor,
  Moon,
  MoonStars,
  Newspaper,
  Package,
  Palette,
  PaperPlaneTilt,
  Pen,
  PencilSimpleLine,
  PianoKeys,
  Play,
  Scales,
  Scroll,
  ShieldCheck,
  SidebarSimple,
  Sparkle,
  Sun,
  Translate,
  User,
  UserCheck,
  Users,
  WarningCircle,
  Wrench,
  X,
} from '@phosphor-icons/react';
import { FaWindows } from 'react-icons/fa6';

const PHOSPHOR_MAP = {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  BellSimpleRinging,
  BookmarkSimple,
  BookOpen,
  Buildings,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  ChatCircleText,
  ChatsCircle,
  CheckCircle,
  Clock,
  Code,
  Cookie,
  DownloadSimple,
  EnvelopeSimple,
  Feather,
  FileText,
  Flag,
  FolderSimple,
  Gear,
  GithubLogo,
  Globe,
  HardDrive,
  House,
  Info,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Monitor,
  Moon,
  MoonStars,
  Newspaper,
  Package,
  Palette,
  PaperPlaneTilt,
  Pen,
  PencilSimpleLine,
  PianoKeys,
  Play,
  Scales,
  Scroll,
  ShieldCheck,
  SidebarSimple,
  Sparkle,
  Sun,
  Translate,
  User,
  UserCheck,
  Users,
  WarningCircle,
  Wrench,
  X,
} as const;

export type PhosphorName = keyof typeof PHOSPHOR_MAP;
export type IconName = PhosphorName | 'FaWindows';

export interface RenderIconOptions {
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  size?: number | string;
  className?: string;
}

const iconCache = new Map<string, string>();

/**
 * Renders the exact SVG markup from @phosphor-icons/react or react-icons at Astro build time
 * without shipping React runtime JS for static icons.
 */
export function renderIconSvg(name: IconName, opts: RenderIconOptions = {}): string {
  const { weight = 'regular', size = '1em', className = '' } = opts;
  const cacheKey = `${name}|${weight}|${String(size)}|${className}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  let markup = '';
  if (name === 'FaWindows') {
    markup = renderToStaticMarkup(
      React.createElement(FaWindows as any, {
        size,
        className: className || undefined,
        'aria-hidden': 'true',
      })
    );
  } else {
    const Comp = PHOSPHOR_MAP[name];
    markup = renderToStaticMarkup(
      React.createElement(Comp as any, {
        weight,
        size,
        className: className || undefined,
        'aria-hidden': 'true',
      })
    );
  }

  iconCache.set(cacheKey, markup);
  return markup;
}
