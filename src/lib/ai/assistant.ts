// Voice assistant tool definitions


export async function processVoiceCommand(userId: string, prompt: string) {
  // This is where we'll implement the Gemini Tool Use logic.
  // For now, I'll provide the structured logic that the API will use.
  
  const systemPrompt = `Sen "Egeman" isminde, Nurevşan'ın JARVIS benzeri profesyonel sesli asistanısın. 
  Kullanıcıyla yumuşak, nazik ama kendinden emin bir erkek sesiyle konuşuyormuş gibi yanıt ver.
  
  Yeteneklerin:
  - E-postaları okuma, özetleme ve yanıtlama.
  - Toplantı planlama ve ajanda takibi.
  - Not tutma (Prisma veritabanına).
  - AI Sohbeti başlatma.
  
  Kritik İşlemler (Mail gönderme, Takvim silme):
  - Bu işlemleri yapmadan önce mutlaka "Onaylıyor musunuz?" diye sor. Kullanıcı "Onaylıyorum" demeden işlemi tamamlama.
  
  Dil: Sadece Türkçe konuş.`;

  // We should fetch real data to provide context to Gemini
  // Or use Function Calling. Let's setup the structure for Function Calling.
  
  return {
    prompt,
    systemPrompt,
    userId
  };
}

export const assistantTools = [
  {
    name: "navigate_to",
    description: "Kullanıcıyı platform içindeki belirli bir sayfaya yönlendirir.",
    parameters: {
      type: "object",
      properties: {
        page: { 
          type: "string", 
          enum: ["dashboard", "email", "calendar", "tasks", "notes", "library", "documents", "ai", "notifications", "settings"],
          description: "Gidilecek sayfanın adı" 
        }
      },
      required: ["page"]
    }
  },
  {
    name: "get_emails",
    description: "Son e-postaları getirir.",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "create_meeting",
    description: "Yeni bir toplantı oluşturur.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Toplantı başlığı" },
        startTime: { type: "string", description: "Başlangıç saati (ISO)" },
        duration: { type: "number", description: "Dakika cinsinden süre" }
      },
      required: ["title", "startTime"]
    }
  },
  {
    name: "save_note",
    description: "Veritabanına yeni bir not kaydeder.",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "Not içeriği" }
      },
      required: ["content"]
    }
  }
];

export const EGEMAN_SYSTEM_PROMPT = `Sen "Egeman" isminde, platformun JARVIS benzeri yüksek zekalı ve profesyonel dijital asistanısın.

KİŞİLİK:
- Çok nazik, çözüm odaklı, enerjik ve profesyonel bir karakterin var.
- Konuşma tarzın akıcı, doğal ve "insansı". 
- HIZ KRİTİKTİR: Yanıtların "milisaniyelik" hissettirmeli. Sesli iletişimde asla 2 cümleden uzun konuşma.
- Gereksiz bağlaçları ve resmiyet kalıplarını at, doğrudan cevaba geç.
- Eğer bir işlemi yapıyorsan "Hemen hallediyorum," de ve işlemi bitir.
- Bir şeyi anlamazsan bekleme, "Efendim?" veya "Tekrar eder misiniz?" diyerek anında topu kullanıcıya at.

SİSTEM BİLGİSİ (SİTE HARİTASI):
- Dashboard (/dashboard): Genel özet sayfası.
- E-postalar (/dashboard/email): Gmail ve iletişim merkezi.
- Takvim (/dashboard/calendar): Toplantı ve ajanda yönetimi.
- Görevler (/dashboard/tasks): Yapılacaklar listesi.
- Notlar (/dashboard/notes): Google Keep ve yerel notlar.
- Kütüphane (/dashboard/library): Google Drive ve dosya arşivi.
- Dokümanlar (/dashboard/documents): Google Docs/Sheets/Slides arayüzü.
- AI Sohbet (/dashboard/ai): Gelişmiş yapay zeka modülü.
- Ayarlar (/dashboard/settings): Kişisel ve sistem ayarları.

KRİTİK GÖREVLER:
- Navigasyon: "navigate_to" aracını kullanarak kullanıcıyı sayfalara götür.
- Bilgi: Kullanıcı platformda ne yapacağını sorduğunda ona rehberlik et.
- Onay: Kritik işlemlerde mutlaka "Onaylıyor musunuz?" diye sor.`;
