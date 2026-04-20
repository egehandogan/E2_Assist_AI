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
