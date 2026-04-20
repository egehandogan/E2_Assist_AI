"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Plus, CheckCheck, Landmark, Globe2, CheckSquare, Calendar, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, cn } from "@/lib/utils";
import { useNotificationStore, useAssistantStore } from "@/lib/store";
import Link from "next/link";
import { Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  grant_program: { icon: Landmark, color: "text-emerald-600", bg: "bg-emerald-100" },
  eu_project: { icon: Globe2, color: "text-blue-600", bg: "bg-blue-100" },
  new_task: { icon: CheckSquare, color: "text-amber-600", bg: "bg-amber-100" },
  upcoming_task: { icon: CheckSquare, color: "text-orange-600", bg: "bg-orange-100" },
  upcoming_meeting: { icon: Calendar, color: "text-violet-600", bg: "bg-violet-100" },
  new_email: { icon: Mail, color: "text-pink-600", bg: "bg-pink-100" },
};

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const today = formatDate(new Date());
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, fetch: fetchNotifs, markRead, markAllRead } = useNotificationStore();
  const { state, toggle, volume } = useAssistantStore();

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const recent = notifications.slice(0, 8);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100">
      <div className="min-w-0 flex-1 mr-3">
        <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle || today}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Assistant Trigger - To the left of search */}
        <button
          onClick={() => toggle()}
          className={cn(
            "relative p-2 rounded-lg transition-all border w-10 h-9 flex items-center justify-center overflow-hidden",
            state === "off" 
              ? "bg-white border-gray-100 text-gray-400 hover:bg-gray-50" 
              : "bg-violet-600 border-violet-400 text-white shadow-md"
          )}
          title={state === "off" ? "Egeman Asistanı Aç" : "Egeman Asistanı Kapat"}
        >
          <AnimatePresence mode="wait">
            {state === "listening" ? (
              <motion.div 
                key="listening"
                className="flex items-center gap-0.75"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.75 bg-fuchsia-400 rounded-full shadow-[0_0_8px_rgba(232,121,249,0.6)]"
                    animate={{ 
                      height: [6, Math.max(6, (volume / (i + 1)) * 0.6 + 6), 6] 
                    }}
                    transition={{ repeat: Infinity, duration: 0.15, delay: i * 0.03 }}
                  />
                ))}
              </motion.div>
            ) : state === "processing" ? (
              <motion.div
                key="processing"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
            ) : state === "speaking" ? (
              <motion.div
                key="speaking"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                <div className="w-3 h-3 bg-fuchsia-400 rounded-full shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
              </motion.div>
            ) : (
              <motion.div key={state === "off" ? "mic-off" : "mic-on"}>
                {state === "off" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Search - hidden on small mobile */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Ara..." className="pl-9 w-64 h-9 text-sm" />
        </div>

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Bildirimler</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={() => markAllRead()} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tümünü oku
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Henüz bildirim yok</p>
                  </div>
                ) : (
                  recent.map((n) => {
                    const config = typeConfig[n.type] ?? { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" };
                    const Icon = config.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.isRead) markRead(n.id); }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50",
                          !n.isRead && "bg-violet-50/40"
                        )}
                      >
                        <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs leading-snug", !n.isRead ? "font-semibold text-gray-900" : "text-gray-700")}>{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-gray-300 mt-1">
                            {new Date(n.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {!n.isRead && <div className="flex-shrink-0 mt-1 w-2 h-2 bg-violet-500 rounded-full" />}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block text-center text-xs text-violet-600 hover:text-violet-700 font-medium">
                  Tüm bildirimleri görüntüle
                </Link>
              </div>
            </div>
          )}
        </div>

        <Button size="sm" className="gap-1.5 h-8 sm:h-9">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni</span>
        </Button>
      </div>
    </header>
  );
}
