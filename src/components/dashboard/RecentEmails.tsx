"use client";

import { Mail, Star, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const mockEmails = [
  {
    id: "1",
    from: "Ahmet Yılmaz",
    fromEmail: "ahmet@dernek.org",
    subject: "Mayıs Ayı Genel Kurul Gündemi",
    snippet: "Sayın Başkanım, mayıs ayı genel kurul toplantısı için gündem maddelerini...",
    time: "09:32",
    isRead: false,
    isStarred: true,
    account: "nurevsan@gmail.com",
  },
  {
    id: "2",
    from: "Belediye İletişim",
    fromEmail: "iletisim@belediye.gov.tr",
    subject: "Etkinlik İzin Başvurusu - Onay",
    snippet: "15 Mayıs tarihli etkinlik başvurunuz onaylanmıştır...",
    time: "08:15",
    isRead: false,
    isStarred: false,
    account: "nurevsan@gmail.com",
  },
  {
    id: "3",
    from: "Fatma Demir",
    fromEmail: "fatma.demir@mail.com",
    subject: "Bağış Kampanyası Hakkında",
    snippet: "Merhaba, kampanyamıza katılmak istiyorum ve detayları öğrenmek...",
    time: "Dün",
    isRead: true,
    isStarred: false,
    account: "dernek@gmail.com",
  },
  {
    id: "4",
    from: "Bank Transfer",
    fromEmail: "bildirim@banka.com",
    subject: "Hesap Bildirimi - Bağış Alındı",
    snippet: "500 TL tutarında bağış hesabınıza geçmiştir...",
    time: "Dün",
    isRead: true,
    isStarred: false,
    account: "dernek@gmail.com",
  },
];

export function RecentEmails() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Son E-postalar
          </CardTitle>
          <Link
            href="/dashboard/email"
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            Tümü <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {mockEmails.map((email) => (
            <div
              key={email.id}
              className={`flex items-start gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                !email.isRead ? "bg-blue-50/30" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {email.from.charAt(0)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm ${!email.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                    {email.from}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {email.isStarred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    <span className="text-xs text-gray-400">{email.time}</span>
                  </div>
                </div>
                <p className={`text-sm truncate ${!email.isRead ? "font-medium text-gray-800" : "text-gray-600"}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">{email.snippet}</p>
                <Badge variant="outline" className="mt-1 text-xs py-0">
                  {email.account}
                </Badge>
              </div>

              {!email.isRead && (
                <div className="flex-shrink-0 mt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
