"use client";

import { useState, useEffect } from "react";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Mail, Calendar, Bot, Key,
  CheckCircle, XCircle, Globe
} from "lucide-react";



const aiModels = [
  { name: "Gemini Pro (Google)", key: "GEMINI_API_KEY", status: "configured", icon: "🔵" },
  { name: "Claude (Anthropic)", key: "ANTHROPIC_API_KEY", status: "not_configured", icon: "🟣" },
  { name: "GPT-4 (OpenAI)", key: "OPENAI_API_KEY", status: "not_configured", icon: "⚫" },
];

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string; image?: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data);
        }
      });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Ayarlar" subtitle="Platform yapılandırması" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-4 h-4" />
              Profil Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ad Soyad</label>
                <Input value={user?.name || "Yükleniyor..."} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Unvan (Otomatik)</label>
                <Input value="Dernek Temsilcisi" readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
            </div>
            <p className="text-xs text-amber-600 font-medium">Not: Profil bilgileri Google Hesabınızdan senkronize edilir.</p>
          </CardContent>
        </Card>

        {/* Gmail Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              Aktif Google Bağlantısı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "G"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.email || "Yükleniyor..."}</p>
                  <p className="text-xs text-gray-500">Workspace / Yönetim</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs gap-1 bg-green-100 text-green-700 border-none">
                <CheckCircle className="w-3 h-3" />
                Sisteme Bağlı
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Çoklu-hesap sistemi Firebase girişi aracılığıyla panel izolasyonu sağlar. Farklı bir e-posta bağlamak için hesaptan çıkış yaparak o adresle tekrar giriş yapmalısınız.</p>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Google Takvim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">📅</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.email || "Yükleniyor..."}</p>
                  <p className="text-xs text-gray-500">Birincil Takvim (Çift Yönlü Eşleşme Aktif)</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs gap-1 bg-green-100 text-green-700 border-none">
                <CheckCircle className="w-3 h-3" />
                Senkronize
              </Badge>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 mt-2">
              <p className="text-xs font-medium text-gray-700 mb-2">AI Bot Adı</p>
              <div className="flex gap-2">
                <Input value={`${user?.name?.split(" ")[0] || "Asistan"} Botu`} readOnly className="text-sm bg-gray-100 text-gray-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Bu isim otomatik asistan yanıtlarında yer alan bot imzasıdır.</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Models */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="w-4 h-4" />
              AI Model Yapılandırması
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiModels.map((model) => (
              <div key={model.name} className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{model.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{model.name}</span>
                  </div>
                  {model.status === "configured" ? (
                    <Badge variant="success" className="text-xs gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Yapılandırıldı
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <XCircle className="w-3 h-3" />
                      Yapılandırılmadı
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder={`${model.key} girin...`}
                    className="text-xs h-8"
                    defaultValue={model.status === "configured" ? "sk-•••••••••••••••••" : ""}
                  />
                  <Button size="sm" className="h-8 text-xs">
                    <Key className="w-3 h-3 mr-1" />
                    Kaydet
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Google Drive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4" />
              Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm">📁</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Drive Kütüphanesi</p>
                  <p className="text-xs text-gray-500">Dosyalar /AsistanPanel/ klasörüne kaydedilir</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs gap-1">
                <CheckCircle className="w-3 h-3" />
                Bağlı
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
