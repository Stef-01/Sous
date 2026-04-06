"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Pre-computed sparkle offsets — generated once at module load to keep render pure
const SPARKLE_OFFSETS = [
    { y: -28, x: 8 },
    { y: -35, x: -12 },
    { y: -22, x: 5 },
];

interface MagicalLoaderProps {
    size?: "default" | "small";
}

export default function MagicalLoader({ size = "default" }: MagicalLoaderProps) {
    const prefersReduced = useReducedMotion();

    const sparkleOffsets = SPARKLE_OFFSETS;

    if (prefersReduced) {
        return (
            <div className={`flex flex-col items-center justify-center w-full ${size === "small" ? "h-14" : "h-48"}`}>
                <p className="text-nourish-subtext text-sm">Loading...</p>
            </div>
        );
    }

    const containerClasses = size === "small"
        ? "relative flex items-center justify-center h-14 w-14"
        : "relative flex items-center justify-center h-48 w-48 mx-auto -my-4";

    // Scale down for small variant (default is ~192px/48px rings, small is 56px wrapper)
    // 56px / 192px is approx 0.3, but rings are 64px. 
    // 64px * 0.5 = 32px. Fits in 56px.
    const style = size === "small" ? { transform: "scale(0.5)" } : undefined;

    return (
        <div className={containerClasses} style={style}>
            {/* Outer rotating ring */}
            <motion.div
                className="absolute w-16 h-16 border-2 border-nourish-gold/30 rounded-full border-t-nourish-gold"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle pulsing ring */}
            <motion.div
                className="absolute w-10 h-10 border border-nourish-gold/60 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner solid dot */}
            <motion.div
                className="absolute w-2 h-2 bg-nourish-gold rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating sparkles */}
            {sparkleOffsets.map((offsets, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-nourish-gold rounded-full"
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: offsets.y,
                        x: offsets.x,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
}
