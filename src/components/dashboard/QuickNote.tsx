"use client";

import { useState } from "react";
import { StickyNote, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function QuickNote() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!note.trim()) return;
    // TODO: API call
    setSaved(true);
    setNote("");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <StickyNote className="w-4 h-4 text-yellow-500" />
          Hızlı Not
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          placeholder="Aklınızdaki notu buraya yazın..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-sm min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) handleSave();
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Ctrl+Enter ile kaydet</span>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!note.trim()}
            variant={saved ? "success" : "default"}
            className="h-7 text-xs"
          >
            {saved ? "Kaydedildi!" : (
              <>
                <Send className="w-3 h-3" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
