"use client";
import { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export function SectionWrapper({ children, className = "", id, style }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" as const }}
    >
      {children}
    </motion.section>
  );
}
