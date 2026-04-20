"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAssistantStore } from "@/lib/store";

export function AssistantPulse() {
  const { state, volume } = useAssistantStore();

  if (state === "off" || state === "idle") return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[100]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative flex items-center justify-center"
        >
          {/* Main Ring */}
          <motion.div
            className="absolute w-32 h-32 rounded-full border-4 border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]"
            animate={{
              scale: state === "listening" ? [1, 1 + (volume / 200), 1] : 1,
              borderColor: state === "processing" ? ["rgba(139,92,246,0.3)", "rgba(232,121,249,0.3)"] : "rgba(139,92,246,0.3)",
              rotate: state === "processing" ? 360 : 0
            }}
            transition={{
              scale: { duration: 0.1 },
              rotate: { repeat: Infinity, duration: 2, ease: "linear" },
              borderColor: { repeat: Infinity, duration: 1, repeatType: "mirror" }
            }}
          />

          {/* Inner Glow Core */}
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_0_30px_rgba(139,92,246,0.8)]"
            animate={{
              scale: state === "listening" ? [1, 1 + (volume / 100), 1] : state === "speaking" ? [1, 1.2, 1] : 1,
              opacity: state === "processing" ? [1, 0.5, 1] : 1
            }}
            transition={{
              scale: { duration: 0.1 },
              opacity: { repeat: Infinity, duration: 0.8 }
            }}
          />

          {/* Wave Orbits (Listening only) */}
          {state === "listening" && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-violet-400/20"
                  initial={{ width: 60, height: 60, opacity: 0.5 }}
                  animate={{
                    width: [60, 160 + (volume * 1.5)],
                    height: [60, 160 + (volume * 1.5)],
                    opacity: [0.5, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.6,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}

          {/* Processing Particles */}
          {state === "processing" && (
            <motion.div
              className="absolute w-40 h-40"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-fuchsia-400 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${i * 90}deg) translateY(-20px)`
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Visual State Hint */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-32 text-violet-600 font-medium text-sm bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-violet-100 shadow-sm"
      >
        {state === "listening" ? "Dinliyorum..." : state === "processing" ? "Düşünüyorum..." : "Konuşuyorum..."}
      </motion.div>
    </div>
  );
}
