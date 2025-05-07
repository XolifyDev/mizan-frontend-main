import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Event } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CalendarViewProps {
  events: Event[];
  masjidId: string;
}

export function CalendarView({ events, masjidId }: CalendarViewProps) {
  const router = useRouter();
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
      backgroundColor: event.tagColor,
      borderColor: event.tagColor,
      textColor: "#ffffff",
      extendedProps: {
        description: event.description,
        location: event.location,
        type: event.type,
      },
    }));
    setCalendarEvents(formattedEvents);
  }, [events]);

  return (
    <div className="h-[800px] bg-white rounded-lg p-4 calendar-theme">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={calendarEvents}
        eventClick={(info) => {
          router.push(`/dashboard/events/${info.event.id}/edit?masjidId=${masjidId}`);
        }}
        eventContent={(eventInfo) => (
          <div className="p-1 hover:bg-[#550C18]/10 rounded-md w-full flex flex-row gap-4">
            <div className={`h-2 w-2 rounded-full bg-[${eventInfo.event.backgroundColor}] my-auto ml-1`}></div>
            <div>
              <div className="font-medium text-sm truncate">{eventInfo.event.title}</div>
              <div className="text-xs opacity-80 truncate max-w-full flex-wrap text-wrap break-words">
                {eventInfo.event.extendedProps.location}
              </div>
            </div>
          </div>
        )}
        height="100%"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        nowIndicator={true}
        dayMaxEvents={3}
        moreLinkContent={(args) => `+${args.num} more`}
        eventMaxStack={3}
        stickyHeaderDates={true}
        dayHeaderFormat={{ weekday: "long" }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        themeSystem="standard"
      />
    </div>
  );
} 