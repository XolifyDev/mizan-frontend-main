"use client";

import { useState } from "react";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Search,
  Trash,
  Edit,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const events = [
    {
      id: 1,
      title: "Friday Prayer",
      date: "2023-04-15",
      time: "13:30 - 14:30",
      location: "Main Prayer Hall",
      description: "Weekly Friday prayer service with khutbah.",
      type: "prayer",
    },
    {
      id: 2,
      title: "Quran Study",
      date: "2023-04-16",
      time: "10:00 - 12:00",
      location: "Classroom 2",
      description: "Weekly Quran study and tafsir session.",
      type: "education",
    },
    {
      id: 3,
      title: "Community Iftar",
      date: "2023-04-17",
      time: "19:30 - 21:00",
      location: "Community Hall",
      description: "Community iftar gathering with food and socializing.",
      type: "community",
    },
    {
      id: 4,
      title: "Youth Program",
      date: "2023-04-18",
      time: "18:00 - 20:00",
      location: "Youth Center",
      description: "Weekly youth program with activities and discussions.",
      type: "youth",
    },
    {
      id: 5,
      title: "Islamic Finance Workshop",
      date: "2023-04-20",
      time: "19:00 - 21:00",
      location: "Conference Room",
      description: "Workshop on Islamic finance principles and practices.",
      type: "education",
    },
  ];

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Events</h2>
          <p className="text-[#3A3A3A]/70">
            Manage and schedule events for your masjid
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Create a new event for your masjid. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input id="event-title" placeholder="Enter event title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input id="event-time" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-location">Location</Label>
                <Input id="event-location" placeholder="Enter event location" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-type">Event Type</Label>
                <select
                  id="event-type"
                  className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                >
                  <option value="prayer">Prayer</option>
                  <option value="education">Education</option>
                  <option value="community">Community</option>
                  <option value="youth">Youth</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  placeholder="Enter event description"
                  className="min-h-[100px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#550C18] hover:bg-[#78001A] text-white"
              >
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          <Tabs defaultValue="list">
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
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                          <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#3A3A3A] text-lg">
                              {event.title}
                            </h3>
                            <Badge
                              className={
                                event.type === "prayer"
                                  ? "bg-blue-500"
                                  : event.type === "education"
                                  ? "bg-green-500"
                                  : event.type === "community"
                                  ? "bg-purple-500"
                                  : event.type === "youth"
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                              }
                            >
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-[#3A3A3A]/70 mt-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <p className="text-sm text-[#3A3A3A]/70 mt-1">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
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
                <CalendarIcon className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                  Calendar View
                </h3>
                <p className="text-[#3A3A3A]/70 mb-4">
                  Calendar view is coming soon. You can use the list view to
                  manage events for now.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
