"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Video, MapPin,
  Users, Clock, Bot, Bell, CheckSquare, Mic, Loader2, Trash2, Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useMeetingStore, useTaskStore, aiAnalyze, type Meeting } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

interface MeetingForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  meetLink: string;
  attendees: string;
}

const defaultForm: MeetingForm = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  location: "",
  meetLink: "",
  attendees: "",
};

export default function CalendarPage() {
  const { meetings, loading, fetch, add, update, remove } = useMeetingStore();
  const taskStore = useTaskStore();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [activeTab, setActiveTab] = useState<"meetings" | "notes">("meetings");
  const [form, setForm] = useState<MeetingForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [extractedTasks, setExtractedTasks] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { fetch(); taskStore.fetch(); }, [fetch, taskStore.fetch]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const hasMeeting = (day: number) =>
    meetings.some((m) => {
      const d = new Date(m.startTime);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

  const handleAddMeeting = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) return;
    setSaving(true);
    const meeting = await add({
      title: form.title,
      description: form.description || null,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      location: form.location || null,
      meetLink: form.meetLink || null,
      attendees: form.attendees || null,
      status: "scheduled",
    });
    if (meeting) setSelectedMeeting(meeting);
    setSaving(false);
    setForm(defaultForm);
    setShowNewMeeting(false);
  };

  const handleSaveNote = async () => {
    if (!selectedMeeting || !noteText.trim()) return;
    await update(selectedMeeting.id, { notes: noteText });
    setSelectedMeeting({ ...selectedMeeting, notes: noteText });
  };

  const handleAISummary = async () => {
    if (!selectedMeeting) return;
    const content = selectedMeeting.notes ?? noteText;
    if (!content.trim()) return;
    setAiLoading(true);
    const result = await aiAnalyze("meeting_summary", content);
    if (result.result) {
      setAiSummary(result.result);
      await update(selectedMeeting.id, { summary: result.result });
      setSelectedMeeting({ ...selectedMeeting, summary: result.result });
    }
    setAiLoading(false);
  };

  const handleExtractTasks = async () => {
    if (!selectedMeeting) return;
    const content = selectedMeeting.notes ?? noteText;
    if (!content.trim()) return;
    setAiLoading(true);
    const result = await aiAnalyze("extract_tasks", content);
    if (result.tasks && result.tasks.length > 0) {
      for (const t of result.tasks) {
        await taskStore.add({
          title: t.title,
          assignee: t.assignee ?? null,
          priority: (["urgent","high","medium","low"].includes(t.priority) ? t.priority : "medium") as "urgent"|"high"|"medium"|"low",
          dueDate: t.dueDate ?? null,
          status: "pending",
          meetingId: selectedMeeting.id,
        });
      }
      setExtractedTasks(`${result.tasks.length} görev oluşturuldu`);
    }
    setAiLoading(false);
  };

  const handleToggleAIBot = async (meeting: Meeting) => {
    const newVal = !meeting.aiJoined;
    await update(meeting.id, { aiJoined: newVal });
    if (selectedMeeting?.id === meeting.id) {
      setSelectedMeeting({ ...selectedMeeting, aiJoined: newVal });
    }
  };

  const today = new Date();

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Takvim & Toplantılar" subtitle="Toplantı yönetimi ve notlar" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Calendar + Meetings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-sm font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button size="sm" onClick={() => setShowNewMeeting(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Yeni Toplantı
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Mini calendar */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {DAYS.map((d) => (
                    <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-colors",
                        day === null && "invisible",
                        day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                          ? "bg-violet-600 text-white font-bold"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      {day}
                      {day && hasMeeting(day) && !(day === today.getDate() && month === today.getMonth()) && (
                        <div className="absolute bottom-1 w-1 h-1 bg-violet-400 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              {(["meetings", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab === "meetings" ? "Toplantılar" : "Toplantı Notları"}
                </button>
              ))}
            </div>

            {activeTab === "meetings" && (
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Yükleniyor...
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz toplantı yok</p>
                  </div>
                ) : meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => setSelectedMeeting(meeting)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all",
                      selectedMeeting?.id === meeting.id
                        ? "border-violet-300 bg-violet-50"
                        : "border-gray-100 bg-white hover:border-violet-200 hover:bg-violet-50/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {meeting.meetLink ? (
                            <Video className="w-5 h-5 text-violet-600" />
                          ) : (
                            <MapPin className="w-5 h-5 text-violet-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{meeting.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(meeting.startTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                              {" - "}
                              {new Date(meeting.endTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(meeting.startTime).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-xs">{meeting.status}</Badge>
                        <Button
                          size="sm"
                          variant={meeting.aiJoined ? "default" : "outline"}
                          className="text-xs h-6 gap-1"
                          onClick={(e) => { e.stopPropagation(); handleToggleAIBot(meeting); }}
                        >
                          <Bot className="w-3 h-3" />
                          {meeting.aiJoined ? "AI Botu Aktif" : "AI Botu Ekle"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                {meetings.filter((m) => m.notes || m.summary).map((meeting) => (
                  <Card key={meeting.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMeeting(meeting)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{meeting.title}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(meeting.startTime).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        {meeting.tasks && meeting.tasks.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            {meeting.tasks.length} görev
                          </Badge>
                        )}
                      </div>
                      {meeting.summary && (
                        <p className="text-sm text-gray-600">{meeting.summary}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {meetings.filter((m) => m.notes || m.summary).length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">Henüz toplantı notu yok</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Meeting detail */}
        {selectedMeeting && (
          <div className="w-80 border-l border-gray-100 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">Toplantı Detayı</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => { remove(selectedMeeting.id); setSelectedMeeting(null); }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedMeeting(null)} className="text-gray-400 hover:text-gray-600 ml-1">×</button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-bold text-gray-900">{selectedMeeting.title}</h4>
                {selectedMeeting.description && (
                  <p className="text-sm text-gray-500 mt-1">{selectedMeeting.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(selectedMeeting.startTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    {" - "}
                    {new Date(selectedMeeting.endTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {selectedMeeting.meetLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-gray-400" />
                    <a href={selectedMeeting.meetLink} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline truncate">
                      Google Meet
                    </a>
                  </div>
                )}
                {selectedMeeting.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedMeeting.location}</span>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              {selectedMeeting.summary && (
                <div className="bg-violet-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-xs font-semibold text-violet-700">AI Özeti</span>
                  </div>
                  <p className="text-xs text-gray-700">{selectedMeeting.summary}</p>
                </div>
              )}

              {/* Extracted tasks notice */}
              {extractedTasks && (
                <div className="bg-green-50 rounded-lg p-2 text-xs text-green-700 font-medium">
                  ✓ {extractedTasks}
                </div>
              )}

              {/* Notes area */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Toplantı Notları</label>
                <Textarea
                  value={noteText || selectedMeeting.notes || ""}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Toplantı notlarını buraya yazın..."
                  rows={5}
                  className="text-xs"
                />
                <Button size="sm" variant="outline" className="mt-2 w-full" onClick={handleSaveNote}>
                  Notu Kaydet
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                {selectedMeeting.meetLink && (
                  <Button className="w-full gap-2" size="sm" asChild>
                    <a href={selectedMeeting.meetLink} target="_blank" rel="noreferrer">
                      <Video className="w-4 h-4" />
                      Toplantıya Katıl
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => handleToggleAIBot(selectedMeeting)}
                >
                  <Bot className="w-4 h-4" />
                  {selectedMeeting.aiJoined ? "AI Botu Kaldır" : "AI Botu Gönder"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                  onClick={handleAISummary}
                  disabled={aiLoading}
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AI ile Özetle
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                  onClick={handleExtractTasks}
                  disabled={aiLoading}
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                  Görevleri Çıkar (AI)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Meeting Modal */}
      <Modal open={showNewMeeting} onClose={() => { setShowNewMeeting(false); setForm(defaultForm); }} title="Yeni Toplantı">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Toplantı Başlığı *</label>
            <Input placeholder="Toplantı adı..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Açıklama</label>
            <Textarea placeholder="Toplantı konusu..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Başlangıç *</label>
              <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Bitiş *</label>
              <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Konum</label>
            <Input placeholder="Toplantı odası veya adres..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Google Meet Linki</label>
            <Input placeholder="https://meet.google.com/..." value={form.meetLink} onChange={(e) => setForm({ ...form, meetLink: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Katılımcılar</label>
            <Input placeholder="Ahmet Yılmaz, Fatma Demir, ..." value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleAddMeeting} disabled={!form.title.trim() || !form.startTime || !form.endTime || saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Toplantı Oluştur"}
            </Button>
            <Button variant="outline" onClick={() => { setShowNewMeeting(false); setForm(defaultForm); }}>İptal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
