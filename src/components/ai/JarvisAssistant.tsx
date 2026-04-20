"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JarvisHalo } from "./JarvisHalo";
import { VoiceWave } from "./VoiceWave";
import { X } from "lucide-react";

import { useAssistantStore } from "@/lib/store";

export function JarvisAssistant() {
  const { state, setState, isWakeWordMode } = useAssistantStore();
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Services
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "tr-TR";
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    
    // Find a soft male voice if possible
    const voices = synthRef.current.getVoices();
    const maleVoice = voices.find(v => v.lang.startsWith("tr") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("erkek")));
    if (maleVoice) utterance.voice = maleVoice;
    
    utterance.onstart = () => setState("speaking");
    utterance.onend = () => setState(isWakeWordMode ? "idle" : "off");
    synthRef.current.speak(utterance);
  }, [isWakeWordMode, setState]);

  const processCommand = useCallback(async (text: string) => {
    setState("processing");
    try {
      const res = await fetch("/api/assistant/voice", {
        method: "POST",
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      
      if (data.immediateFeedback) {
        speak(data.immediateFeedback);
      }
      
      if (data.response) {
        setResponse(data.response);
        if (!data.immediateFeedback) speak(data.response);
      }
      
      if (data.actionRequired) {
        // Handle UI navigation or complex actions if needed
      }
    } catch {
      speak("Üzgünüm, bir hata oluştu.");
      setState("idle");
    }
  }, [speak, setState]);

  useEffect(() => {
    recognitionRef.current.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const text = lastResult[0].transcript.toLowerCase();

      if (lastResult.isFinal) {
        setTranscript(text);
        // Barge-in: If user says something while speaking, stop speaking and listen
        if (state === "speaking" && text.length > 5) {
          synthRef.current?.cancel();
          setState("listening");
        }

        if (state === "listening") {
          processCommand(text);
        } else if (isWakeWordMode && text.includes("egeman")) {
          setState("listening");
          speak("Efendim?");
        }
      }
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if we are supposed to be active
      if (isWakeWordMode && state !== "off") {
        try { recognitionRef.current.start(); } catch {}
      }
    };

    if (isWakeWordMode && state === "idle") {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }

    return () => {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
    };
  }, [isWakeWordMode, state, speak, processCommand, setState]);

  // Floating button removed as it's now in TopBar
  return (
    <>


      <AnimatePresence>
        {state !== "off" && state !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              layoutId="assistant-orb"
              className="flex flex-col items-center gap-8"
            >
              <JarvisHalo state={state} />
              
              <div className="text-center max-w-lg px-6">
                <AnimatePresence mode="wait">
                  {state === "listening" && (
                    <motion.div
                      key="listening"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="space-y-4"
                    >
                      <VoiceWave />
                      <p className="text-cyan-400 font-medium tracking-widest uppercase text-xs">Sizi Dinliyorum...</p>
                      <p className="text-white text-xl font-light italic opacity-80">&quot;{transcript || "..."}&quot;</p>
                    </motion.div>
                  )}
                  {state === "processing" && (
                    <motion.div
                      key="processing"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-violet-400 font-medium tracking-widest uppercase text-xs">Komut İşleniyor</p>
                      <div className="flex gap-1 justify-center">
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-violet-400 rounded-full" />
                      </div>
                    </motion.div>
                  )}
                  {state === "speaking" && (
                    <motion.div
                      key="speaking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                       <p className="text-fuchsia-400 font-medium tracking-widest uppercase text-xs">Egeman Yanıtlıyor</p>
                       <p className="text-white text-lg leading-relaxed">{response}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setState("idle")}
                className="mt-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
