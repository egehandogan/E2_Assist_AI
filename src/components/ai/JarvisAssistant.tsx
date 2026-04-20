"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssistantStore } from "@/lib/store";
import { AssistantPulse } from "./AssistantPulse";

export function JarvisAssistant() {
  const router = useRouter();
  const { state, setState, isWakeWordMode, setVolume } = useAssistantStore();
  const [isPendingCommand, setIsPendingCommand] = useState(false);
  const [interimText, setInterimText] = useState("");
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    
    utterance.onstart = () => {
      setState("speaking");
      try { recognitionRef.current.stop(); } catch {} // Stop listening while speaking
    };
    utterance.onend = () => {
      if (isPendingCommand) {
        setIsPendingCommand(false);
        setInterimText(""); // Clear for fresh command
        setState("listening");
        // Recognition will auto-restart via useEffect or onend
      } else {
        setState(isWakeWordMode ? "idle" : "off");
      }
    };
    synthRef.current.speak(utterance);
  }, [isWakeWordMode, setState, isPendingCommand]);

  const processCommand = useCallback(async (text: string) => {
    setState("processing");
    try {
      const res = await fetch("/api/assistant/voice", {
        method: "POST",
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      
      if (data.response) {
        if (!data.immediateFeedback) speak(data.response);
      }
      
      if (data.action === "navigate" && data.target) {
        setTimeout(() => {
          router.push(data.target);
        }, 1500); // Give some time for TTS to start/finish
      }
      
      if (data.actionRequired) {
        // Handle UI navigation or complex actions if needed
      }
    } catch {
      speak("Üzgünüm, bir hata oluştu.");
      setState("idle");
    }
  }, [speak, setState, router]);

  useEffect(() => {
    recognitionRef.current.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const text = lastResult[0].transcript.toLowerCase();
      setInterimText(text);

      if (lastResult.isFinal) {
        if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
        
        if (state === "speaking" && text.length > 5) {
          synthRef.current?.cancel();
          setInterimText("");
          setState("listening");
          return;
        }

        if (state === "listening") {
          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
          processCommand(text);
          setInterimText("");
        } else if (isWakeWordMode && text.includes("egeman")) {
          // Check if there is a command immediately following the wake word
          const commandAfterName = text.split("egeman")[1]?.trim();
          if (commandAfterName && commandAfterName.length > 3) {
            processCommand(commandAfterName);
          } else {
            setIsPendingCommand(true); // Flag to listen after Efendim
            setInterimText("");
            setState("listening"); // Set state first
            speak("Efendim?");
          }
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
  }, [isWakeWordMode, state, speak, processCommand, setState, isPendingCommand]);

  // Audio Level Analysis
  useEffect(() => {
    if (state !== "listening") {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      setVolume(0);
      return;
    }

    // Set a timeout to check if the user is silent
    silenceTimeoutRef.current = setTimeout(() => {
      if (state === "listening") {
        speak("Pardon, sizi tam duyamadım. Tekrar eder misiniz?");
        setState("idle");
      }
    }, 12000); // 12 seconds of total silence before giving up

    let stream: MediaStream | null = null;

    const startAnalysis = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!audioContextRef.current) {
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }
        const currentAudioCtx = audioContextRef.current!;
        analyserRef.current = currentAudioCtx.createAnalyser();
        const source = currentAudioCtx.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          const currentAnalyser = analyserRef.current;
          if (!currentAnalyser) return;
          
          currentAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          // Aggressive sensitivity: Multiplier increased to 4.0
          const normalizedVolume = Math.min(100, Math.floor(Math.pow(average, 1.3) * 4.0));
          setVolume(normalizedVolume);

          // Early Speech Detection: If volume drops after being high, trigger processing
          if (state === "listening" && normalizedVolume < 5 && interimText.length > 3) {
            if (!speechEndTimeoutRef.current) {
              speechEndTimeoutRef.current = setTimeout(() => {
                if (state === "listening" && interimText.length > 3) {
                  processCommand(interimText);
                  setInterimText("");
                }
              }, 500); // 0.5 seconds of silence = end of speech (Ultra-fast)
            }
          } else if (normalizedVolume > 15) {
            if (speechEndTimeoutRef.current) {
              clearTimeout(speechEndTimeoutRef.current);
              speechEndTimeoutRef.current = null;
            }
          }

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        if (currentAudioCtx.state === "suspended") {
          await currentAudioCtx.resume();
        }
        updateVolume();
      } catch (err) {
        console.error("Audio analysis failed", err);
      }
    };

    startAnalysis();

    const currentFrame = animationFrameRef.current;
    const currentContext = audioContextRef.current;
    
    return () => {
      if (currentFrame) cancelAnimationFrame(currentFrame);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (currentContext) currentContext.close();
      if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
    };
  }, [state, setVolume, interimText, processCommand, speak, setState]);

  return (
    <>
      <AssistantPulse />
    </>
  );
}

