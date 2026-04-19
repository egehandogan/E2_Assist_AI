"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Mail, Star, Search, Archive, Reply,
  Inbox, Send, Bot, Plus, Loader2, Sparkles, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { aiAnalyze } from "@/lib/store";
import { cn } from "@/lib/utils";

type EmailItem = {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  time: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  account: string;
  labels: string[];
  threadId?: string;
};

interface AIPanel {
  loading: boolean;
  summary: string | null;
  reply: string | null;
  research: string | null;
}

export default function EmailPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [aiPanel, setAiPanel] = useState<AIPanel>({ loading: false, summary: null, reply: null, research: null });
  const [activeAI, setActiveAI] = useState<"summary" | "reply" | "research" | null>(null);

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await fetch("/api/email");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setEmails(data);
      } else {
        setApiError(data.error || "E-postalar alınamadı.");
      }
    } catch (e) {
      console.error(e);
      setApiError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter((e) => {
    if (selectedAccount && e.account !== selectedAccount) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Extract unique accounts
  const accounts = Array.from(new Set(emails.map((e) => e.account))).map((email, idx) => ({
    id: idx.toString(),
    email,
    label: email,
    color: idx % 2 === 0 ? "bg-blue-500" : "bg-green-500"
  }));

  const handleSelectEmail = (email: EmailItem) => {
    setSelectedEmail(email);
    setActiveAI(null);
    setAiPanel({ loading: false, summary: null, reply: null, research: null });
    setReplyText("");
    if (!email.isRead) {
      setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e));
    }
  };

  const handleToggleStar = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, isStarred: !e.isStarred } : e));
    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => prev ? { ...prev, isStarred: !prev.isStarred } : null);
    }
  };

  const handleAI = async (type: "summary" | "reply" | "research") => {
    if (!selectedEmail) return;
    if (activeAI === type) { setActiveAI(null); return; }
    setActiveAI(type);
    if (aiPanel[type]) return;
    setAiPanel((p) => ({ ...p, loading: true }));
    const analyzeType = type === "summary" ? "email_summary" : type === "reply" ? "email_reply" : "email_research";
    const result = await aiAnalyze(analyzeType, `Konu: ${selectedEmail.subject}\n\n${selectedEmail.body}`);
    setAiPanel((p) => ({ ...p, loading: false, [type]: result.result ?? result.error ?? "Sonuç alınamadı" }));
  };

  const handleUseReply = () => {
    if (aiPanel.reply) setReplyText(aiPanel.reply);
    setActiveAI(null);
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedEmail.fromEmail,
          subject: `Re: ${selectedEmail.subject}`,
          body: replyText,
          threadId: selectedEmail.threadId,
        })
      });
      if (res.ok) {
        setReplyText("");
        alert("Yanıt başarıyla gönderildi.");
      } else {
        alert("Hata oluştu.");
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="E-postalar" subtitle="Tüm Gmail hesaplarınız" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-80 flex flex-col border-r border-gray-100 bg-white">
          {/* Accounts */}
          <div className="p-3 border-b border-gray-100">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedAccount(null)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedAccount === null ? "bg-violet-50 text-violet-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Inbox className="w-4 h-4" />
                <span>Tüm Gelen Kutusu</span>
                <span className="ml-auto text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                  {emails.filter((e) => !e.isRead).length}
                </span>
              </button>
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.email)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedAccount === acc.email ? "bg-violet-50 text-violet-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className={`w-3 h-3 rounded-full ${acc.color}`} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="truncate text-xs font-medium">{acc.label}</p>
                    <p className="truncate text-xs text-gray-400">{acc.email}</p>
                  </div>
                  {emails.filter((e) => e.account === acc.email && !e.isRead).length > 0 && (
                    <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5">
                      {emails.filter((e) => e.account === acc.email && !e.isRead).length}
                    </span>
                  )}
                </button>
              ))}
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Hesap Ekle</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Ara..."
                className="pl-8 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Email list */}
          <div className="flex-1 overflow-y-auto relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 text-violet-600">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : apiError ? (
              <div className="flex flex-col items-center justify-center p-8 text-red-400">
                <span className="text-sm font-medium mb-1">Erişim İzni Gerekiyor</span>
                <span className="text-xs text-center">{apiError}</span>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <Inbox className="w-8 h-8 opacity-50 mb-2" />
                <span className="text-sm">E-posta bulunamadı</span>
              </div>
            ) : null}
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleSelectEmail(email)}
                className={cn(
                  "flex items-start gap-2.5 p-3 cursor-pointer border-b border-gray-50 transition-colors",
                  selectedEmail?.id === email.id ? "bg-violet-50 border-l-2 border-l-violet-500" : "hover:bg-gray-50",
                  !email.isRead && "bg-blue-50/30"
                )}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {email.from.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${!email.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {email.from}
                    </span>
                    <span className="text-xs text-gray-400">{email.time}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${!email.isRead ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{email.body.slice(0, 60)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEmail ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-white">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Reply className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleStar(selectedEmail.id)}
                >
                  <Star className={`w-4 h-4 ${selectedEmail.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>

                {/* AI Action Buttons */}
                <div className="ml-auto flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={activeAI === "summary" ? "default" : "outline"}
                    onClick={() => handleAI("summary")}
                    className="gap-1.5 text-xs h-7"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Özet
                  </Button>
                  <Button
                    size="sm"
                    variant={activeAI === "reply" ? "default" : "outline"}
                    onClick={() => handleAI("reply")}
                    className="gap-1.5 text-xs h-7"
                  >
                    <Bot className="w-3 h-3" />
                    Yanıt Öner
                  </Button>
                  <Button
                    size="sm"
                    variant={activeAI === "research" ? "default" : "outline"}
                    onClick={() => handleAI("research")}
                    className="gap-1.5 text-xs h-7"
                  >
                    <BookOpen className="w-3 h-3" />
                    Araştır
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* AI Panel */}
                {activeAI && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-violet-700">
                        {activeAI === "summary" ? "AI Özeti" : activeAI === "reply" ? "Yanıt Önerisi" : "Araştırma"}
                      </span>
                    </div>
                    {aiPanel.loading ? (
                      <div className="flex items-center gap-2 text-violet-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI analiz ediyor...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiPanel[activeAI]}
                        </p>
                        {activeAI === "reply" && aiPanel.reply && (
                          <Button size="sm" className="mt-3" onClick={handleUseReply}>
                            Yanıt Alanına Ekle
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Email header */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {selectedEmail.from.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedEmail.from}</p>
                      <p className="text-xs text-gray-500">{selectedEmail.fromEmail}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      {selectedEmail.date} {selectedEmail.time}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {selectedEmail.labels.map((label) => (
                      <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">{selectedEmail.account}</Badge>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.body}
                </div>

                {/* Reply area */}
                <div className="mt-6 border border-gray-200 rounded-xl p-4">
                  <Textarea
                    placeholder="Yanıt yazın..."
                    className="w-full text-sm text-gray-700 resize-none outline-none border-none shadow-none focus-visible:ring-0 p-0 min-h-[100px]"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => handleAI("reply")}
                    >
                      <Bot className="w-3.5 h-3.5" />
                      AI ile yanıt öner
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={handleSendReply} disabled={sendingReply}>
                      {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Okumak için bir e-posta seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
