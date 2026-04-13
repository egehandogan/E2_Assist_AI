"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import {
  Mail, Star, Search, RefreshCw, Archive, Trash2, Reply,
  ChevronDown, Inbox, Send, Tag, Bot, Plus, X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const accounts = [
  { id: "1", email: "nurevsan@gmail.com", label: "Kişisel", color: "bg-blue-500", unread: 8 },
  { id: "2", email: "dernek@gmail.com", label: "Dernek", color: "bg-green-500", unread: 4 },
];

const mockEmails = [
  {
    id: "1",
    from: "Ahmet Yılmaz",
    fromEmail: "ahmet@dernek.org",
    subject: "Mayıs Ayı Genel Kurul Gündemi",
    body: `Sayın Başkanım,\n\nMayıs ayı genel kurul toplantısı için gündem maddelerini aşağıda belirtmek istedim:\n\n1. Faaliyet raporu sunumu\n2. Mali rapor ve bütçe onayı\n3. Yeni proje teklifleri\n4. Seçim (gerektiğinde)\n\nSaygılarımla,\nAhmet Yılmaz`,
    time: "09:32",
    date: "Bugün",
    isRead: false,
    isStarred: true,
    account: "nurevsan@gmail.com",
    labels: ["Önemli"],
    summary: "Mayıs genel kurul toplantısı için 4 gündem maddesi içeren bilgilendirme maili.",
  },
  {
    id: "2",
    from: "Belediye İletişim",
    fromEmail: "iletisim@belediye.gov.tr",
    subject: "Etkinlik İzin Başvurusu - Onay",
    body: `Sayın Nurevşan Hanım,\n\n15 Mayıs 2024 tarihli etkinlik başvurunuz onaylanmıştır. İzin belgesi ekte sunulmuştur.\n\nSaygılarımızla,\nBelediye Etkinlik Birimi`,
    time: "08:15",
    date: "Bugün",
    isRead: false,
    isStarred: false,
    account: "nurevsan@gmail.com",
    labels: ["Resmi"],
    summary: "15 Mayıs etkinlik izni onaylandı.",
  },
  {
    id: "3",
    from: "Fatma Demir",
    fromEmail: "fatma.demir@mail.com",
    subject: "Bağış Kampanyası Hakkında",
    body: `Merhaba,\n\nKampanyânıza katılmak istiyorum. Lütfen banka hesap bilgilerini paylaşır mısınız?`,
    time: "16:45",
    date: "Dün",
    isRead: true,
    isStarred: false,
    account: "dernek@gmail.com",
    labels: [],
    summary: "Bağış kampanyasına katılmak isteyen kişi, banka bilgisi talep ediyor.",
  },
];

export default function EmailPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<typeof mockEmails[0] | null>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmails = mockEmails.filter((e) => {
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

  return (
    <div className="flex flex-col h-full">
      <TopBar title="E-postalar" subtitle="Tüm Gmail hesaplarınız" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Account list + Email list */}
        <div className="w-80 flex flex-col border-r border-gray-100 bg-white">
          {/* Accounts */}
          <div className="p-3 border-b border-gray-100">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedAccount(null)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedAccount === null
                    ? "bg-violet-50 text-violet-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Inbox className="w-4 h-4" />
                <span>Tüm Gelen Kutusu</span>
                <span className="ml-auto text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">12</span>
              </button>
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.email)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedAccount === acc.email
                      ? "bg-violet-50 text-violet-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className={`w-3 h-3 rounded-full ${acc.color}`} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="truncate text-xs font-medium">{acc.label}</p>
                    <p className="truncate text-xs text-gray-400">{acc.email}</p>
                  </div>
                  {acc.unread > 0 && (
                    <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5">
                      {acc.unread}
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
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={cn(
                  "flex items-start gap-2.5 p-3 cursor-pointer border-b border-gray-50 transition-colors",
                  selectedEmail?.id === email.id
                    ? "bg-violet-50 border-l-2 border-l-violet-500"
                    : "hover:bg-gray-50",
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

        {/* Right Panel - Email detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEmail ? (
            <>
              {/* Email toolbar */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-white">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Reply className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Star className={`w-4 h-4 ${selectedEmail.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                </Button>
                <div className="ml-auto">
                  <Button
                    size="sm"
                    variant={showAISummary ? "default" : "outline"}
                    onClick={() => setShowAISummary(!showAISummary)}
                    className="gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    AI Özet
                  </Button>
                </div>
              </div>

              {/* Email content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* AI Summary */}
                {showAISummary && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-violet-700">AI Özeti</span>
                    </div>
                    <p className="text-sm text-violet-800">{selectedEmail.summary}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Araştır
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Görev Oluştur
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Yanıt Öner
                      </Button>
                    </div>
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
                      <Badge key={label} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">
                      {selectedEmail.account}
                    </Badge>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Email body */}
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.body}
                </div>

                {/* Reply area */}
                <div className="mt-6 border border-gray-200 rounded-xl p-4">
                  <textarea
                    placeholder="Yanıt yazın..."
                    className="w-full text-sm text-gray-700 resize-none outline-none min-h-[100px]"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                      <Bot className="w-3.5 h-3.5" />
                      AI ile yanıt öner
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <Send className="w-3.5 h-3.5" />
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
