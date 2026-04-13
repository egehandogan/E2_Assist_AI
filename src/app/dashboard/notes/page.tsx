"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { StickyNote, Plus, Search, Smartphone, Edit3, Trash2, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useNoteStore, aiAnalyze } from "@/lib/store";
import { cn } from "@/lib/utils";

const sourceConfig = {
  manual: { label: "Manuel", color: "bg-gray-100 text-gray-600", icon: Edit3 },
  phone: { label: "Telefondan", color: "bg-green-100 text-green-700", icon: Smartphone },
  meeting: { label: "Toplantı", color: "bg-violet-100 text-violet-700", icon: StickyNote },
};

interface NoteForm {
  title: string;
  content: string;
  source: "manual" | "phone" | "meeting";
  tags: string;
}

const defaultForm: NoteForm = { title: "", content: "", source: "manual", tags: "" };

export default function NotesPage() {
  const { notes, loading, fetch, add, update, remove } = useNoteStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState<NoteForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  useEffect(() => { fetch(); }, [fetch]);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags?.toLowerCase().includes(q)
    );
  });

  const handleSave = async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    const note = await add({
      title: form.title || null,
      content: form.content,
      source: form.source,
      tags: form.tags || null,
    });
    if (note) setSelectedId(note.id);
    setSaving(false);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleUpdate = async () => {
    if (!selectedNote || !form.content.trim()) return;
    setSaving(true);
    await update(selectedNote.id, {
      title: form.title || null,
      content: form.content,
      tags: form.tags || null,
    });
    setSaving(false);
    setEditModal(false);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    if (selectedId === id) setSelectedId(null);
  };

  const openEdit = () => {
    if (!selectedNote) return;
    setForm({
      title: selectedNote.title ?? "",
      content: selectedNote.content,
      source: selectedNote.source,
      tags: selectedNote.tags ?? "",
    });
    setEditModal(true);
  };

  const handleAIEnhance = async () => {
    if (!selectedNote) return;
    setAiLoading(true);
    setAiResult(null);
    const result = await aiAnalyze("note_enhance", selectedNote.content);
    setAiResult(result.result ?? result.error ?? "");
    setAiLoading(false);
  };

  const handleApplyAI = async () => {
    if (!selectedNote || !aiResult) return;
    await update(selectedNote.id, { content: aiResult });
    setAiResult(null);
  };

  const parseTags = (tags?: string | null) =>
    tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

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
            <Button size="sm" className="w-full gap-1.5" onClick={() => { setForm(defaultForm); setShowModal(true); }}>
              <Plus className="w-4 h-4" />
              Yeni Not
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Henüz not yok</p>
            ) : (
              filteredNotes.map((note) => {
                const source = sourceConfig[note.source];
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedId(note.id)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer mb-1.5 transition-all",
                      selectedId === note.id
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
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Note detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedNote ? (
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
                      <span className="text-xs text-gray-400">
                        {new Date(selectedNote.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAIEnhance} disabled={aiLoading}>
                      {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      AI Geliştir
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openEdit}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(selectedNote.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* AI Result */}
                {aiResult && (
                  <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-violet-700">AI Geliştirilmiş Not</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={handleApplyAI}>Uygula</Button>
                      <Button size="sm" variant="outline" onClick={() => setAiResult(null)}>İptal</Button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white rounded-xl border border-gray-100 p-4">
                  {selectedNote.content}
                </div>

                {parseTags(selectedNote.tags).length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    {parseTags(selectedNote.tags).map((tag) => (
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

      {/* New Note Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Yeni Not">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Başlık (opsiyonel)</label>
            <Input placeholder="Not başlığı..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">İçerik *</label>
            <Textarea
              placeholder="Notunuzu buraya yazın..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Kaynak</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as NoteForm["source"] })}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="manual">Manuel</option>
                <option value="phone">Telefondan</option>
                <option value="meeting">Toplantı</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Etiketler</label>
              <Input placeholder="önemli, toplantı, ..." value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={!form.content.trim() || saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Note Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Notu Düzenle">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Başlık</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">İçerik *</label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Etiketler</label>
            <Input placeholder="virgülle ayrın" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleUpdate} disabled={!form.content.trim() || saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Güncelle"}
            </Button>
            <Button variant="outline" onClick={() => setEditModal(false)}>İptal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
