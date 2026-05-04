/**
 * Share Card Generator — creates a canvas-based shareable image
 * showing dish name, cook time, and a motivational quote.
 *
 * Returns a Blob (image/png) suitable for Web Share API or download.
 */

const MOTIVATIONAL_QUOTES = [
  "Home-cooked and happy.",
  "Made with love, plated with pride.",
  "Another dish mastered.",
  "Cooking is confidence in motion.",
  "From craving to creation.",
  "One cook closer to fluency.",
  "Kitchen wins taste the best.",
  "Cooked it. Crushed it.",
  "Tonight's kitchen hero.",
  "Fresh out of the oven of awesome.",
];

function pickQuote(dishName: string): string {
  // Deterministic pick based on dish name so the same dish always gets the same quote
  let hash = 0;
  for (let i = 0; i < dishName.length; i++) {
    hash = (hash * 31 + dishName.charCodeAt(i)) | 0;
  }
  return MOTIVATIONAL_QUOTES[Math.abs(hash) % MOTIVATIONAL_QUOTES.length];
}

export interface ShareCardOptions {
  dishName: string;
  cookTimeMinutes?: number;
  rating?: number;
  cuisineFamily?: string;
}

export async function generateShareCard(
  options: ShareCardOptions,
): Promise<Blob> {
  const { dishName, cookTimeMinutes, rating, cuisineFamily } = options;
  const quote = pickQuote(dishName);

  const W = 600;
  const H = 400;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#2D6A4F");
  grad.addColorStop(1, "#1B4332");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle pattern circles
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < 8; i++) {
    const x = (i * 97 + 50) % W;
    const y = (i * 67 + 30) % H;
    ctx.beginPath();
    ctx.arc(x, y, 40 + i * 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // "Sous" branding — top left
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "600 14px system-ui, -apple-system, sans-serif";
  ctx.fillText("Sous", 32, 40);

  // Cuisine badge — top right
  if (cuisineFamily) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    const badgeText = cuisineFamily;
    const badgeW = ctx.measureText(badgeText).width + 24;
    ctx.beginPath();
    ctx.roundRect(W - 32 - badgeW, 24, badgeW, 26, 13);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "500 12px system-ui, -apple-system, sans-serif";
    ctx.fillText(badgeText, W - 32 - badgeW + 12, 42);
  }

  // Dish name — centered, large
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 32px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";

  // Word-wrap dish name if needed
  const words = dishName.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = `${currentLine} ${words[i]}`;
    if (ctx.measureText(test).width > W - 80) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = test;
    }
  }
  lines.push(currentLine);

  const lineHeight = 42;
  const nameY = H / 2 - (lines.length * lineHeight) / 2 - 10;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, nameY + i * lineHeight);
  });

  // Stats row
  const statsY = nameY + lines.length * lineHeight + 16;
  ctx.font = "500 14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

  const statParts: string[] = [];
  if (cookTimeMinutes) statParts.push(`${cookTimeMinutes} min`);
  if (rating) statParts.push(`${"★".repeat(rating)}${"☆".repeat(5 - rating)}`);
  if (statParts.length > 0) {
    ctx.fillText(statParts.join("  ·  "), W / 2, statsY);
  }

  // Quote — bottom
  ctx.font = "italic 500 15px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(212, 168, 75, 0.9)"; // nourish-gold
  ctx.fillText(`"${quote}"`, W / 2, H - 48);

  // Convert to blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate share card"));
      },
      "image/png",
      0.92,
    );
  });
}

/**
 * Share or download the cook card.
 * Uses Web Share API on mobile, falls back to clipboard copy.
 */
export async function shareOrDownload(blob: Blob, dishName: string): Promise<"shared" | "downloaded" | "copied"> {
  const file = new File([blob], `sous-${dishName.toLowerCase().replace(/\s+/g, "-")}.png`, {
    type: "image/png",
  });

  // Try Web Share API
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `${dishName} — cooked with Sous`,
        files: [file],
      });
      return "shared";
    } catch {
      // User cancelled or share failed — fall through
    }
  }

  // Try clipboard
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return "copied";
  } catch {
    // Clipboard unavailable — fall back to download
  }

  // Download fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
