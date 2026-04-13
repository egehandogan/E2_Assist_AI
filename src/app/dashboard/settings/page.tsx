"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Mail, Calendar, Bot, Key, Plus, Trash2,
  CheckCircle, XCircle, Globe
} from "lucide-react";

const gmailAccounts = [
  { email: "nurevsan@gmail.com", label: "Kişisel", status: "connected" },
  { email: "dernek@gmail.com", label: "Dernek", status: "connected" },
];

const aiModels = [
  { name: "Claude (Anthropic)", key: "ANTHROPIC_API_KEY", status: "configured", icon: "🟣" },
  { name: "GPT-4 (OpenAI)", key: "OPENAI_API_KEY", status: "not_configured", icon: "⚫" },
  { name: "Gemini (Google)", key: "GEMINI_API_KEY", status: "not_configured", icon: "🔵" },
];

export default function SettingsPage() {
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
                <Input defaultValue="Nurevşan Doğan" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Unvan</label>
                <Input defaultValue="Dernek Başkanı" />
              </div>
            </div>
            <Button size="sm">Kaydet</Button>
          </CardContent>
        </Card>

        {/* Gmail Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              Gmail Hesapları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gmailAccounts.map((acc) => (
              <div key={acc.email} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">G</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{acc.email}</p>
                    <p className="text-xs text-gray-500">{acc.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Bağlı
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Gmail Hesabı Ekle
            </Button>
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
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">📅</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">nurevsan@gmail.com</p>
                  <p className="text-xs text-gray-500">Birincil takvim</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs gap-1">
                <CheckCircle className="w-3 h-3" />
                Bağlı
              </Badge>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs font-medium text-gray-700 mb-2">AI Bot Adı</p>
              <div className="flex gap-2">
                <Input defaultValue="Nurevşan Asistan" className="text-sm" />
                <Button size="sm">Güncelle</Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Bu isim toplantılara katıldığında görünür</p>
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
