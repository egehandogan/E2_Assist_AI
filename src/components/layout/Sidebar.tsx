"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Calendar,
  CheckSquare,
  Bot,
  FolderOpen,
  FileText,
  StickyNote,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNotificationStore } from "@/lib/store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "E-postalar", href: "/dashboard/email", icon: Mail },
  { label: "Takvim & Toplantılar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Görevler", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "AI Asistan", href: "/dashboard/ai", icon: Bot },
  { label: "Kütüphane", href: "/dashboard/library", icon: FolderOpen },
  { label: "Dokümanlar", href: "/dashboard/documents", icon: FileText },
  { label: "Notlar", href: "/dashboard/notes", icon: StickyNote },
  { label: "Ayarlar", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount, fetch: fetchNotifs, generate } = useNotificationStore();

  useEffect(() => {
    fetchNotifs();
    generate();
    // Poll every 5 minutes
    const interval = setInterval(() => { fetchNotifs(); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifs, generate]);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="flex-shrink-0 w-8 h-8 rounded-lg"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight">Asistan Panel</p>
            <p className="text-xs text-gray-400 truncate">Nurevşan Doğan</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Notification link */}
        <Link
          href="/dashboard/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            pathname === "/dashboard/notifications"
              ? "bg-violet-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
          title={collapsed ? "Bildirimler" : undefined}
        >
          <div className="relative flex-shrink-0">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && <span className="truncate">Bildirimler</span>}
          {!collapsed && unreadCount > 0 && (
            <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="border-t border-gray-700 my-2" />

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">ND</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Nurevşan Doğan</p>
              <p className="text-xs text-gray-400 truncate">Dernek Başkanı</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors border border-gray-600 z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-300" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-300" />
        )}
      </button>
    </aside>
  );
}
