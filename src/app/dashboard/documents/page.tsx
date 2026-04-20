"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { 
  FileText, Search, 
  Eye, Download, File, Table, Presentation, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DocItem {
  id: string;
  name: string;
  mimeType: string;
  date: string;
  url: string;
}

type DocType = "all" | "document" | "spreadsheet" | "presentation";

export default function DocumentsPage() {
  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DocType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        setItems(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter !== "all" && !item.mimeType.includes(filter)) return false;
    if (searchQuery) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <TopBar title="Dokümanlar" subtitle="Google Workspace içerikleri" />

      <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Tabs & Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {(["all", "document", "spreadsheet", "presentation"] as DocType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                    filter === t 
                      ? "bg-white text-violet-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t === "all" ? "Tümü" : t === "document" ? "Dokümanlar" : t === "spreadsheet" ? "Tablolar" : "Slaytlar"}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Dokümanlarda ara..." 
                className="pl-10 h-10 border-gray-100 focus:ring-violet-500" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 text-violet-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">İsim</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tür</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Son Düzenleme</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          doc.mimeType.includes("document") ? "bg-blue-50 text-blue-600" :
                          doc.mimeType.includes("spreadsheet") ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {doc.mimeType.includes("document") ? <FileText className="w-4 h-4" /> :
                           doc.mimeType.includes("spreadsheet") ? <Table className="w-4 h-4" /> : <Presentation className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {doc.mimeType.includes("document") ? "Google Docs" :
                         doc.mimeType.includes("spreadsheet") ? "Google Sheets" : "Google Slides"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{doc.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.url, "_blank")}>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(`/api/drive/download?fileId=${doc.id}`, "_blank")}>
                          <Download className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && !loading && (
              <div className="py-20 text-center">
                <File className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Doküman bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
