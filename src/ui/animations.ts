import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const staggerContainer = (stagger = 0.12): Variants => ({
  hidden: { opacity: 1 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: 0.05 }
  },
});
