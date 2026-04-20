"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface JarvisHaloProps {
  state: "idle" | "listening" | "processing" | "speaking";
  className?: string;
}

export function JarvisHalo({ state, className }: JarvisHaloProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Rings */}
      <motion.div
        animate={{
          rotate: state === "processing" ? 360 : [0, 360],
          scale: state === "listening" ? [1, 1.1, 1] : 1,
        }}
        transition={{
          rotate: { duration: state === "processing" ? 1 : 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.5, repeat: state === "listening" ? Infinity : 0 },
        }}
        className={cn(
          "absolute w-40 h-40 rounded-full border-2 border-dashed opacity-20",
          state === "listening" ? "border-cyan-400" : "border-violet-400"
        )}
      />

      <motion.div
        animate={{
          rotate: -360,
          scale: state === "speaking" ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.2, repeat: state === "speaking" ? Infinity : 0 },
        }}
        className="absolute w-32 h-32 rounded-full border border-violet-500/30"
      />

      {/* Internal Glow Orb */}
      <motion.div
        animate={{
          scale: state === "listening" ? [1, 1.2, 1] : 1,
          boxShadow: state === "listening" 
            ? "0 0 40px rgba(34, 211, 238, 0.6)" 
            : "0 0 20px rgba(139, 92, 246, 0.4)",
        }}
        className={cn(
          "w-16 h-16 rounded-full bg-gradient-to-br transition-colors duration-500",
          state === "listening" 
            ? "from-cyan-400 to-blue-500" 
            : "from-violet-500 to-fuchsia-600"
        )}
      />

      {/* Scanning Line (only when processing) */}
      {state === "processing" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t-2 border-cyan-400 rounded-full"
        />
      )}
    </div>
  );
}
