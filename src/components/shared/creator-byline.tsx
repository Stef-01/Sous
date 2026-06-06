import Image from "next/image";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { imageSrc } from "@/lib/image/image-src";
import { recipeCreator } from "@/lib/utils/recipe-credit";

/**
 * CreatorByline — a "by Chef Tu" attribution with a small round avatar, shown
 * under a recipe title to promote the partner chef whose recipe it is (the
 * mockup's "by bakerben" card format). Renders nothing for uncredited recipes.
 * Pure / motion-free.
 *
 * `tone="onImage"` styles it for placement over a photo; default suits a light
 * surface. Avatar falls back to a chef-hat until a partner portrait is supplied.
 */
export function CreatorByline({
  slug,
  className,
  tone = "light",
}: {
  slug: string;
  className?: string;
  tone?: "light" | "onImage";
}) {
  const creator = recipeCreator(slug);
  if (!creator) return null;
  const onImage = tone === "onImage";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full",
          onImage
            ? "bg-white/25 text-white backdrop-blur-sm"
            : "bg-[var(--nourish-green)]/[0.12] text-[var(--nourish-green)]",
        )}
      >
        {creator.avatarUrl ? (
          <Image
            src={imageSrc(creator.avatarUrl)}
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-cover"
          />
        ) : (
          <ChefHat size={15} aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "text-sm",
          onImage ? "text-white/90" : "text-[var(--nourish-subtext)]",
        )}
      >
        by{" "}
        <span
          className={cn(
            "font-semibold",
            onImage ? "text-white" : "text-[var(--nourish-dark)]",
          )}
        >
          {creator.short}
        </span>
      </span>
    </div>
  );
}
