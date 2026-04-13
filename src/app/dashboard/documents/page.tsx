import { TopBar } from "@/components/layout/TopBar";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dokümanlar" subtitle="Excel, Word ve doküman editörü" />
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Doküman Editörü</p>
          <p className="text-xs mt-1">Excel ve Word benzeri editör yakında aktif olacak</p>
        </div>
      </div>
    </div>
  );
}
