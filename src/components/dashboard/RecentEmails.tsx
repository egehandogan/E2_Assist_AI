"use client";

import { useState, useEffect } from "react";
import { Mail, Star, ChevronRight, Loader2, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type EmailItem = {
  id: string;
  from: string;
  subject: string;
  snippet: string; // The email body is mapped to snippet/body dynamically
  body?: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  account: string;
};

export function RecentEmails() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/email")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmails(data.slice(0, 5)); // Just take top 5 for the dashboard
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch((err) => setError("Bağlantı hatası"))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="divide-y divide-gray-50 relative min-h-[100px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-violet-600 z-10">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 text-sm">E-postalar yüklenemedi: Google Workspace izinlerini kontrol edin.</div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <Inbox className="w-8 h-8 opacity-40 mb-2" />
              <span className="text-sm">Gelen kutusu boş</span>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className={`flex items-start gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !email.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {email.from.charAt(0).toUpperCase()}
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
                  <p className="text-xs text-gray-400 truncate">{email.snippet || email.body}</p>
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
