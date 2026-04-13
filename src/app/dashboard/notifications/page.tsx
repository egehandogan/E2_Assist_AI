"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Bell, CheckCheck, Trash2, Landmark, Globe2, CheckSquare,
  Calendar, Mail, Loader2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore, type Notification } from "@/lib/store";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: typeof Bell; label: string; color: string; bg: string }> = {
  grant_program: { icon: Landmark, label: "Hibe Programı", color: "text-emerald-600", bg: "bg-emerald-100" },
  eu_project: { icon: Globe2, label: "AB Projesi", color: "text-blue-600", bg: "bg-blue-100" },
  new_task: { icon: CheckSquare, label: "Yeni Görev", color: "text-amber-600", bg: "bg-amber-100" },
  upcoming_task: { icon: CheckSquare, label: "Yaklaşan Görev", color: "text-orange-600", bg: "bg-orange-100" },
  upcoming_meeting: { icon: Calendar, label: "Yaklaşan Toplantı", color: "text-violet-600", bg: "bg-violet-100" },
  new_email: { icon: Mail, label: "Yeni E-posta", color: "text-pink-600", bg: "bg-pink-100" },
};

type FilterType = "all" | "unread" | "grant_program" | "eu_project" | "upcoming_task" | "upcoming_meeting";

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, fetch: fetchNotifs, markRead, markAllRead, remove, generate } = useNotificationStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  const handleGenerate = async () => {
    setGenerating(true);
    await generate();
    setGenerating(false);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "unread", label: `Okunmamış (${unreadCount})` },
    { key: "grant_program", label: "Hibe" },
    { key: "eu_project", label: "AB Projeleri" },
    { key: "upcoming_task", label: "Görevler" },
    { key: "upcoming_meeting", label: "Toplantılar" },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Bildirimler" subtitle="Tüm bildirimler ve uyarılar" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            <p className="text-xs text-gray-500 mt-1">Toplam</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{unreadCount}</p>
            <p className="text-xs text-gray-500 mt-1">Okunmamış</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {notifications.filter((n) => n.type === "grant_program" || n.type === "eu_project").length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Hibe/AB</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  filter === f.key ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Güncelle
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => markAllRead()}>
                <CheckCheck className="w-3.5 h-3.5" />
                Tümünü Oku
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Bildirim bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const config = typeConfig[n.type] ?? { icon: Bell, label: n.type, color: "text-gray-500", bg: "bg-gray-100" };
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border bg-white transition-all hover:shadow-sm",
                    !n.isRead && "border-violet-200 bg-violet-50/30"
                  )}
                >
                  <div className={cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{config.label}</Badge>
                          {!n.isRead && <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className={cn("text-sm leading-snug", !n.isRead ? "font-semibold text-gray-900" : "text-gray-700")}>
                          {n.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(n.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                        >
                          Okundu olarak işaretle
                        </button>
                      )}
                      {n.link && (
                        <a href={n.link} className="text-xs text-blue-600 hover:underline">Detaya git</a>
                      )}
                      <button
                        onClick={() => remove(n.id)}
                        className="text-xs text-gray-400 hover:text-red-500 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
