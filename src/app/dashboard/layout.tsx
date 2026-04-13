import { Sidebar } from "@/components/layout/Sidebar";
import { SeedInit } from "@/components/dashboard/SeedInit";

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
    </div>
  );
}
