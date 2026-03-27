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
  Calendar,
  Sparkles,
  RefreshCw,
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
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { CalendarView } from "@/components/dashboard/calendar-view";
import type { Event } from "@prisma/client";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [masjidCalendarId, setMasjid] = useState<string>("");
  const [masjidPfp, setMasjidPfp] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const masjidId = searchParams.get("masjidId") || "";
  const currentTab = searchParams.get("tab") || "list";

  const withTimeout = async <T,>(promise: Promise<T>, ms = 15000): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Request timeout")), ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  const loadData = async () => {
    if (!masjidId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [eventsList, masjidRes] = await Promise.all([
        withTimeout(getEvents(masjidId)),
        withTimeout(fetch(`/api/masjids?masjidId=${masjidId}`)),
      ]);

      setEvents(eventsList || []);

      const masjidData = await masjidRes.json();
      if (masjidRes.ok && masjidData && !("error" in masjidData)) {
        setMasjid(masjidData.googleCalendarId || "");
        setMasjidPfp(masjidData.googleCalendarPfp || "");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Events
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Bring your community together.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Create, sync, and manage events across your website, signage, and calendars.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GoogleCalendarSettings
              masjidId={masjidId}
              currentCalendarId={masjidCalendarId}
              currentCalendarPfp={masjidPfp}
              refreshEvents={refreshEvents}
            />
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={refreshEvents}
            >
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button
              className="bg-[#550C18] hover:bg-[#78001A] text-white"
              onClick={() => router.push(`/dashboard/events/new?masjidId=${masjidId}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-white border-[#550C18]/10 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-[#2e0c12]">
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View, edit, and sync your event schedule.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-[320px]">
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
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-[#550C18]/10 p-1 mb-6">
              <TabsTrigger value="list" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                Calendar View
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-[#3A3A3A]/70">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading events...
                </div>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-[#550C18]/10 rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {event.flyerUrl ? (
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-[#550C18]/10">
                            <Image
                              src={event.flyerUrl}
                              alt="Flyer"
                              height={120}
                              width={120}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-[#550C18]/10 text-[#550C18]">
                            <Calendar className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#2e0c12] text-lg">
                              {event.title}
                            </h3>
                            <Badge className={`${event.tagColor}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[#3A3A3A]/70 mt-2">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(event.timeStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                              {new Date(event.timeEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
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
                <div className="text-center p-10">
                  <Sparkles className="h-12 w-12 mx-auto text-[#550C18]/50 mb-4" />
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                    No events yet
                  </h3>
                  <p className="text-[#3A3A3A]/70 mb-4">
                    Create your first event to populate your community calendar.
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <CalendarView events={filteredEvents} masjidId={masjidId} refreshEvents={refreshEvents} />
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
