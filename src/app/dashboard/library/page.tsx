"use client";

import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  FolderOpen, Upload, Search, Grid, List, Image, FileText,
  CreditCard, File, Folder, Star, Download,
  Eye, Trash2, Plus, ChevronRight, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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
  mimeType?: string;
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
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "Drive" }]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems(currentFolderId);
  }, [currentFolderId]);

  const fetchItems = async (folderId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/drive?folderId=${folderId}`);
      if (res.ok) {
        setItems(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolderId(id);
    setBreadcrumbs(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx !== -1) return prev.slice(0, idx + 1);
      return [...prev, { id, name }];
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    
    // Check if it's a file input change
    if (e.type === "change") {
      const target = e.target as HTMLInputElement;
      files = target.files;
    } 
    // Check if it's a drag and drop
    else if (e.type === "drop") {
      const dragEvent = e as React.DragEvent;
      files = dragEvent.dataTransfer.files;
    }

    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("parentId", currentFolderId);

        await fetch("/api/drive", {
          method: "POST",
          body: formData,
        });
      }
      fetchItems(currentFolderId);
    } catch {
      alert("Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: LibraryItem) => {
    window.open(`/api/drive/download?fileId=${item.id}`, "_blank");
  };

  const createFolder = async () => {
    const name = prompt("Yeni klasör adı:");
    if (!name) return;
    try {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_folder", name, parentId: currentFolderId })
      });
      if (res.ok) {
        fetchItems(currentFolderId);
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

  // Remove unused stats logic
  // ... (Removed)



  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <TopBar title="Kütüphane" subtitle="Google Drive senkronizasyonu" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumbs + toolbar */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto pb-1 no-scrollbar">
              {breadcrumbs.map((b, idx) => (
                <div key={b.id} className="flex items-center shrink-0">
                  <button 
                    onClick={() => navigateToFolder(b.id, b.name)}
                    className={cn(
                      "hover:text-violet-600 transition-colors",
                      idx === breadcrumbs.length - 1 && "font-semibold text-gray-900"
                    )}
                  >
                    {b.name}
                  </button>
                  {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5 mx-1 opacity-40" />}
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

              <div className="flex gap-1.5 shrink-0">
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
                    {f === "all" ? "Tümü" : f === "image" ? "Görseller" : f === "document" ? "Belgeler" : f === "card" ? "Kart" : "PDF"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 shrink-0">
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
                Klasör
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                className="hidden" 
                multiple
              />
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Yükle
              </Button>
            </div>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            {loading && !items.length && (
              <div className="absolute inset-0 flex items-center justify-center text-violet-600 z-10 bg-white/50">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}

            {/* Drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all cursor-pointer relative overflow-hidden",
                isDragging
                  ? "border-violet-400 bg-violet-50 scale-[1.01]"
                  : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30",
                loading && "opacity-50 pointer-events-none"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={cn("w-8 h-8 mx-auto mb-2 transition-colors", isDragging ? "text-violet-500" : "text-gray-300")} />
              <p className="text-sm text-gray-500">
                Dosyaları buraya sürükleyin veya{" "}
                <span className="text-violet-600 font-medium">seçmek için tıklayın</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Google Drive ile tam senkronize çalışır</p>
              {loading && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </div>
              )}
            </div>

            {/* Content List */}
            {items.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
                <p>Bu klasör boş</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.type === "folder") navigateToFolder(item.id, item.name);
                        else setSelectedItem(item);
                      }}
                      className={cn(
                        "group relative rounded-xl border bg-white p-3 cursor-pointer transition-all hover:shadow-md hover:border-violet-200",
                        selectedItem?.id === item.id && "border-violet-400 ring-1 ring-violet-400"
                      )}
                    >
                      <div className={`w-full aspect-square ${config.bg} rounded-lg flex items-center justify-center mb-3 relative`}>
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Icon className={`w-8 h-8 ${config.color}`} />
                        )}
                        {item.isStarred && (
                          <Star className="absolute top-2 right-2 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{item.size || (item.type === "folder" ? "Klasör" : item.date)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.type === "folder") navigateToFolder(item.id, item.name);
                        else setSelectedItem(item);
                      }}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl border bg-white cursor-pointer transition-all hover:border-violet-200",
                        selectedItem?.id === item.id && "border-violet-400 bg-violet-50"
                      )}
                    >
                      <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-gray-400">{item.date}</span>
                          {item.size && <span className="text-[11px] text-gray-400 px-1 border-x border-gray-200">{item.size}</span>}
                        </div>
                      </div>
                      {item.isStarred && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="w-80 border-l border-gray-100 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Dosya Detayı</p>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              {(() => {
                const config = typeConfig[selectedItem.type];
                const Icon = config.icon;
                return (
                  <>
                    <div className={`w-full aspect-square ${config.bg} rounded-2xl flex items-center justify-center p-8`}>
                      {selectedItem.thumbnail ? (
                        <img src={selectedItem.thumbnail.replace(/=s[0-9]+/, "=s400")} alt="" className="w-full h-full object-contain rounded-xl shadow-lg" />
                      ) : (
                        <Icon className={`w-16 h-16 ${config.color}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 break-words leading-tight">{selectedItem.name}</h3>
                      <Badge variant="secondary" className="mt-2 text-xs font-normal">{config.label}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Tür</p>
                        <p className="text-xs text-gray-700">{selectedItem.mimeType?.split("/")[1]?.toUpperCase() || "Bilinmiyor"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Boyut</p>
                        <p className="text-xs text-gray-700">{selectedItem.size || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Oluşturulma</p>
                        <p className="text-xs text-gray-700">{selectedItem.date}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full gap-2 rounded-xl h-11" onClick={() => setIsPreviewOpen(true)}>
                        <Eye className="w-4 h-4" /> Önizle
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => handleDownload(selectedItem)}>
                          <Download className="w-4 h-4" /> İndir
                        </Button>
                        <Button variant="outline" className="gap-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-100">
                          <Trash2 className="w-4 h-4" /> Sil
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedItem && (
        <Modal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={selectedItem.name}
          className="max-w-5xl w-[90vw] h-[85vh] p-0 overflow-hidden bg-gray-900 border-none"
        >
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-white flex items-center justify-center p-4">
              {selectedItem.type === "image" ? (
                <img src={selectedItem.url || "/placeholder.png"} alt={selectedItem.name} className="max-w-full max-h-full object-contain" />
              ) : selectedItem.mimeType?.includes("pdf") ? (
                <iframe src={selectedItem.url?.replace("/view", "/preview")} className="w-full h-full border-none" />
              ) : selectedItem.mimeType?.includes("google-apps") ? (
                <iframe src={selectedItem.url?.replace("/edit", "/preview")} className="w-full h-full border-none" />
              ) : (
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Bu dosya önizlenemiyor. Lütfen indirin.</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleDownload(selectedItem)}>İndir</Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
