"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function MagicalLoader() {
    const prefersReduced = useReducedMotion();

    if (prefersReduced) {
        return (
            <div className="flex flex-col items-center justify-center h-48 w-full">
                <p className="text-nourish-subtext text-sm">Loading...</p>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center h-48 w-48 mx-auto -my-4">
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
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-nourish-gold rounded-full"
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: -20 - Math.random() * 20,
                        x: (Math.random() - 0.5) * 30,
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
