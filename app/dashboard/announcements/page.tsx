"use client";

import { useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Calendar,
  Clock,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const announcements = [
    {
      id: 1,
      title: "Ramadan Prayer Schedule",
      content:
        "Updated prayer schedule for Ramadan. Please check the new timings for Taraweeh prayers.",
      status: "active",
      priority: "high",
      createdAt: "2023-04-10",
      expiresAt: "2023-05-10",
      author: "Imam Abdullah",
      displays: ["Men Lobby", "Sisters Side"],
    },
    {
      id: 2,
      title: "Community Iftar This Weekend",
      content:
        "Join us for a community iftar this Saturday at 7:30 PM. Please RSVP by Friday.",
      status: "active",
      priority: "medium",
      createdAt: "2023-04-12",
      expiresAt: "2023-04-16",
      author: "Events Committee",
      displays: ["Men Lobby", "Sisters Side", "Main Hall"],
    },
    {
      id: 3,
      title: "Donation Drive for Syria",
      content:
        "We are collecting donations for earthquake victims in Syria. Please donate generously.",
      status: "active",
      priority: "medium",
      createdAt: "2023-04-05",
      expiresAt: "2023-04-20",
      author: "Charity Committee",
      displays: ["Men Lobby"],
    },
    {
      id: 4,
      title: "Youth Program Registration",
      content:
        "Registration for the summer youth program is now open. Register your children by May 1st.",
      status: "draft",
      priority: "low",
      createdAt: "2023-04-14",
      expiresAt: "2023-05-01",
      author: "Youth Committee",
      displays: [],
    },
    {
      id: 5,
      title: "Parking Lot Maintenance",
      content:
        "The parking lot will be under maintenance next Monday. Please use street parking.",
      status: "scheduled",
      priority: "medium",
      createdAt: "2023-04-13",
      expiresAt: "2023-04-18",
      author: "Facilities Manager",
      displays: [],
    },
  ];

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Announcements</h2>
          <p className="text-[#3A3A3A]/70">
            Create and manage announcements for your masjid
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to display on your masjid's screens.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="announcement-content">Content</Label>
                <Textarea
                  id="announcement-content"
                  placeholder="Enter announcement content"
                  className="min-h-[150px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="announcement-priority">Priority</Label>
                  <select
                    id="announcement-priority"
                    className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="announcement-status">Status</Label>
                  <select
                    id="announcement-status"
                    className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="announcement-start">Start Date</Label>
                  <Input id="announcement-start" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="announcement-end">End Date</Label>
                  <Input id="announcement-end" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Display Locations</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="display-men" />
                    <Label htmlFor="display-men">Men Lobby</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="display-sisters" />
                    <Label htmlFor="display-sisters">Sisters Side</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="display-hall" />
                    <Label htmlFor="display-hall">Main Hall</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                className="bg-[#550C18] hover:bg-[#78001A] text-white"
              >
                Publish Announcement
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
                All Announcements
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View and manage your masjid's announcements
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
                <Input
                  placeholder="Search announcements..."
                  className="pl-10 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-[#550C18]/20 text-[#3A3A3A] hover:bg-[#550C18]/5"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>
            <div className="space-y-4">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-[#3A3A3A] text-lg">
                              {announcement.title}
                            </h3>
                            <Badge
                              className={
                                announcement.status === "active"
                                  ? "bg-green-500"
                                  : announcement.status === "scheduled"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                              }
                            >
                              {announcement.status.charAt(0).toUpperCase() +
                                announcement.status.slice(1)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                announcement.priority === "high"
                                  ? "border-red-500 text-red-500"
                                  : announcement.priority === "medium"
                                  ? "border-orange-500 text-orange-500"
                                  : "border-gray-500 text-gray-500"
                              }
                            >
                              {announcement.priority.charAt(0).toUpperCase() +
                                announcement.priority.slice(1)}{" "}
                              Priority
                            </Badge>
                          </div>
                          <p className="text-sm text-[#3A3A3A]/70 mt-2">
                            {announcement.content}
                          </p>
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs text-[#3A3A3A]/70 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {announcement.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Expires: {announcement.expiresAt}</span>
                            </div>
                            <div>
                              <span>By: {announcement.author}</span>
                            </div>
                          </div>
                          {announcement.displays.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-[#3A3A3A]/70">
                                Displays:
                              </span>
                              {announcement.displays.map((display, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {display}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                  <MessageSquare className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                    No announcements found
                  </h3>
                  <p className="text-[#3A3A3A]/70 mb-4">
                    No announcements match your search criteria. Try adjusting
                    your search or create a new announcement.
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
