"use client";

import { Mail, Calendar, CheckSquare, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  {
    label: "Okunmamış E-posta",
    value: "12",
    icon: Mail,
    color: "bg-blue-50 text-blue-600",
    change: "+3 yeni",
    changeColor: "text-blue-500",
  },
  {
    label: "Bugünkü Toplantılar",
    value: "3",
    icon: Calendar,
    color: "bg-violet-50 text-violet-600",
    change: "Sonraki: 14:00",
    changeColor: "text-violet-500",
  },
  {
    label: "Bekleyen Görevler",
    value: "8",
    icon: CheckSquare,
    color: "bg-amber-50 text-amber-600",
    change: "2 acil",
    changeColor: "text-red-500",
  },
  {
    label: "Kütüphane",
    value: "47",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    change: "Dosya sayısı",
    changeColor: "text-emerald-500",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
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
