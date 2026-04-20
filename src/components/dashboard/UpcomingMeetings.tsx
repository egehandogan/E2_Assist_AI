"use client";

import { useState, useEffect } from "react";
import { Calendar, Video, MapPin, Users, ChevronRight, Loader2, CalendarX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Meeting = {
  id: string;
  title: string;
  time: string;
  type: "online" | "inperson";
  location?: string;
  attendees: string[];
  status: "upcoming" | "tomorrow";
  minutesLeft: number | null;
};

export function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meetings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMeetings(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-500" />
            Yaklaşan Toplantılar
          </CardTitle>
          <Link
            href="/dashboard/calendar"
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            Takvim <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative min-h-[100px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-violet-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="py-8 text-center text-gray-400 flex flex-col items-center">
            <CalendarX className="w-8 h-8 opacity-40 mb-2" />
            <span className="text-sm">Yaklaşan toplantı bulunamadı</span>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 cursor-pointer transition-all"
            >
              <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                {meeting.type === "online" ? (
                  <Video className="w-5 h-5 text-violet-600" />
                ) : (
                  <MapPin className="w-5 h-5 text-violet-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{meeting.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{meeting.time}</p>
                    {meeting.location && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{meeting.location}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {meeting.minutesLeft !== null ? (
                      <Badge variant={meeting.minutesLeft < 60 ? "destructive" : "default"} className="text-xs">
                        {meeting.minutesLeft < 60
                          ? `${meeting.minutesLeft} dk`
                          : `${Math.floor(meeting.minutesLeft / 60)} sa`}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Uzak</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mr-2">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{meeting.attendees.join(", ")}</span>
                  </div>
                  {meeting.type === "online" && meeting.minutesLeft !== null && meeting.minutesLeft < 60 && (
                    <Button size="sm" variant="default" className="h-6 text-xs px-2">
                      Katıl
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
