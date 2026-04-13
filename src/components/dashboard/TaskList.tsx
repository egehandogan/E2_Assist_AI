"use client";

import { CheckSquare, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const mockTasks = [
  {
    id: "1",
    title: "Sponsorluk teklifini hazırla",
    dueDate: "Bugün",
    priority: "urgent",
    status: "pending",
  },
  {
    id: "2",
    title: "Yönetim kurulu kararını noterden onaylat",
    dueDate: "Yarın",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "3",
    title: "Etkinlik davetiyelerini gönder",
    dueDate: "15 Mayıs",
    priority: "medium",
    status: "pending",
  },
  {
    id: "4",
    title: "Bütçe raporunu güncelle",
    dueDate: "20 Mayıs",
    priority: "low",
    status: "pending",
  },
];

const priorityMap = {
  urgent: { label: "Acil", class: "bg-red-100 text-red-700" },
  high: { label: "Yüksek", class: "bg-orange-100 text-orange-700" },
  medium: { label: "Orta", class: "bg-yellow-100 text-yellow-700" },
  low: { label: "Düşük", class: "bg-green-100 text-green-700" },
};

export function TaskList() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckSquare className="w-4 h-4 text-amber-500" />
            Görevler
          </CardTitle>
          <Link
            href="/dashboard/tasks"
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-0.5"
          >
            Tümü <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockTasks.map((task) => {
          const priority = priorityMap[task.priority as keyof typeof priorityMap];
          return (
            <div
              key={task.id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className={cn(
                "flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 transition-colors",
                task.status === "in_progress"
                  ? "border-violet-400 bg-violet-50"
                  : "border-gray-300 hover:border-violet-400"
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 leading-snug">{task.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-gray-400">{task.dueDate}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priority.class}`}>
                    {priority.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
