"use client";

import { useState, useEffect } from "react";
import { Mail, Calendar, CheckSquare, FileText, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatItem = {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  change: string;
  changeColor: string;
};

export function DashboardStats() {
  const [statsData, setStatsData] = useState({
    unreadEmails: 0,
    todayMeetings: 0,
    pendingTasks: 0,
    libraryFiles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStatsData(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats: StatItem[] = [
    {
      label: "Okunmamış E-posta",
      value: statsData.unreadEmails,
      icon: Mail,
      color: "bg-blue-50 text-blue-600",
      change: statsData.unreadEmails > 0 ? "Yeni mesajlar" : "Kutu temiz",
      changeColor: statsData.unreadEmails > 0 ? "text-blue-500" : "text-gray-400",
    },
    {
      label: "Bugünkü Toplantılar",
      value: statsData.todayMeetings,
      icon: Calendar,
      color: "bg-violet-50 text-violet-600",
      change: statsData.todayMeetings > 0 ? `${statsData.todayMeetings} adet` : "Etkinlik yok",
      changeColor: "text-violet-500",
    },
    {
      label: "Bekleyen Görevler",
      value: statsData.pendingTasks,
      icon: CheckSquare,
      color: "bg-amber-50 text-amber-600",
      change: statsData.pendingTasks > 0 ? "İşlem bekliyor" : "Hepsi tamam",
      changeColor: statsData.pendingTasks > 0 ? "text-amber-500" : "text-emerald-500",
    },
    {
      label: "Kütüphane",
      value: statsData.libraryFiles,
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600",
      change: "Dosya sayısı",
      changeColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-xs mt-1 font-medium ${stat.changeColor}`}>
                {stat.change}
              </p>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
