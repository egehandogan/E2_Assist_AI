"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  CheckSquare, Plus, Calendar, Clock, User,
  AlertTriangle, MoreHorizontal, Bot,
  ArrowUp, Minus, ArrowDown, Circle, CheckCircle2, Loader2, Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useTaskStore, aiAnalyze } from "@/lib/store";
import { cn } from "@/lib/utils";

const priorityConfig = {
  urgent: { label: "Acil", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100" },
  high: { label: "Yüksek", icon: ArrowUp, color: "text-orange-500", bg: "bg-orange-100" },
  medium: { label: "Orta", icon: Minus, color: "text-yellow-600", bg: "bg-yellow-100" },
  low: { label: "Düşük", icon: ArrowDown, color: "text-green-500", bg: "bg-green-100" },
};

type FilterType = "all" | "pending" | "in_progress" | "completed";

interface NewTaskForm {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: "urgent" | "high" | "medium" | "low";
  category: string;
}

const defaultForm: NewTaskForm = {
  title: "",
  description: "",
  assignee: "",
  dueDate: "",
  priority: "medium",
  category: "",
};

export default function TasksPage() {
  const { tasks, loading, fetch, add, toggle, remove } = useTaskStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [form, setForm] = useState<NewTaskForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTasks, setAiTasks] = useState<NewTaskForm[]>([]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await add({
      title: form.title,
      description: form.description || null,
      assignee: form.assignee || null,
      dueDate: form.dueDate || null,
      priority: form.priority,
      status: "pending",
      category: form.category || null,
    });
    setSaving(false);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleAIExtract = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    const result = await aiAnalyze("extract_tasks", aiText);
    if (result.tasks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAiTasks(
        result.tasks.map((t: any) => ({
          title: String(t.title ?? ""),
          description: "",
          assignee: String(t.assignee ?? ""),
          dueDate: String(t.dueDate ?? ""),
          priority: (["urgent", "high", "medium", "low"].includes(t.priority) ? t.priority : "medium") as NewTaskForm["priority"],
          category: "",
        }))
      );
    }
    setAiLoading(false);
  };

  const handleAddAITasks = async () => {
    setSaving(true);
    for (const t of aiTasks) {
      await add({
        title: t.title,
        description: t.description || null,
        assignee: t.assignee || null,
        dueDate: t.dueDate || null,
        priority: t.priority,
        status: "pending",
        category: t.category || null,
      });
    }
    setSaving(false);
    setAiTasks([]);
    setAiText("");
    setShowAIModal(false);
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
                  filter === f ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {f === "all" ? "Tümü" : f === "pending" ? "Bekliyor" : f === "in_progress" ? "Devam" : "Tamamlandı"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAIModal(true)}>
              <Bot className="w-3.5 h-3.5" />
              AI ile Görev Oluştur
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" />
              Yeni Görev
            </Button>
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Yükleniyor...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Henüz görev yok. Yeni görev ekleyin.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const priority = priorityConfig[task.priority];
              const PriorityIcon = priority.icon;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-all",
                    task.status === "completed" && "opacity-60",
                    task.priority === "urgent" && task.status !== "completed" && "border-red-200 bg-red-50/30"
                  )}
                >
                  <button onClick={() => toggle(task.id)} className="flex-shrink-0 mt-0.5">
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm font-medium text-gray-900",
                        task.status === "completed" && "line-through text-gray-400"
                      )}>
                        {task.title}
                      </p>
                      <button
                        onClick={() => remove(task.id)}
                        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.color}`}>
                        <PriorityIcon className="w-3 h-3" />
                        {priority.label}
                      </span>
                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      )}
                      {task.category && (
                        <Badge variant="secondary" className="text-xs py-0">{task.category}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(defaultForm); }} title="Yeni Görev">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Görev Başlığı *</label>
            <Input
              placeholder="Görev başlığı..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Açıklama</label>
            <Textarea
              placeholder="Görev detayları..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Atanan Kişi</label>
              <Input
                placeholder="Ad Soyad"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Son Tarih</label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Öncelik</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as NewTaskForm["priority"] })}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Kategori</label>
              <Input
                placeholder="Örn: Hukuki, Mali..."
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={!form.title.trim() || saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
            </Button>
            <Button variant="outline" onClick={() => { setShowModal(false); setForm(defaultForm); }}>
              İptal
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Task Extract Modal */}
      <Modal open={showAIModal} onClose={() => { setShowAIModal(false); setAiText(""); setAiTasks([]); }} title="AI ile Görev Oluştur" className="max-w-2xl">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Toplantı notlarınızı veya metin girin — AI otomatik görevler çıkarsın.</p>
          <Textarea
            placeholder="Toplantı notları veya yapılacaklar listesi..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            rows={6}
          />
          <Button onClick={handleAIExtract} disabled={!aiText.trim() || aiLoading} variant="outline" className="gap-2">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Görevleri Çıkar
          </Button>

          {aiTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">{aiTasks.length} görev bulundu:</p>
              {aiTasks.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{t.title}</p>
                    <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                      {t.assignee && <span>{t.assignee}</span>}
                      {t.dueDate && <span>{t.dueDate}</span>}
                      <span className="capitalize">{priorityConfig[t.priority]?.label}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiTasks((prev) => prev.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddAITasks} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : `${aiTasks.length} Görevi Ekle`}
                </Button>
                <Button variant="outline" onClick={() => setAiTasks([])}>Temizle</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
