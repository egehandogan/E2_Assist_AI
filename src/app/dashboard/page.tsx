import { TopBar } from "@/components/layout/TopBar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentEmails } from "@/components/dashboard/RecentEmails";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";
import { TaskList } from "@/components/dashboard/TaskList";
import { QuickNote } from "@/components/dashboard/QuickNote";
import { AIWidget } from "@/components/dashboard/AIWidget";

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Günaydın, Nurevşan 👋"
        subtitle={today}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <DashboardStats />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <RecentEmails />
            <UpcomingMeetings />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <AIWidget />
            <TaskList />
            <QuickNote />
          </div>
        </div>
      </div>
    </div>
  );
}
