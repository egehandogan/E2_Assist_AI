"use client";

import { useEffect } from "react";
import { CheckSquare, ChevronRight, Circle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const priorityMap = {
  urgent: { label: "Acil", class: "bg-red-100 text-red-700" },
  high: { label: "Yüksek", class: "bg-orange-100 text-orange-700" },
  medium: { label: "Orta", class: "bg-yellow-100 text-yellow-700" },
  low: { label: "Düşük", class: "bg-green-100 text-green-700" },
};

export function TaskList() {
  const { tasks, fetch, toggle } = useTaskStore();

  useEffect(() => { fetch(); }, [fetch]);

  const pendingTasks = tasks.filter((t) => t.status !== "completed").slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckSquare className="w-4 h-4 text-amber-500" />
            Görevler
          </CardTitle>
          <Link href="/dashboard/tasks" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-0.5">
            Tümü <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {pendingTasks.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">Bekleyen görev yok</p>
        ) : pendingTasks.map((task) => {
          const priority = priorityMap[task.priority];
          return (
            <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggle(task.id)}>
              {task.status === "completed" ? (
                <CheckCircle2 className="flex-shrink-0 mt-0.5 w-4 h-4 text-green-500" />
              ) : task.status === "in_progress" ? (
                <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-50" />
              ) : (
                <Circle className="flex-shrink-0 mt-0.5 w-4 h-4 text-gray-300 hover:text-violet-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium text-gray-800 leading-snug", task.status === "completed" && "line-through text-gray-400")}>
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {task.dueDate && <span className="text-xs text-gray-400">{task.dueDate}</span>}
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
