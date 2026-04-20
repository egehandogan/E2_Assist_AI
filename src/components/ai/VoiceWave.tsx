"use client";

import { motion } from "framer-motion";

export function VoiceWave() {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [8, 24, 8],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className="w-1 bg-cyan-400 rounded-full"
        />
      ))}
    </div>
  );
}
