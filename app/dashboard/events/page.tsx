"use client";

import { useEffect, useState } from "react";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Search,
  Trash,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvents, deleteEvent } from "@/lib/actions/events";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GoogleCalendarSettings } from "@/components/dashboard/google-calendar-settings";
import { Masjid } from "@prisma/client";
import { getUserMasjid } from "@/lib/actions/masjid";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { CalendarView } from "@/components/dashboard/calendar-view";
type Event = {
  id: string;
  title: string;
  date: Date;
  timeStart: Date;
  timeEnd: Date;
  location: string;
  description: string;
  type: string;
  tagColor: string;
  masjidId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [masjidCalendarId, setMasjid] = useState<string>("");
  const [masjidPfp, setMasjidPfp] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const masjidId = searchParams.get("masjidId") || "";
  const currentTab = searchParams.get("tab") || "list";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  const loadData = async () => {
    const events = await getEvents(masjidId);
    const m = await getUserMasjid();
    setEvents(events);
    if (m) {
      setMasjid(m?.googleCalendarId || "");
      setMasjidPfp(m?.googleCalendarPfp || "");
    }
  };

  useEffect(() => {
    loadData();
  }, [masjidId]);

  const refreshEvents = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  ) as Event[];

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent(eventToDelete.id);
      setEvents(events.filter((event) => event.id !== eventToDelete.id));
      toast({ 
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      toast({ 
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Events</h2>
          <p className="text-[#3A3A3A]/70">
            Manage and schedule events for your masjid
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GoogleCalendarSettings masjidId={masjidId} currentCalendarId={masjidCalendarId} currentCalendarPfp={masjidPfp} refreshEvents={refreshEvents} />
          <Button 
            className="bg-[#550C18] hover:bg-[#78001A] text-white"
            onClick={() => router.push(`/dashboard/events/new?masjidId=${masjidId}`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Event
          </Button>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <Button onClick={refreshEvents} variant="outline" className="flex items-center gap-2">
          {refreshing ? <Loader2 className="animate-spin h-4 w-4" /> : <></>}
          Refresh
        </Button>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View and manage scheduled events
              </CardDescription>
            </div>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
              <Input
                placeholder="Search events..."
                className="pl-10 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                      {event.flyerUrl ? (
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-md bg-[#550C18]/10 text-[#550C18] rounded-md">
                            <Image
                              src={event.flyerUrl}
                              alt="Flyer"
                              height={120}
                              width={120}
                              className="object-cover rounded-md max-h-full"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-md bg-[#550C18]/10 text-[#550C18]">
                            <CalendarIcon className="h-6 w-8" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#3A3A3A] text-lg">
                              {event.title}
                            </h3>
                            <Badge
                              className={`${event.tagColor}`}
                            >
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-[#3A3A3A]/70 mt-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span className="text-[#550C18]">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-[#550C18]">
                                {event.timeStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                {event.timeEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-[#550C18]">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/dashboard/events/${event.id}/edit?masjidId=${masjidId}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEventToDelete(event);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8">
                  <CalendarIcon className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                    No events found
                  </h3>
                  <p className="text-[#3A3A3A]/70 mb-4">
                    No events match your search criteria. Try adjusting your
                    search or add a new event.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <div className="text-center p-8">
                <CalendarView events={filteredEvents} masjidId={masjidId} refreshEvents={refreshEvents} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{eventToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-primary hover:bg-primary/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
