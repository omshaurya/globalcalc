"use client";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRef, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

/* ── FadeIn ──────────────────────────────────────────────────────── */
export function FadeIn({
  children, delay = 0, duration = 0.6, className = "",
}: {
  children: ReactNode; delay?: number; duration?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/* ── SlideUp ─────────────────────────────────────────────────────── */
export function SlideUp({
  children, delay = 0, distance = 40, className = "",
}: {
  children: ReactNode; delay?: number; distance?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : distance }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/* ── ScaleIn ─────────────────────────────────────────────────────── */
export function ScaleIn({
  children, delay = 0, className = "",
}: {
  children: ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.88 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay, ease: EASE_SPRING }}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerContainer + StaggerItem ─────────────────────────────── */
export function StaggerContainer({
  children, className = "", delayChildren = 0, staggerChildren = 0.08,
}: {
  children: ReactNode; className?: string; delayChildren?: number; staggerChildren?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: reduced ? 0 : delayChildren,
            staggerChildren: reduced ? 0 : staggerChildren,
          },
        },
      }}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children, className = "",
}: {
  children: ReactNode; className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 22 },
        show: {
          opacity: 1, y: 0,
          transition: { duration: reduced ? 0 : 0.55, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── AnimatedNumber ──────────────────────────────────────────────── */
export function AnimatedNumber({
  value, prefix = "", suffix = "", decimals = 0, className = "",
}: {
  value: number; prefix?: string; suffix?: string; decimals?: number; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setDisplay(value); return; }
    const duration = 1400;
    const start = performance.now();
    const raf = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, value, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

/* ── FloatingCard (3D tilt on hover) ────────────────────────────── */
export function FloatingCard({
  children, className = "", strength = 7, lift = true,
}: {
  children: ReactNode; className?: string; strength?: number; lift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 30, stiffness: 220 });
  const springY = useSpring(y, { damping: 30, stiffness: 220 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [`${strength}deg`, `-${strength}deg`]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [`-${strength}deg`, `${strength}deg`]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      whileHover={lift ? { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" } : {}}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/* ── HoverScale ──────────────────────────────────────────────────── */
export function HoverScale({
  children, scale = 1.03, className = "",
}: {
  children: ReactNode; scale?: number; className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduced ? {} : { scale, y: -2 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      transition={{ type: "spring", damping: 28, stiffness: 350 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Reveal (generic scroll-triggered reveal) ────────────────────── */
export function Reveal({
  children, className = "", delay = 0,
}: {
  children: ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 28, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/* ── AnimatePresenceWrapper (for conditional content) ────────────── */
export function FadePresence({
  show, children, className = "",
}: {
  show: boolean; children: ReactNode; className?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Gradient blob background ────────────────────────────────────── */
export function AnimatedBlob({
  className = "", color = "var(--primary)", size = 400, opacity = 0.06, duration = 8,
}: {
  className?: string; color?: string; size?: number; opacity?: number; duration?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ width: size, height: size, background: color, opacity }}
      animate={reduced ? {} : {
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        scale: [1, 1.08, 0.96, 1.04, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
