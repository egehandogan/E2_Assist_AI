"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Video, MapPin,
  Users, Clock, Bot, Bell, CheckSquare, Mic
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const mockMeetings = [
  {
    id: "1",
    title: "Yönetim Kurulu Toplantısı",
    date: new Date(),
    startTime: "14:00",
    endTime: "15:30",
    type: "online",
    meetLink: "https://meet.google.com/abc-defg-hij",
    attendees: ["Ahmet Yılmaz", "Fatma Demir", "Mehmet Kaya", "Ali Vural", "Zeynep Arslan"],
    status: "upcoming",
    description: "Aylık rutin yönetim kurulu toplantısı. Faaliyet raporu ve bütçe görüşülecek.",
    aiJoined: false,
  },
  {
    id: "2",
    title: "Bağışçı Görüşmesi",
    date: new Date(),
    startTime: "16:00",
    endTime: "17:00",
    type: "inperson",
    location: "Dernek Merkezi - Toplantı Odası",
    attendees: ["Ali Vural", "Zeynep Arslan"],
    status: "upcoming",
    description: "Yeni sponsor adayı ile ön görüşme.",
    aiJoined: false,
  },
  {
    id: "3",
    title: "Etkinlik Planlama Toplantısı",
    date: new Date(Date.now() + 86400000),
    startTime: "10:00",
    endTime: "11:00",
    type: "online",
    meetLink: "https://meet.google.com/xyz-abcd-efg",
    attendees: ["Ekip"],
    status: "tomorrow",
    description: "15 Mayıs etkinliğinin organizasyon detayları.",
    aiJoined: false,
  },
];

const mockNotes = [
  {
    id: "m1",
    meetingTitle: "Nisan Yönetim Kurulu",
    date: "10 Nisan 2024",
    summary: "Bütçe onaylandı. Yeni üye kayıt sistemi kurulacak. Etkinlik komitesi oluşturuldu.",
    tasks: 3,
    transcript: [
      { speaker: "Nurevşan Doğan", text: "Toplantıyı açıyorum. Gündemdeki ilk madde bütçe..." },
      { speaker: "Ahmet Yılmaz", text: "Bütçe raporunu inceledim, uygun buluyorum..." },
    ],
  },
];

export default function CalendarPage() {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedMeeting, setSelectedMeeting] = useState<typeof mockMeetings[0] | null>(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [activeTab, setActiveTab] = useState<"meetings" | "notes">("meetings");

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];

  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const hasMeeting = (day: number) => {
    return mockMeetings.some((m) => {
      const d = new Date(m.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Takvim & Toplantılar" subtitle="Google Takvim entegrasyonu" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Calendar + Meetings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-sm font-semibold text-gray-900">
                {MONTHS[month]} {year}
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(["month", "week", "day"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      view === v
                        ? "bg-violet-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {v === "month" ? "Ay" : v === "week" ? "Hafta" : "Gün"}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={() => setShowNewMeeting(true)} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Toplantı
              </Button>
            </div>
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
                        day === today.getDate()
                          ? "bg-violet-600 text-white font-bold"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      {day}
                      {day && hasMeeting(day) && day !== today.getDate() && (
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
                {mockMeetings.map((meeting) => (
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
                          {meeting.type === "online" ? (
                            <Video className="w-5 h-5 text-violet-600" />
                          ) : (
                            <MapPin className="w-5 h-5 text-violet-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{meeting.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{meeting.startTime} - {meeting.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            <span>{meeting.attendees.slice(0, 3).join(", ")}{meeting.attendees.length > 3 ? ` +${meeting.attendees.length - 3}` : ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={meeting.status === "upcoming" ? "default" : "secondary"} className="text-xs">
                          {meeting.status === "upcoming" ? "Bugün" : "Yarın"}
                        </Badge>
                        {!meeting.aiJoined && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6 gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Bot className="w-3 h-3" />
                            AI Botu Ekle
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                {mockNotes.map((note) => (
                  <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{note.meetingTitle}</p>
                          <p className="text-xs text-gray-400">{note.date}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <CheckSquare className="w-3 h-3 mr-1" />
                          {note.tasks} görev
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{note.summary}</p>
                      <div className="mt-3 space-y-1.5">
                        {note.transcript.slice(0, 2).map((t, i) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <span className="font-medium text-violet-600 flex-shrink-0">{t.speaker}:</span>
                            <span className="text-gray-500 truncate">{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <button onClick={() => setSelectedMeeting(null)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-bold text-gray-900">{selectedMeeting.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{selectedMeeting.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
                </div>
                {selectedMeeting.type === "online" && selectedMeeting.meetLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-gray-400" />
                    <a href={selectedMeeting.meetLink} className="text-violet-600 hover:underline truncate">
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

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Katılımcılar</p>
                <div className="space-y-1">
                  {selectedMeeting.attendees.map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                        {a.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                {selectedMeeting.type === "online" && (
                  <Button className="w-full gap-2" size="sm">
                    <Video className="w-4 h-4" />
                    Toplantıya Katıl
                  </Button>
                )}
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Bot className="w-4 h-4" />
                  AI Botu Gönder (Nurevşan Bot)
                </Button>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Mic className="w-4 h-4" />
                  Not Al (Transkript)
                </Button>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Bell className="w-4 h-4" />
                  Hatırlatıcı Kur
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
