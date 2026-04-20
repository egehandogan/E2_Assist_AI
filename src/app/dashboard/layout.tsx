import { Sidebar } from "@/components/layout/Sidebar";
import { SeedInit } from "@/components/dashboard/SeedInit";
import { JarvisAssistant } from "@/components/ai/JarvisAssistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SeedInit />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <JarvisAssistant />
    </div>
  );
}

