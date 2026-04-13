"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const suggestions = [
  "Bugünkü toplantı özetini hazırla",
  "Okunmamış mailleri özetle",
  "Acil görevleri listele",
];

export function AIWidget() {
  const [query, setQuery] = useState("");

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
        <p className="text-xs text-gray-500">Size nasıl yardımcı olabilirim?</p>

        {/* Quick suggestions */}
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              className="w-full text-left text-xs text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-2 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick input */}
        <div className="flex gap-1.5">
          <Input
            placeholder="Sorunuzu yazın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs h-8"
          />
          <Button size="icon" className="h-8 w-8 flex-shrink-0" asChild>
            <Link href={`/dashboard/ai${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
              <Send className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        <Link
          href="/dashboard/ai"
          className="block text-center text-xs text-violet-600 hover:text-violet-700"
        >
          Tam ekran asistana geç →
        </Link>
      </CardContent>
    </Card>
  );
}
