"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useRef, useEffect, useState } from "react";

type PointerHighlightProps = {
  children: React.ReactNode;
  rectangleClassName?: string;
  pointerClassName?: string;
  containerClassName?: string;
  /**
   * Durasi 1 siklus animasi (detik)
   * default: 1.2
   */
  duration?: number;
  /**
   * Jeda antar pengulangan animasi (detik)
   * default: 0
   */
  repeatDelay?: number;
  /**
   * Jika true, pointer bergerak bolak-balik (reverse).
   * Jika false, pointer kembali ke awal tanpa reverse.
   * default: true
   */
  pingPong?: boolean;
  /**
   * Margin ekstra pergerakan pointer dari sudut kanan-bawah.
   * default: 4
   */
  pointerOffset?: number;
};

export function PointerHighlight({
  children,
  rectangleClassName,
  pointerClassName,
  containerClassName,
  duration = 1.2,
  repeatDelay = 0,
  pingPong = true,
  pointerOffset = 4,
}: PointerHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const update = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      setDimensions({ width, height });
    };

    update();

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const ready = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div
      className={cn("relative w-fit", containerClassName)}
      ref={containerRef}
    >
      {children}

      {ready && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 0.98, originX: 0, originY: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Rectangle border: animasi pakai scaleX & scaleY (GPU-friendly) */}
          <motion.div
            className={cn(
              "absolute inset-0 border border-neutral-800 dark:border-neutral-200",
              rectangleClassName
            )}
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transformOrigin: "top left",
            }}
            initial={{ scaleX: 0, scaleY: 0 }}
            animate={{ scaleX: [0, 1], scaleY: [0, 1] }}
            transition={{
              duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: pingPong ? "reverse" : "loop",
              repeatDelay,
            }}
          />

          {/* Pointer: bergerak dari (0,0) ke (w+offset, h+offset) */}
          <motion.div
            className="pointer-events-none absolute"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: 1,
              x: [0, dimensions.width + pointerOffset],
              y: [0, dimensions.height + pointerOffset],
            }}
            style={{ rotate: -90 }}
            transition={{
              opacity: { duration: 0.12, ease: "easeInOut" },
              duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: pingPong ? "reverse" : "loop",
              repeatDelay,
            }}
          >
            <Pointer
              className={cn("h-5 w-5 text-blue-500", pointerClassName)}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

const Pointer = ({ ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
    </svg>
  );
};
