"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAssistantStore } from "@/lib/store";

export function JarvisAssistant() {
  const { state, setState, isWakeWordMode, setVolume } = useAssistantStore();
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
      
      if (data.response) {
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

  // Audio Level Analysis
  useEffect(() => {
    if (state !== "listening") {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolume(0);
      return;
    }

    let stream: MediaStream | null = null;

    const startAnalysis = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const currentAudioCtx = audioContextRef.current;
        if (!currentAudioCtx) return;
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
          setVolume(Math.min(100, Math.floor(average * 1.5)));
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

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
    };
  }, [state, setVolume]);

  // Center overlay removed as per user request
  return null;
}

