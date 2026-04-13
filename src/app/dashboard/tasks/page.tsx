"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  CheckSquare, Plus, Filter, Calendar, Clock, User,
  AlertTriangle, ChevronDown, MoreHorizontal, Bot,
  ArrowUp, Minus, ArrowDown, Circle, CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate: string;
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  category?: string;
  fromMeeting?: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Sponsorluk teklifini hazırla ve gönder",
    description: "ABC Şirketi için sponsorluk teklif dosyasını hazırla",
    assignee: "Nurevşan Doğan",
    dueDate: "Bugün",
    priority: "urgent",
    status: "in_progress",
    category: "İş Geliştirme",
    fromMeeting: "Yönetim Kurulu - 10 Nisan",
  },
  {
    id: "2",
    title: "Yönetim kurulu kararını noterden onaylat",
    dueDate: "Yarın",
    priority: "high",
    status: "pending",
    category: "Hukuki",
  },
  {
    id: "3",
    title: "Etkinlik davetiyelerini hazırla ve gönder",
    description: "15 Mayıs etkinliği için 200 kişiye davetiye",
    assignee: "Fatma Demir",
    dueDate: "12 Mayıs",
    priority: "high",
    status: "pending",
    category: "Etkinlik",
    fromMeeting: "Etkinlik Planlama - 8 Nisan",
  },
  {
    id: "4",
    title: "Bütçe raporunu güncelle",
    dueDate: "20 Mayıs",
    priority: "medium",
    status: "pending",
    category: "Mali",
  },
  {
    id: "5",
    title: "Yeni üye kayıt sistemini test et",
    assignee: "Mehmet Kaya",
    dueDate: "25 Mayıs",
    priority: "medium",
    status: "pending",
    category: "Teknoloji",
  },
  {
    id: "6",
    title: "Faaliyet raporunu yaz",
    dueDate: "30 Mayıs",
    priority: "low",
    status: "pending",
    category: "Raporlama",
  },
  {
    id: "7",
    title: "Web sitesini güncelle",
    dueDate: "1 Haziran",
    priority: "low",
    status: "completed",
    category: "Teknoloji",
  },
];

const priorityConfig = {
  urgent: { label: "Acil", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100" },
  high: { label: "Yüksek", icon: ArrowUp, color: "text-orange-500", bg: "bg-orange-100" },
  medium: { label: "Orta", icon: Minus, color: "text-yellow-600", bg: "bg-yellow-100" },
  low: { label: "Düşük", icon: ArrowDown, color: "text-green-500", bg: "bg-green-100" },
};

const statusConfig = {
  pending: { label: "Bekliyor", color: "text-gray-500" },
  in_progress: { label: "Devam ediyor", color: "text-blue-500" },
  completed: { label: "Tamamlandı", color: "text-green-500" },
};

type FilterType = "all" | "pending" | "in_progress" | "completed";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [groupBy, setGroupBy] = useState<"status" | "priority" | "none">("status");

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    urgent: tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length,
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Görev Yönetimi" subtitle="Toplantılardan ve manuel görevler" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Toplam", value: stats.total, color: "text-gray-700" },
            { label: "Bekliyor", value: stats.pending, color: "text-yellow-600" },
            { label: "Devam", value: stats.inProgress, color: "text-blue-600" },
            { label: "Tamamlandı", value: stats.completed, color: "text-green-600" },
            { label: "Acil", value: stats.urgent, color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label} className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {(["all", "pending", "in_progress", "completed"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {f === "all" ? "Tümü" : f === "pending" ? "Bekliyor" : f === "in_progress" ? "Devam" : "Tamamlandı"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAddTask(true)}
            >
              <Bot className="w-3.5 h-3.5" />
              AI ile Görev Oluştur
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowAddTask(true)}>
              <Plus className="w-4 h-4" />
              Yeni Görev
            </Button>
          </div>
        </div>

        {/* Add task input */}
        {showAddTask && (
          <Card className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Görev başlığı..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTaskTitle.trim()) {
                    setTasks((prev) => [
                      {
                        id: Date.now().toString(),
                        title: newTaskTitle,
                        dueDate: "Belirtilmedi",
                        priority: "medium",
                        status: "pending",
                      },
                      ...prev,
                    ]);
                    setNewTaskTitle("");
                    setShowAddTask(false);
                  }
                  if (e.key === "Escape") setShowAddTask(false);
                }}
              />
              <Button
                onClick={() => {
                  if (newTaskTitle.trim()) {
                    setTasks((prev) => [
                      {
                        id: Date.now().toString(),
                        title: newTaskTitle,
                        dueDate: "Belirtilmedi",
                        priority: "medium",
                        status: "pending",
                      },
                      ...prev,
                    ]);
                    setNewTaskTitle("");
                  }
                  setShowAddTask(false);
                }}
              >
                Ekle
              </Button>
              <Button variant="ghost" onClick={() => setShowAddTask(false)}>İptal</Button>
            </div>
          </Card>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const priority = priorityConfig[task.priority];
            const PriorityIcon = priority.icon;
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-all cursor-pointer",
                  task.status === "completed" && "opacity-60",
                  task.priority === "urgent" && task.status !== "completed" && "border-red-200 bg-red-50/30"
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : task.status === "in_progress" ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 hover:text-violet-400" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      "text-sm font-medium text-gray-900",
                      task.status === "completed" && "line-through text-gray-400"
                    )}>
                      {task.title}
                    </p>
                    <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Priority */}
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>
                      <PriorityIcon className="w-3 h-3" />
                      {priority.label}
                    </span>

                    {/* Due date */}
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </span>

                    {/* Assignee */}
                    {task.assignee && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </span>
                    )}

                    {/* Category */}
                    {task.category && (
                      <Badge variant="secondary" className="text-xs py-0">
                        {task.category}
                      </Badge>
                    )}

                    {/* From meeting */}
                    {task.fromMeeting && (
                      <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        📅 {task.fromMeeting}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
