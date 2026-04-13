"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { StickyNote, Plus, Search, Smartphone, Edit3, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title?: string;
  content: string;
  source: "manual" | "phone" | "meeting";
  tags?: string[];
  createdAt: string;
}

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Sponsor görüşmesi notları",
    content: "ABC Şirketinden Mehmet Bey ile görüştüm. 50.000 TL sponsorluk için ilgili görünüyor. Önce proje detaylarını görmek istiyor. Önümüzdeki hafta toplantı ayarlayacağım.",
    source: "phone",
    tags: ["sponsorluk", "ABC", "önemli"],
    createdAt: "13 Nisan 2024, 11:30",
  },
  {
    id: "2",
    content: "Etkinlik için 3 farklı mekan düşünüldü: 1) Şehir kültür merkezi 2) Üniversite konferans salonu 3) Dernek merkezi bahçesi. Kapasite ve fiyat karşılaştırması yapılacak.",
    source: "manual",
    tags: ["etkinlik", "mekan"],
    createdAt: "12 Nisan 2024, 15:45",
  },
  {
    id: "3",
    title: "Önemli telefon numaraları",
    content: "Belediye etkinlik birimi: 0212 xxx xxxx\nKaymakam sekreter: 0212 yyy yyyy\nMedya ajans: Zeynep H. 0532 zzz zzzz",
    source: "phone",
    tags: ["iletişim"],
    createdAt: "10 Nisan 2024, 09:15",
  },
  {
    id: "4",
    title: "Yönetim Kurulu toplantı notu",
    content: "- Bütçe onaylandı\n- Yeni üye sistemi kurulacak\n- Etkinlik komitesi: Fatma, Ahmet, Ali\n- Bir sonraki toplantı: 10 Mayıs",
    source: "meeting",
    tags: ["toplantı", "karar"],
    createdAt: "10 Nisan 2024, 16:00",
  },
];

const sourceConfig = {
  manual: { label: "Manuel", color: "bg-gray-100 text-gray-600", icon: Edit3 },
  phone: { label: "Telefondan", color: "bg-green-100 text-green-700", icon: Smartphone },
  meeting: { label: "Toplantı", color: "bg-violet-100 text-violet-700", icon: StickyNote },
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editContent, setEditContent] = useState("");

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      source: "manual",
      createdAt: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Notlar" subtitle="Manuel ve telefon notları" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Note list */}
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col">
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Notlarda ara..."
                className="pl-8 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4" />
              Yeni Not
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredNotes.map((note) => {
              const source = sourceConfig[note.source];
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer mb-1.5 transition-all",
                    selectedNote?.id === note.id
                      ? "bg-violet-50 border border-violet-200"
                      : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  {note.title && (
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1">{note.title}</p>
                  )}
                  <p className="text-xs text-gray-500 line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${source.color}`}>
                      {source.label}
                    </span>
                    <span className="text-xs text-gray-400">{note.createdAt.split(",")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Note detail / editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isEditing ? (
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Yeni Not</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>İptal</Button>
              </div>
              <Textarea
                placeholder="Notunuzu buraya yazın..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 text-sm resize-none min-h-[300px]"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button onClick={addNote} disabled={!newNote.trim()}>
                  Kaydet
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>İptal</Button>
              </div>
            </div>
          ) : selectedNote ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {selectedNote.title && (
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedNote.title}</h2>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceConfig[selectedNote.source].color}`}>
                        {sourceConfig[selectedNote.source].label}
                      </span>
                      <span className="text-xs text-gray-400">{selectedNote.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white rounded-xl border border-gray-100 p-4">
                  {selectedNote.content}
                </div>

                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    {selectedNote.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Bir not seçin veya yeni not oluşturun</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
