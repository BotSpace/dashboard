"use client";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export function SectionWrapper({ children, className = "", id, style }: SectionWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const controls = useAnimation();

  useEffect(() => setMounted(true), []);

  // Fade content in once it scrolls into view. We start near-visible
  // (opacity 0.45) so a section is never a fully black void while the
  // observer catches up — and we force the "shown" state instantly when
  // the user lands here via an in-page anchor (e.g. #pricing).
  useEffect(() => {
    if (!mounted) return;
    const node = ref.current;
    if (!node) return;

    const show = () => {
      controls.start({ opacity: 1, y: 0 });
    };

    // Arrived via an anchor that targets this section → show immediately.
    if (id && typeof window !== "undefined" && window.location.hash === `#${id}`) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);

    // Anchor clicks change the hash without remounting — reveal the
    // targeted section immediately so it isn't stuck dark mid-scroll.
    const onHash = () => {
      if (id && window.location.hash === `#${id}`) show();
    };
    window.addEventListener("hashchange", onHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, [mounted, id, controls]);

  if (!mounted) {
    return (
      <section id={id} className={className} style={style}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0.45, y: 24 }}
      animate={controls}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
