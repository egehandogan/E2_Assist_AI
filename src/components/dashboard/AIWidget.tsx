"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { aiAnalyze } from "@/lib/store";

const suggestions = [
  "Bugünkü görevleri analiz et",
  "Dernek yönetimi için tavsiyeler ver",
  "Sponsor görüşmesi için hazırlık yap",
];

export function AIWidget() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (q?: string) => {
    const text = q ?? query;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await aiAnalyze("quick_analysis", text);
    setResult(res.result ?? res.error ?? "Sonuç alınamadı");
    setLoading(false);
    setQuery("");
  };

  return (
    <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          AI Asistan
          <span className="ml-auto text-xs text-green-500 font-normal flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Aktif
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {result ? (
          <div className="bg-white rounded-lg border border-violet-100 p-3">
            <p className="text-xs text-gray-700 leading-relaxed">{result}</p>
            <button onClick={() => setResult(null)} className="text-xs text-violet-600 mt-2 hover:underline">Temizle</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500">Size nasıl yardımcı olabilirim?</p>
            <div className="space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAsk(s)}
                  className="w-full text-left text-xs text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-2 hover:border-violet-300 hover:text-violet-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-1.5">
          <Input
            placeholder="Sorunuzu yazın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs h-8"
            onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
          />
          <Button
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => handleAsk()}
            disabled={!query.trim() || loading}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <Link href="/dashboard/ai" className="block text-center text-xs text-violet-600 hover:text-violet-700">
          Tam ekran asistana geç →
        </Link>
      </CardContent>
    </Card>
  );
}
