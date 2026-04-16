"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-col bg-[var(--nourish-cream)] px-5 py-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--nourish-subtext)] active:scale-95 transition-transform"
        type="button"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--nourish-green)]/10">
            <Users size={28} className="text-[var(--nourish-green)]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <h1 className="font-serif text-xl text-[var(--nourish-dark)]">
            Community is coming
          </h1>
          <p className="text-sm text-[var(--nourish-subtext)] max-w-[260px] mx-auto leading-relaxed">
            Share your cooks, discover what friends are making, and join cooking
            challenges together.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/today")}
          className="mt-4 rounded-xl bg-[var(--nourish-green)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--nourish-dark-green)]"
          type="button"
        >
          Back to Today
        </motion.button>
      </div>
    </div>
  );
}
