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
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNotificationStore } from "@/lib/store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "E-postalar", href: "/dashboard/email", icon: Mail },
  { label: "Takvim", href: "/dashboard/calendar", icon: Calendar },
  { label: "Görevler", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "AI Asistan", href: "/dashboard/ai", icon: Bot },
  { label: "Kütüphane", href: "/dashboard/library", icon: FolderOpen },
  { label: "Dokümanlar", href: "/dashboard/documents", icon: FileText },
  { label: "Notlar", href: "/dashboard/notes", icon: StickyNote },
  { label: "Ayarlar", href: "/dashboard/settings", icon: Settings },
];

// Bottom bar shows only the most-used 5 items on mobile
const bottomBarItems = [
  { label: "Ana Sayfa", href: "/dashboard", icon: LayoutDashboard },
  { label: "E-posta", href: "/dashboard/email", icon: Mail },
  { label: "Görevler", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "AI", href: "/dashboard/ai", icon: Bot },
  { label: "Notlar", href: "/dashboard/notes", icon: StickyNote },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount, fetch: fetchNotifs, generate } = useNotificationStore();

  useEffect(() => {
    fetchNotifs();
    generate();
    const interval = setInterval(() => { fetchNotifs(); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifs, generate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navContent = (
    <>
      {/* Notification link */}
      <Link
        href="/dashboard/notifications"
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          pathname === "/dashboard/notifications"
            ? "bg-violet-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        <div className="relative flex-shrink-0">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <span className="truncate">Bildirimler</span>
        {unreadCount > 0 && (
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
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "relative hidden md:flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="flex-shrink-0 w-8 h-8 rounded-lg" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white leading-tight">Asistan Panel</p>
              <p className="text-xs text-gray-400 truncate">Nurevşan Doğan</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {collapsed ? (
            <>
              <Link
                href="/dashboard/notifications"
                className={cn(
                  "flex items-center justify-center p-2.5 rounded-lg transition-all duration-150",
                  pathname === "/dashboard/notifications" ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                title="Bildirimler"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
              <div className="border-t border-gray-700 my-2" />
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-lg transition-all duration-150",
                      isActive ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </>
          ) : navContent}
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
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-300" /> : <ChevronLeft className="w-3 h-3 text-gray-300" />}
        </button>
      </aside>

      {/* ── Mobile Overlay Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 text-white flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Asistan Panel</p>
                  <p className="text-xs text-gray-400">Nurevşan Doğan</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navContent}
            </nav>
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
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {bottomBarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                  isActive ? "text-violet-600" : "text-gray-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          {/* More / hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Menü</span>
          </button>
        </div>
      </nav>
    </>
  );
}
