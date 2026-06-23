"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number; // delay between letters in ms
  duration?: number; // duration of animation for each letter in seconds
  ease?: string;
  splitType?: 'chars' | 'words';
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = "",
  delay = 30,
  duration = 0.5,
  ease = "easeOut",
  splitType = "chars",
  threshold = 0.1,
  rootMargin = "0px",
  tag = "span",
  textAlign = "center",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const items = splitType === "chars" ? text.split("") : text.split(" ");
  const Tag = tag;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ textAlign, display: "inline-block" }}
    >
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{
            duration: duration,
            delay: (index * delay) / 1000,
            ease: ease,
          }}
          onAnimationComplete={
            index === items.length - 1 ? onLetterAnimationComplete : undefined
          }
          style={{
            display: "inline-block",
            whiteSpace: item === " " ? "pre" : "normal",
          }}
        >
          {item === " " && splitType === "chars" ? "\u00A0" : item}
          {splitType === "words" && index < items.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
