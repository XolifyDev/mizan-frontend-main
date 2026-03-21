"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Globe, Info, Save, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Settings</h2>
          <p className="text-[#3A3A3A]/70">
            Manage your masjid's system settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="prayer-times">Prayer Times</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                General Settings
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Configure your masjid's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="masjid-name">Masjid Name</Label>
                  <Input
                    id="masjid-name"
                    placeholder="Enter masjid name"
                    defaultValue="Masjid Al-Noor"
                    className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      defaultValue="info@masjidalnooor.org"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(123) 456-7890"
                      defaultValue="(555) 123-4567"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter masjid address"
                    defaultValue="123 Islamic Way, Springfield, IL 62701"
                    className="min-h-[100px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="America/Chicago">
                    <SelectTrigger
                      id="timezone"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    >
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger
                      id="language"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#550C18]/10">
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">
                  Appearance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="dark-mode"
                        className="font-medium text-[#3A3A3A]"
                      >
                        Dark Mode
                      </Label>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Enable dark mode for the admin dashboard
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        defaultValue="#550C18"
                        className="w-16 h-10 p-1 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                      <Input
                        type="text"
                        defaultValue="#550C18"
                        className="w-32 border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prayer-times">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Prayer Time Settings
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Configure how prayer times are calculated and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="auto-adjust"
                      className="font-medium text-[#3A3A3A]"
                    >
                      Auto-adjust for DST
                    </Label>
                    <p className="text-sm text-[#3A3A3A]/70">
                      Automatically adjust prayer times for Daylight Saving Time
                    </p>
                  </div>
                  <Switch
                    id="auto-adjust"
                    checked={autoAdjust}
                    onCheckedChange={setAutoAdjust}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="calculation-method"
                      className="font-medium text-[#3A3A3A]"
                    >
                      Calculation Method
                    </Label>
                    <Select defaultValue="ISNA">
                      <SelectTrigger
                        id="calculation-method"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MWL">Muslim World League</SelectItem>
                        <SelectItem value="ISNA">
                          Islamic Society of North America (ISNA)
                        </SelectItem>
                        <SelectItem value="Egypt">
                          Egyptian General Authority of Survey
                        </SelectItem>
                        <SelectItem value="Makkah">
                          Umm al-Qura University, Makkah
                        </SelectItem>
                        <SelectItem value="Karachi">
                          University of Islamic Sciences, Karachi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="asr-method"
                      className="font-medium text-[#3A3A3A]"
                    >
                      Asr Calculation
                    </Label>
                    <Select defaultValue="Standard">
                      <SelectTrigger
                        id="asr-method"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">
                          Standard (Shafi'i, Maliki, Hanbali)
                        </SelectItem>
                        <SelectItem value="Hanafi">Hanafi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="high-latitude"
                    className="font-medium text-[#3A3A3A]"
                  >
                    High Latitude Method
                  </Label>
                  <Select defaultValue="AngleBased">
                    <SelectTrigger
                      id="high-latitude"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    >
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NightMiddle">
                        Middle of Night
                      </SelectItem>
                      <SelectItem value="AngleBased">Angle Based</SelectItem>
                      <SelectItem value="OneSeventh">1/7th of Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#550C18]/10">
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">
                  Adjustments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fajr-adjustment">
                        Fajr Adjustment (minutes)
                      </Label>
                      <Input
                        id="fajr-adjustment"
                        type="number"
                        defaultValue="0"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dhuhr-adjustment">
                        Dhuhr Adjustment (minutes)
                      </Label>
                      <Input
                        id="dhuhr-adjustment"
                        type="number"
                        defaultValue="0"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asr-adjustment">
                        Asr Adjustment (minutes)
                      </Label>
                      <Input
                        id="asr-adjustment"
                        type="number"
                        defaultValue="0"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maghrib-adjustment">
                        Maghrib Adjustment (minutes)
                      </Label>
                      <Input
                        id="maghrib-adjustment"
                        type="number"
                        defaultValue="0"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isha-adjustment">
                        Isha Adjustment (minutes)
                      </Label>
                      <Input
                        id="isha-adjustment"
                        type="number"
                        defaultValue="0"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jummah-time">Jumu'ah Time</Label>
                      <Input
                        id="jummah-time"
                        type="time"
                        defaultValue="13:30"
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Notification Settings
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Configure how notifications are sent and received
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="email-notifications"
                      className="font-medium text-[#3A3A3A]"
                    >
                      Email Notifications
                    </Label>
                    <p className="text-sm text-[#3A3A3A]/70">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="push-notifications"
                      className="font-medium text-[#3A3A3A]"
                    >
                      Push Notifications
                    </Label>
                    <p className="text-sm text-[#3A3A3A]/70">
                      Receive push notifications on your devices
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#550C18]/10">
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">
                  Notification Types
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Donation Received
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Notify when a new donation is received
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="donation-email" className="text-sm">
                          Email
                        </Label>
                        <Switch id="donation-email" defaultChecked />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="donation-push" className="text-sm">
                          Push
                        </Label>
                        <Switch id="donation-push" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">New Event</p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Notify when a new event is created
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="event-email" className="text-sm">
                          Email
                        </Label>
                        <Switch id="event-email" defaultChecked />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="event-push" className="text-sm">
                          Push
                        </Label>
                        <Switch id="event-push" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Prayer Time Updates
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Notify when prayer times are updated
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="prayer-email" className="text-sm">
                          Email
                        </Label>
                        <Switch id="prayer-email" defaultChecked />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="prayer-push" className="text-sm">
                          Push
                        </Label>
                        <Switch id="prayer-push" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        New User Registration
                      </p>
                      <p className="text-sm text-[#3A3A3A]/70">
                        Notify when a new user registers
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="user-email" className="text-sm">
                          Email
                        </Label>
                        <Switch id="user-email" defaultChecked />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="user-push" className="text-sm">
                          Push
                        </Label>
                        <Switch id="user-push" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#550C18]/10">
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">
                  Community Notifications
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="announcement-template">
                    Announcement Email Template
                  </Label>
                  <Textarea
                    id="announcement-template"
                    placeholder="Enter email template"
                    defaultValue="Dear {name},\n\nWe have an important announcement from {masjid_name}:\n\n{announcement_text}\n\nJazakAllah Khair,\n{masjid_name} Team"
                    className="min-h-[150px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Users & Permissions
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">
                    Admin Users
                  </h3>
                  <Button
                    variant="outline"
                    className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>

                <div className="border rounded-md border-[#550C18]/10">
                  <div className="flex items-center justify-between p-4 border-b border-[#550C18]/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#550C18]/10 text-[#550C18]">
                          AH
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">
                          Ahmed Hassan
                        </p>
                        <p className="text-sm text-[#3A3A3A]/70">
                          ahmed@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#550C18]">Super Admin</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border-b border-[#550C18]/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#550C18]/10 text-[#550C18]">
                          SA
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">Sarah Ali</p>
                        <p className="text-sm text-[#3A3A3A]/70">
                          sarah@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#550C18]">Admin</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#550C18]/10 text-[#550C18]">
                          MK
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#3A3A3A]">
                          Mohammed Khan
                        </p>
                        <p className="text-sm text-[#3A3A3A]/70">
                          mohammed@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#550C18]">Editor</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#550C18]/10">
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">
                  Role Permissions
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#3A3A3A]">
                        Super Admin
                      </h4>
                      <Badge className="bg-green-600">All Permissions</Badge>
                    </div>
                    <p className="text-sm text-[#3A3A3A]/70">
                      Has full access to all features and settings
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#3A3A3A]">Admin</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Edit Permissions
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Manage Users</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Manage Content</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Manage Events</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Manage Donations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>View Analytics</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#3A3A3A]">Editor</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Edit Permissions
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Manage Content</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Manage Events</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3A3A3A]/70">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>View Analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#550C18]/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">
                    Create New Role
                  </h3>
                  <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                    Create Role
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      placeholder="Enter role name"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea
                      id="role-description"
                      placeholder="Enter role description"
                      className="min-h-[80px] border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                System Settings
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="auto-backup"
                      className="font-medium text-[#3A3A3A]"
                    >
                      Automatic Backups
                    </Label>
                    <p className="text-sm text-[#3A3A3A]/70">
                      Automatically backup system data weekly
                    </p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger
                      id="backup-frequency"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                    >
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium text-[#3A3A3A]">Last Backup</p>
                    <p className="text-sm text-[#3A3A3A]/70">
                      March 25, 2023 at 3:45 PM
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  >
                    Backup Now
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-[#3A3A3A]">
                      API Integration
                    </h3>
                    <p className="text-sm text-[#3A3A3A]/70">
                      Manage API keys and integrations
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Generate API Key
                  </Button>
                </div>

                <div className="border rounded-md border-[#550C18]/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#3A3A3A]">
                      Active API Keys
                    </p>
                    <Badge className="bg-green-600">2 Active</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#550C18]/5 rounded-md">
                      <div>
                        <p className="font-medium text-[#3A3A3A]">
                          Website Integration
                        </p>
                        <p className="text-xs text-[#3A3A3A]/70">
                          Created: Jan 15, 2023
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Revoke
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#550C18]/5 rounded-md">
                      <div>
                        <p className="font-medium text-[#3A3A3A]">Mobile App</p>
                        <p className="text-xs text-[#3A3A3A]/70">
                          Created: Mar 10, 2023
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#550C18] hover:bg-[#550C18]/5"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#3A3A3A]">
                    System Information
                  </h3>
                  <Button
                    variant="outline"
                    className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    System Status
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-[#3A3A3A]/70">System Version</p>
                    <p className="font-medium text-[#3A3A3A]">Mizan v1.2.5</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#3A3A3A]/70">Last Updated</p>
                    <p className="font-medium text-[#3A3A3A]">March 20, 2023</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#3A3A3A]/70">Database Size</p>
                    <p className="font-medium text-[#3A3A3A]">245 MB</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#3A3A3A]/70">Storage Used</p>
                    <p className="font-medium text-[#3A3A3A]">1.2 GB / 5 GB</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reset System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
