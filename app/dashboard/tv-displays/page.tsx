"use client";

import { useState } from "react";
import {
  Monitor,
  Plus,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function TVDisplaysPage() {
  const [activeDisplays, setActiveDisplays] = useState(2);

  const displays = [
    {
      id: 1,
      name: "Men Lobby - Left",
      location: "Main Entrance",
      status: "online",
      content: "Prayer Times",
      lastUpdated: "5 minutes ago",
    },
    {
      id: 2,
      name: "Sisters Side",
      location: "Sisters Entrance",
      status: "online",
      content: "Announcements",
      lastUpdated: "10 minutes ago",
    },
    {
      id: 3,
      name: "Main Hall",
      location: "Prayer Hall",
      status: "offline",
      content: "Events Calendar",
      lastUpdated: "2 hours ago",
    },
  ];

  const contentTemplates = [
    {
      id: 1,
      name: "Prayer Times",
      type: "prayer",
      description: "Display daily prayer times with countdown to next prayer",
      preview: "/placeholder.svg?height=100&width=200",
      active: true,
    },
    {
      id: 2,
      name: "Announcements",
      type: "announcement",
      description: "Rotating announcements for community events",
      preview: "/placeholder.svg?height=100&width=200",
      active: true,
    },
    {
      id: 3,
      name: "Events Calendar",
      type: "calendar",
      description: "Weekly calendar of upcoming events",
      preview: "/placeholder.svg?height=100&width=200",
      active: false,
    },
    {
      id: 4,
      name: "Donation Progress",
      type: "donation",
      description: "Show progress towards fundraising goals",
      preview: "/placeholder.svg?height=100&width=200",
      active: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">TV Displays</h2>
          <p className="text-[#3A3A3A]/70">
            Manage content on your masjid's display screens
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Display
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Display</DialogTitle>
                <DialogDescription>
                  Register a new display screen for your masjid.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" placeholder="Enter display name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="display-location">Location</Label>
                  <Input
                    id="display-location"
                    placeholder="Where is this display located?"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="display-content">Default Content</Label>
                  <select
                    id="display-content"
                    className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                  >
                    <option value="prayer">Prayer Times</option>
                    <option value="announcements">Announcements</option>
                    <option value="events">Events Calendar</option>
                    <option value="donation">Donation Progress</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="display-notes">Notes</Label>
                  <Textarea
                    id="display-notes"
                    placeholder="Any additional information about this display"
                    className="min-h-[100px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-power" />
                  <Label htmlFor="auto-power">Enable auto power schedule</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#550C18] hover:bg-[#78001A] text-white"
                >
                  Add Display
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Active Displays
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Currently online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {activeDisplays}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Out of {displays.length} total displays
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Content Templates
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Available layouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {contentTemplates.length}
            </div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              {contentTemplates.filter((t) => t.active).length} currently active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Next Update
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Content refresh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">5:00 PM</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Auto-updates every 30 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
            Display Screens
          </CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">
            Manage your masjid's display screens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="displays">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="displays">Display Screens</TabsTrigger>
              <TabsTrigger value="content">Content Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="displays" className="space-y-4">
              {displays.map((display) => (
                <div
                  key={display.id}
                  className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                        <Monitor className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#3A3A3A] text-lg">
                            {display.name}
                          </h3>
                          <Badge
                            className={
                              display.status === "online"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }
                          >
                            {display.status.charAt(0).toUpperCase() +
                              display.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Location: {display.location}
                        </p>
                        <p className="text-sm text-[#3A3A3A]/70">
                          Content: {display.content} • Updated{" "}
                          {display.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={display.status === "offline"}
                      >
                        {display.status === "online" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-[#550C18]/10 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-[100px] h-[60px] rounded-md bg-[#550C18]/10 flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-6 w-6 text-[#550C18]/50" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#3A3A3A] text-lg">
                              {template.name}
                            </h3>
                            <Badge
                              className={
                                template.active ? "bg-green-500" : "bg-gray-500"
                              }
                            >
                              {template.active ? "Active" : "Inactive"}
                            </Badge>
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
                        <p className="text-sm text-[#3A3A3A]/70 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
