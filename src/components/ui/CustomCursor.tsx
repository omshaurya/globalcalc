"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

interface Ripple { id: number; x: number; y: number }

type CursorState = "default" | "pointer" | "text" | "disabled";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<CursorState>("default");
  const [clicking, setClicking] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springCfg = { damping: 26, stiffness: 280, mass: 0.4 };
  const ringX = useSpring(mouseX, springCfg);
  const ringY = useSpring(mouseY, springCfg);

  useEffect(() => {
    setMounted(true);
    const isT = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouch(isT);
    if (isT) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onMqChange);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);

      const el = document.elementFromPoint(e.clientX, e.clientY) as Element | null;
      if (!el) { setState("default"); return; }

      const isDisabled = !!el.closest("[disabled],[aria-disabled='true'],.cursor-not-allowed");
      const isText = !!el.closest("input,textarea,[contenteditable]");
      const isPointer = !!el.closest(
        "a,button,[role='button'],[role='link'],label,[tabindex],.cursor-pointer,.premium-card,.card-shadow,select"
      );

      setState(isDisabled ? "disabled" : isText ? "text" : isPointer ? "pointer" : "default");
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const onClick = (e: MouseEvent) => {
      const id = nextId.current++;
      setRipples(p => [...p, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("click", onClick);
      mq.removeEventListener("change", onMqChange);
    };
  }, [mouseX, mouseY]);

  if (!mounted || isTouch || reduced) return null;

  const isPointer = state === "pointer";
  const isText    = state === "text";
  const isDisabled = state === "disabled";

  const dotSize  = clicking ? 6  : isText ? 3  : isPointer ? 10 : 8;
  const ringSize = clicking ? 28 : isText ? 22 : isPointer ? 54 : 36;
  const ringOpacity = visible ? (isPointer ? 0.85 : isDisabled ? 0.25 : 0.55) : 0;

  return (
    <>
      {/* Hide native cursor everywhere */}
      <style>{`html, html * { cursor: none !important; }`}</style>

      {/* Inner dot — follows exactly */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none"
        style={{
          zIndex: 9999,
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          background: isDisabled ? "var(--muted-foreground)" : "var(--primary)",
          boxShadow: isPointer
            ? "0 0 14px 5px rgba(99,102,241,0.55)"
            : "0 0 7px 2px rgba(99,102,241,0.3)",
        }}
        animate={{ width: dotSize, height: dotSize, scale: clicking ? 0.65 : 1 }}
        transition={{ type: "spring", damping: 40, stiffness: 600, mass: 0.2 }}
      />

      {/* Outer ring — spring-lagged */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none"
        style={{
          zIndex: 9998,
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          border: `1.5px solid var(--primary)`,
          opacity: ringOpacity,
          boxShadow: isPointer
            ? "0 0 20px 3px rgba(99,102,241,0.22), inset 0 0 8px 1px rgba(99,102,241,0.08)"
            : "none",
          backdropFilter: isPointer ? "blur(1px)" : "none",
        }}
        animate={{ width: ringSize, height: ringSize, scale: clicking ? 0.82 : 1 }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
      />

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="fixed top-0 left-0 rounded-full pointer-events-none border border-[var(--primary)]"
            style={{
              zIndex: 9997,
              x: r.x,
              y: r.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ width: 0, height: 0, opacity: 0.7 }}
            animate={{ width: 90, height: 90, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
