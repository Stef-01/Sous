"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Particle {
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: string;
    shape: "circle" | "rect" | "star";
    delay: number;
}

const CONFETTI_COLORS = [
    "#D4A84B", // nourish gold
    "#22c55e", // balanced green
    "#E8C97A", // light gold
    "#4ade80", // bright green
    "#B8902F", // deep gold
    "#86efac", // pale green
    "#F0DDA0", // pale gold
    "#16a34a", // forest green
];

let particleIdCounter = 0;

function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 180;
        return {
            id: particleIdCounter++,
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity - 60, // bias upward
            rotation: Math.random() * 720 - 360,
            scale: 0.4 + Math.random() * 0.8,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            shape: (["circle", "rect", "star"] as const)[Math.floor(Math.random() * 3)],
            delay: Math.random() * 0.15,
        };
    });
}

interface ConfettiBurstProps {
    /** Trigger the burst */
    trigger: boolean;
    /** Number of particles */
    count?: number;
}

/**
 * Celebratory confetti burst — fires gold + green particles
 * when a balanced plate is achieved.
 */
export default function ConfettiBurst({ trigger, count = 40 }: ConfettiBurstProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const prefersReduced = useReducedMotion();

    const burst = useCallback(() => {
        if (prefersReduced) return;
        setParticles(generateParticles(count));
        // Clean up after animation
        setTimeout(() => setParticles([]), 1400);
    }, [count, prefersReduced]);

    useEffect(() => {
        if (trigger) burst();
    }, [trigger, burst]);

    if (prefersReduced) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute"
                        style={{
                            left: "50%",
                            top: "50%",
                            width: p.shape === "star" ? 10 * p.scale : 8 * p.scale,
                            height: p.shape === "circle" ? 8 * p.scale : p.shape === "rect" ? 5 * p.scale : 10 * p.scale,
                            borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "1px" : "0",
                            backgroundColor: p.shape !== "star" ? p.color : "transparent",
                        }}
                        initial={{
                            x: 0,
                            y: 0,
                            scale: 0,
                            opacity: 1,
                            rotate: 0,
                        }}
                        animate={{
                            x: p.x,
                            y: p.y + 120, // gravity pull
                            scale: [0, 1.2, 1, 0.6],
                            opacity: [1, 1, 0.8, 0],
                            rotate: p.rotation,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.1 + Math.random() * 0.3,
                            delay: p.delay,
                            ease: [0.22, 0.68, 0.35, 1],
                        }}
                    >
                        {p.shape === "star" && (
                            <svg viewBox="0 0 24 24" className="w-full h-full">
                                <path
                                    d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                                    fill={p.color}
                                />
                            </svg>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
