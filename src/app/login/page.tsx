"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";

// ── Feature cards shown on the left panel ──────────────────────────────────
const features = [
  {
    icon: Mail,
    title: "E-posta Yönetimi",
    desc: "Gmail entegrasyonu ile otomatik analiz ve özetleme",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Calendar,
    title: "Akıllı Takvim",
    desc: "Toplantı planlama, not tutma ve özet çıkarma",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: CheckSquare,
    title: "Görev Takibi",
    desc: "AI destekli görev oluşturma ve önceliklendirme",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: FileText,
    title: "Doküman Arşivi",
    desc: "Google Drive bağlantısı ve akıllı arama",
    color: "from-emerald-500 to-green-500",
  },
];

// ── Floating orb component for background effect ───────────────────────────
function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Rotate the feature highlight every 3 seconds
  useState(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  });

  // Google OAuth sign-in
  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = "/api/auth/signin/google";
  };

  // Demo mode — creates demo user and enters dashboard
  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      router.push("/dashboard");
    } catch {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950">
      {/* ── LEFT PANEL — Feature showcase (hidden on mobile) ── */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between p-10 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-gray-950 to-indigo-950" />
        <FloatingOrb className="w-96 h-96 bg-violet-600 -top-20 -left-20" />
        <FloatingOrb
          className="w-80 h-80 bg-indigo-600 bottom-20 right-10"
          delay={2}
        />
        <FloatingOrb
          className="w-64 h-64 bg-purple-500 top-1/3 left-1/3"
          delay={4}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top — Logo & brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Asistan Panel
              </h2>
              <p className="text-xs text-violet-300/70">
                AI Destekli Yönetim Sistemi
              </p>
            </div>
          </div>
        </div>

        {/* Center — Hero message */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Derneğinizi
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  akıllıca yönetin
                </span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-gray-400 text-base xl:text-lg max-w-md leading-relaxed"
            >
              Yapay zekâ destekli kişisel asistanınız ile e-postalarınızı,
              toplantılarınızı ve görevlerinizi tek bir panelden yönetin.
            </motion.p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                onMouseEnter={() => setActiveFeature(i)}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-default ${
                  activeFeature === i
                    ? "bg-white/[0.08] border-violet-500/30 shadow-lg shadow-violet-500/5"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom — Trust badges */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Güvenli Giriş</span>
          </div>
          <div className="w-px h-3 bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Gemini AI</span>
          </div>
          <div className="w-px h-3 bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Workspace</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login form ── */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-sm space-y-8"
        >
          {/* Mobile logo (only visible on small screens) */}
          <div className="flex flex-col items-center gap-3 lg:hidden mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-xl"
              />
            </div>
            <h2 className="text-xl font-bold text-white">Asistan Panel</h2>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hoş geldiniz
            </h2>
            <p className="text-sm text-gray-400">
              Devam etmek için giriş yapın
            </p>
          </div>

          {/* Login buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading || demoLoading}
              className="group relative w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-black/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {/* Google "G" logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google ile Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600 font-medium">veya</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Demo Sign In */}
            <button
              id="demo-signin-btn"
              onClick={handleDemoSignIn}
              disabled={loading || demoLoading}
              className="group relative w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm hover:from-violet-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
              {demoLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  <span>Demo ile Dene</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </>
              )}
            </button>
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-violet-500/[0.07] border border-violet-500/10"
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-violet-300">
                  Google Workspace Entegrasyonu
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dernek Google Workspace hesabınız ile giriş yaparak Gmail,
                  Calendar ve Drive verilerinize otomatik erişim sağlayın.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom note */}
          <p className="text-center text-[11px] text-gray-600 leading-relaxed">
            Giriş yaparak{" "}
            <span className="text-gray-500 hover:text-gray-400 cursor-pointer">
              Kullanım Koşulları
            </span>{" "}
            ve{" "}
            <span className="text-gray-500 hover:text-gray-400 cursor-pointer">
              Gizlilik Politikası
            </span>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
