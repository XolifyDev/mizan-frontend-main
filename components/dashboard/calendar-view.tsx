"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Event } from "@prisma/client";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/lib/actions/events";
import { toast } from "@/hooks/use-toast";
import { MobileEventList } from "./mobile-event-list";

interface CalendarViewProps {
  events: Event[];
  masjidId: string;
  refreshEvents?: () => Promise<void>;
}

export function CalendarView({ events, masjidId, refreshEvents }: CalendarViewProps) {
  const router = useRouter();
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    let formattedEvents = events.map((event) => {
      const eventDate = new Date(event.date);
      const startTime = new Date(event.timeStart);
      const endTime = new Date(event.timeEnd);
      
      // Combine date and time for start and end
      const start = new Date(eventDate);
      start.setHours(startTime.getHours(), startTime.getMinutes());
      
      const end = new Date(eventDate);
      end.setHours(endTime.getHours(), endTime.getMinutes());

      return {
        id: event.id,
        title: event.title,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: event.tagColor,
        borderColor: event.tagColor,
        textColor: "#ffffff",
        extendedProps: {
          description: event.description,
          location: event.location,
          type: event.type,
          event
        },
      };
    });
    if (!formattedEvents.length) {
      formattedEvents = [];
    }
    setCalendarEvents(formattedEvents);
  }, [events]);

  async function handleEventDrop(info: any) {
    const eventId = info.event.id;
    const newDate = info.event.start;
    const event = info.event.extendedProps.event;
    delete event.googleCalendarEventId;
    try {
      await updateEvent(eventId, { ...event, date: newDate }).then(async () => {
        toast({ title: "Event updated", description: "Event date changed successfully." }); 
        setTimeout(async () => {
          // if (refreshEvents) await refreshEvents();
        }, 1000);
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update event date.", variant: "destructive" });
      info.revert();
    }
  }

  return (
    <>
      <style jsx global>{`
        .fc-daygrid-day {
          min-width: 120px !important;
        }
        .fc-daygrid-day-frame {
          min-height: 100px !important;
        }
        .fc-event {
          margin: 1px 0;
        }
      `}</style>
      <div className="bg-white rounded-lg p-4 calendar-theme w-full overflow-x-auto">
        {/* Desktop/Tablet Calendar */}
        {!isMobile && (
          <div className="min-w-[800px]">
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
                <div className="p-1 sm:p-0.5 md:p-1 cursor-grab active:cursor-grabbing hover:bg-[#550C18]/10 rounded-md w-full flex flex-row gap-4">
                  <div className={`h-2 w-2 rounded-full bg-[${eventInfo.event.backgroundColor}] my-auto ml-1 md:hidden`}></div>
                  <div className="w-full">
                    <div className="font-medium text-sm truncate">{eventInfo.event.title}</div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs opacity-80 truncate">
                        {eventInfo.event.start?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {eventInfo.event.end?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs opacity-80 truncate break-words text-wrap w-full">
                        {eventInfo.event.extendedProps.location}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              editable={true}
              eventDrop={handleEventDrop}
              height="800px"
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
        )}
        {/* Mobile Calendar */}
        {isMobile && (
          <MobileEventList events={events} />
        )}
      </div>
    </>
  );
} 