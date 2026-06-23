"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { Shield, FileText, Box, Link2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const ORANGE: [number, number, number] = [1, 0.34, 0.13];
const BASE: [number, number, number] = [0.05, 0.05, 0.05];

const FLOATING_ICONS = [
  { Icon: Shield, position: "left-[4%] top-[38%]", size: "w-11 h-11", style: "bg-[#ff5722] border-[#ff5722]/50 text-white", delay: "0s" },
  { Icon: FileText, position: "left-[14%] top-[18%]", size: "w-10 h-10", style: "bg-[#1a1008]/80 border-white/10 text-neutral-300", delay: "0.4s" },
  { Icon: Box, position: "left-1/2 top-[2%] -translate-x-1/2", size: "w-9 h-9", style: "bg-[#111] border-white/10 text-neutral-400", delay: "0.8s" },
  { Icon: MessageSquare, position: "right-[6%] top-[22%]", size: "w-14 h-14", style: "bg-[#1a1008]/60 border-white/8 text-neutral-300", delay: "1.2s" },
  { Icon: Link2, position: "right-[12%] bottom-[18%]", size: "w-9 h-9", style: "bg-white border-white text-[#ff5722]", delay: "1.6s" },
];

function OrbitRing({ size, duration, reverse }: { size: string; duration: string; reverse?: boolean }) {
  return (
    <div
      className={cn(
        "absolute rounded-full border border-[#ff5722]/15 pointer-events-none",
        reverse ? "animate-orbit-spin-reverse" : "animate-orbit-spin"
      )}
      style={{ width: size, height: size, animationDuration: duration }}
    />
  );
}

export function HeroGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let phi = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;
    const isMobile = window.innerWidth < 768;
    const mapSamples = isMobile ? 8000 : 16000;

    const getSize = () => Math.min(container.offsetWidth, 520);

    const initGlobe = (size: number) => {
      if (size <= 0) return;
      const dim = size * 2;
      if (globe) {
        globe.update({ width: dim, height: dim });
        return;
      }
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: dim,
        height: dim,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples,
        mapBrightness: 6,
        baseColor: BASE,
        markerColor: ORANGE,
        glowColor: ORANGE,
        markers: [],
        onRender: (state) => {
          state.phi = phi + pointerRef.current.x * 0.35;
          state.theta = 0.25 + pointerRef.current.y * 0.15;
          phi += 0.004;
        },
      } as COBEOptions & { onRender: (state: Partial<COBEOptions>) => void });
    };

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
    };

    initGlobe(getSize());

    const ro = new ResizeObserver(() => {
      initGlobe(getSize());
    });
    ro.observe(container);
    window.addEventListener("mousemove", onMove);

    return () => {
      globe?.destroy();
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[800px] mx-auto h-72 sm:h-96 flex items-end justify-center pointer-events-none select-none"
    >
      {/* Horizon glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[20%] w-[70%] h-[45%] rounded-full opacity-60"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(255,87,34,0.35) 0%, rgba(255,87,34,0.08) 45%, transparent 70%)",
        }}
      />

      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitRing size="95%" duration="32s" />
        <OrbitRing size="78%" duration="24s" reverse />
        <OrbitRing size="62%" duration="18s" />
      </div>

      {/* Globe canvas with radial mask */}
      <div
        className="relative w-full aspect-square max-w-[min(100%,520px)] -mb-[12%]"
        style={{
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 55%, transparent 72%)",
          maskImage: "radial-gradient(circle at 50% 50%, black 55%, transparent 72%)",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ contain: "layout paint size" }}
        />
      </div>

      {/* Floating orbital icons */}
      {FLOATING_ICONS.map(({ Icon, position, size, style, delay }) => (
        <div key={position} className={cn("absolute", position)}>
          <div
            className={cn(
              "rounded-full border flex items-center justify-center animate-float shadow-lg shadow-black/40",
              size,
              style
            )}
            style={{ animationDelay: delay }}
          >
            <Icon className="w-[45%] h-[45%]" strokeWidth={1.75} />
          </div>
        </div>
      ))}
    </div>
  );
}
