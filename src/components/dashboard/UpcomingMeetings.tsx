"use client";

import { Calendar, Video, MapPin, Users, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockMeetings = [
  {
    id: "1",
    title: "Yönetim Kurulu Toplantısı",
    time: "14:00 - 15:30",
    type: "online",
    attendees: ["Ahmet Y.", "Fatma D.", "Mehmet K.", "+5"],
    status: "upcoming",
    minutesLeft: 45,
  },
  {
    id: "2",
    title: "Bağışçı Görüşmesi",
    time: "16:00 - 17:00",
    type: "inperson",
    location: "Dernek Merkezi",
    attendees: ["Ali V.", "Zeynep A."],
    status: "upcoming",
    minutesLeft: 165,
  },
  {
    id: "3",
    title: "Etkinlik Planlama",
    time: "Yarın 10:00 - 11:00",
    type: "online",
    attendees: ["Ekip"],
    status: "tomorrow",
    minutesLeft: null,
  },
];

export function UpcomingMeetings() {
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
      <CardContent className="space-y-3">
        {mockMeetings.map((meeting) => (
          <div
            key={meeting.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 cursor-pointer transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
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
                    <p className="text-xs text-gray-400">{meeting.location}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {meeting.minutesLeft !== null ? (
                    <Badge variant={meeting.minutesLeft < 60 ? "destructive" : "default"} className="text-xs">
                      {meeting.minutesLeft < 60
                        ? `${meeting.minutesLeft} dk`
                        : `${Math.floor(meeting.minutesLeft / 60)} sa`}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Yarın</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{meeting.attendees.join(", ")}</span>
                </div>
                {meeting.type === "online" && meeting.minutesLeft !== null && meeting.minutesLeft < 60 && (
                  <Button size="sm" variant="default" className="h-6 text-xs px-2">
                    Katıl
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
