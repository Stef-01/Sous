"use client";

import { useMemo } from "react";
import {
  UtensilsCrossed,
  LayoutGrid,
  Flame,
  Droplets,
  Leaf,
  CircleDot,
  CookingPot,
  Pipette,
  Sparkles,
  Drumstick,
  Soup,
  Fish,
  Wheat,
  Bird,
  Timer,
  Wine,
  Coffee,
  Scissors,
  Snowflake,
  Activity,
  CakeSlice,
  Globe,
  Palette,
  FlaskConical,
  Droplet,
  ClipboardList,
  PenTool,
  Layers,
  Beaker,
  Music2,
  ChefHat,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SKILL_ICON_MAP: Record<string, LucideIcon> = {
  "knife-skills": UtensilsCrossed,
  "mise-en-place": LayoutGrid,
  "dry-heat-cooking": Flame,
  "moist-heat-cooking": Droplets,
  "vegetable-techniques": Leaf,
  "egg-cookery": CircleDot,
  "stock-making": CookingPot,
  "mother-sauces": Pipette,
  "seasoning-tasting": Sparkles,

  "meat-cookery": Drumstick,
  soups: Soup,
  "salads-emulsions": Leaf,
  poultry: Bird,
  seafood: Fish,
  "grains-pasta": Wheat,
  "braising-stewing": Timer,
  "pan-sauces-deglazing": Wine,
  "breakfast-cookery": Coffee,
  "quick-breads": CakeSlice,

  butchery: Scissors,
  "garde-manger": Snowflake,
  "palate-development": Activity,
  "yeast-breads": Wheat,
  "pastry-fundamentals": CakeSlice,
  "global-flavor-profiles": Globe,
  "plating-presentation": Palette,
  fermentation: FlaskConical,
  "advanced-sauces": Droplet,
  "live-fire-cooking": Flame,

  "menu-design": ClipboardList,
  "recipe-development": PenTool,
  "laminated-doughs": Layers,
  "contemporary-techniques": Beaker,
  "kitchen-orchestration": Music2,

  "italian-mastery": UtensilsCrossed,
  "japanese-mastery": Fish,
  "french-mastery": Wine,
  "mexican-mastery": Flame,
  "indian-mastery": Sparkles,
  "thai-mastery": Leaf,
  "chinese-mastery": CookingPot,
  "mediterranean-mastery": Sun,
};

export function getSkillIconComponent(skillId: string): LucideIcon {
  return SKILL_ICON_MAP[skillId] ?? ChefHat;
}

interface SkillIconProps {
  skillId: string;
  size?: number;
  className?: string;
}

export function SkillIcon({ skillId, size = 24, className }: SkillIconProps) {
  const Icon = useMemo(() => SKILL_ICON_MAP[skillId] ?? ChefHat, [skillId]);
  return (
    <Icon size={size} strokeWidth={1.8} className={cn("shrink-0", className)} />
  );
}
