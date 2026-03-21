import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export function MobileEventList({ events }: { events: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate current week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  // Filter events for this week
  const weekEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
    });
  }, [events, weekStart, weekEnd]);

  // Handlers for week/month navigation
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Month and week display
  const monthLabel = format(currentDate, "MMMM yyyy");
  const weekLabel = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-center mb-2 w-full gap-2">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft /></Button>
        <span className="font-semibold text-lg text-center flex-1">{monthLabel}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight /></Button>
      </div>
      <div className="flex flex-col items-center w-full mb-4 gap-2">
        <div className="flex items-center justify-center w-full gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek} className="flex-1">Previous</Button>
          <span className="font-medium text-base text-center flex-1">{weekLabel}</span>
          <Button variant="outline" size="sm" onClick={nextWeek} className="flex-1">Next</Button>
        </div>
      </div>
      {weekEvents.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 w-full">
          <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-[#550C18]/50" />
          <div>No events this week.</div>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {weekEvents.map(event => (
            <Card key={event.id} className="border-[#550C18]/20 shadow-sm w-full">
              <CardContent className="py-4 px-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-[#550C18] text-lg">{event.title}</span>
                  <span className="ml-auto text-xs bg-[#550C18]/10 text-[#550C18] rounded px-2 py-0.5">{format(new Date(event.date), "EEE, MMM d")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/80 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(event.timeStart), "h:mm a")} - {format(new Date(event.timeEnd), "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/80">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 