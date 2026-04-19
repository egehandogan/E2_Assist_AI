"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  FolderOpen, Upload, Search, Grid, List, Image, FileText,
  CreditCard, File, Folder, MoreHorizontal, Star, Download,
  Eye, Trash2, Plus, Camera, Filter, ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LibraryItem {
  id: string;
  name: string;
  type: "image" | "document" | "card" | "pdf" | "folder";
  size?: string;
  date: string;
  tags?: string[];
  thumbnail?: string;
  description?: string;
  isStarred?: boolean;
  url?: string;
}

const typeConfig = {
  image: { icon: Image, color: "text-blue-500", bg: "bg-blue-50", label: "Görsel" },
  document: { icon: FileText, color: "text-green-500", bg: "bg-green-50", label: "Belge" },
  card: { icon: CreditCard, color: "text-purple-500", bg: "bg-purple-50", label: "Kartvizit" },
  pdf: { icon: File, color: "text-red-500", bg: "bg-red-50", label: "PDF" },
  folder: { icon: Folder, color: "text-amber-500", bg: "bg-amber-50", label: "Klasör" },
};

type ViewMode = "grid" | "list";
type FilterType = "all" | "image" | "document" | "card" | "pdf";

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/drive");
      if (res.ok) {
        setItems(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    const name = prompt("Yeni klasör adı:");
    if (!name) return;
    try {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_folder", name, parentId: "root" })
      });
      if (res.ok) {
        fetchItems();
        alert("Klasör oluşturuldu");
      }
    } catch {
      alert("Hata oluştu");
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const stats = {
    total: items.length,
    images: items.filter((i) => i.type === "image").length,
    documents: items.filter((i) => i.type === "document" || i.type === "pdf").length,
    cards: items.filter((i) => i.type === "card").length,
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Kütüphane" subtitle="Google Drive entegrasyonu" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats + toolbar */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Toplam Dosya", value: stats.total },
                { label: "Görseller", value: stats.images },
                { label: "Belgeler", value: stats.documents },
                { label: "Kartvizitler", value: stats.cards },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Dosya, etiket veya içerik ara..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-1.5">
                {(["all", "image", "document", "card", "pdf"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      filter === f
                        ? "bg-violet-100 text-violet-700"
                        : "text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    {f === "all" ? "Tümü" : f === "image" ? "Görseller" : f === "document" ? "Belgeler" : f === "card" ? "Kartvizit" : "PDF"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "grid" ? "bg-violet-100 text-violet-700" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "list" ? "bg-violet-100 text-violet-700" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Button size="sm" className="gap-1.5" onClick={createFolder}>
                <Plus className="w-4 h-4" />
                Klasör Ekle
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Camera className="w-4 h-4" />
                Fotoğraf Ekle
              </Button>
            </div>
          </div>

          {/* Drop zone + file grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 mb-6 text-center transition-all cursor-pointer",
                isDragging
                  ? "border-violet-400 bg-violet-50"
                  : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={() => setIsDragging(false)}
            >
              <Upload className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                Dosyaları buraya sürükleyin veya{" "}
                <span className="text-violet-600 font-medium cursor-pointer hover:underline">seçmek için tıklayın</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF, DOCX, XLSX desteklenir</p>
            </div>

            {/* File grid/list */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredItems.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "group relative rounded-xl border bg-white p-3 cursor-pointer transition-all hover:shadow-md hover:border-violet-200",
                        selectedItem?.id === item.id && "border-violet-400 bg-violet-50"
                      )}
                    >
                      <div className={`w-full aspect-square ${config.bg} rounded-lg flex items-center justify-center mb-2 relative`}>
                        <Icon className={`w-8 h-8 ${config.color}`} />
                        {item.isStarred && (
                          <Star className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.size || item.date}</p>

                      {/* Hover actions */}
                      <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                        <button className="p-1 bg-white rounded-lg shadow-sm hover:bg-gray-50">
                          <Eye className="w-3 h-3 text-gray-500" />
                        </button>
                        <button className="p-1 bg-white rounded-lg shadow-sm hover:bg-gray-50">
                          <Download className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredItems.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-sm hover:border-violet-200",
                        selectedItem?.id === item.id && "border-violet-400 bg-violet-50"
                      )}
                    >
                      <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{item.date}</span>
                          {item.size && <span className="text-xs text-gray-400">{item.size}</span>}
                          {item.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs py-0 px-1.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {item.isStarred && <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />}
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="w-72 border-l border-gray-100 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Detaylar</p>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-4 space-y-4">
              {(() => {
                const config = typeConfig[selectedItem.type];
                const Icon = config.icon;
                return (
                  <>
                    <div className={`w-full aspect-video ${config.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-12 h-12 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 break-all">{selectedItem.name}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{config.label}</Badge>
                    </div>
                    {selectedItem.description && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">OCR / İçerik</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{selectedItem.description}</p>
                      </div>
                    )}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Tarih</span>
                        <span className="text-gray-700">{selectedItem.date}</span>
                      </div>
                      {selectedItem.size && (
                        <div className="flex justify-between">
                          <span>Boyut</span>
                          <span className="text-gray-700">{selectedItem.size}</span>
                        </div>
                      )}
                    </div>
                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Etiketler</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <Button size="sm" className="w-full gap-2" onClick={() => window.open(selectedItem.url, "_blank")}>
                        <Eye className="w-4 h-4" /> Görüntüle
                      </Button>
                      <Button size="sm" variant="outline" className="w-full gap-2">
                        <Download className="w-4 h-4" /> İndir
                      </Button>
                      <Button size="sm" variant="destructive" className="w-full gap-2">
                        <Trash2 className="w-4 h-4" /> Sil
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
