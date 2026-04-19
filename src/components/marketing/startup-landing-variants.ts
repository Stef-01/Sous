/** Shared Framer Motion variants  -  startup landing (HealthifyMe-style depth + YC polish). */

export const springSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 30,
  mass: 0.55,
};

export const springSoft = {
  type: "spring" as const,
  stiffness: 260,
  damping: 32,
  mass: 0.85,
};

export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const containerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSnappy,
  },
};

export const fadeUpTight = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springSoft, delay: 0 },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
};

export const lineReveal = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

export const viewportOnce = {
  once: true,
  margin: "-60px 0px -80px 0px",
  amount: 0.2,
};
