"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    color: string;
}

const GOLD_PALETTE = [
    "#D4A84B",  // nourish gold
    "#E8C97A",  // light gold
    "#B8902F",  // deep gold
    "#F0DDA0",  // pale gold
    "#C4963C",  // warm gold
];

let sparkleIdCounter = 0;

function generateSparkles(count: number): Sparkle[] {
    return Array.from({ length: count }, () => ({
        id: sparkleIdCounter++,
        x: Math.random() * 100 - 50,      // -50 to 50px from center
        y: Math.random() * 80 - 60,        // mostly upward
        size: Math.random() * 6 + 3,       // 3-9px
        rotation: Math.random() * 360,
        color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
    }));
}

interface SparkleEffectProps {
    /** Number of sparkle particles */
    count?: number;
    children: React.ReactNode;
    /** Wrapper className */
    className?: string;
}

/**
 * Wraps a button/element and emits a burst of gold sparkles on click.
 * Sparkles animate outward and fade, then self-clean.
 */
export default function SparkleEffect({
    count = 8,
    children,
    className = "",
}: SparkleEffectProps) {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);
    const prefersReduced = useReducedMotion();

    const burst = useCallback(() => {
        if (prefersReduced) return;
        const newSparkles = generateSparkles(count);
        setSparkles(newSparkles);
        // Clean up after animation completes
        setTimeout(() => setSparkles([]), 600);
    }, [count, prefersReduced]);

    return (
        <div
            className={`relative inline-flex ${className}`}
            onClick={burst}
        >
            {children}
            <AnimatePresence>
                {sparkles.map((sparkle) => (
                    <motion.svg
                        key={sparkle.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: "50%",
                            top: "50%",
                            width: sparkle.size,
                            height: sparkle.size,
                        }}
                        viewBox="0 0 24 24"
                        initial={{
                            x: 0,
                            y: 0,
                            scale: 0,
                            opacity: 1,
                            rotate: 0,
                        }}
                        animate={{
                            x: sparkle.x,
                            y: sparkle.y,
                            scale: [0, 1.2, 0.8],
                            opacity: [1, 1, 0],
                            rotate: sparkle.rotation,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                    >
                        {/* 4-point star shape */}
                        <path
                            d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                            fill={sparkle.color}
                        />
                    </motion.svg>
                ))}
            </AnimatePresence>
        </div>
    );
}
