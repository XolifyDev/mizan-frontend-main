"use client";

import { useState } from "react";
import { Clock, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function PrayerTimesPage() {
  const [autoAdjust, setAutoAdjust] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Prayer Times</h2>
          <p className="text-[#3A3A3A]/70">
            Manage prayer and iqamah times for your masjid
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Prayer Time Settings
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Configure how prayer times are calculated
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-adjust"
                checked={autoAdjust}
                onCheckedChange={setAutoAdjust}
              />
              <Label htmlFor="auto-adjust">Auto-adjust for DST</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="daily">Daily Times</TabsTrigger>
              <TabsTrigger value="jumuah">Jumuah</TabsTrigger>
              <TabsTrigger value="settings">Calculation Method</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => (
                  <div
                    key={prayer}
                    className="border border-[#550C18]/10 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                        <Clock className="h-4 w-4" />
                      </div>
                      <h3 className="font-medium text-[#3A3A3A] text-lg">
                        {prayer}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${prayer.toLowerCase()}-adhan`}>
                          Adhan Time
                        </Label>
                        <Input
                          id={`${prayer.toLowerCase()}-adhan`}
                          type="time"
                          className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                          defaultValue={
                            prayer === "Fajr"
                              ? "06:07"
                              : prayer === "Dhuhr"
                              ? "13:42"
                              : prayer === "Asr"
                              ? "17:12"
                              : prayer === "Maghrib"
                              ? "19:58"
                              : "21:17"
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${prayer.toLowerCase()}-iqamah`}>
                          Iqamah Time
                        </Label>
                        <Input
                          id={`${prayer.toLowerCase()}-iqamah`}
                          type="time"
                          className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                          defaultValue={
                            prayer === "Fajr"
                              ? "06:27"
                              : prayer === "Dhuhr"
                              ? "14:00"
                              : prayer === "Asr"
                              ? "18:45"
                              : prayer === "Maghrib"
                              ? "20:03"
                              : "21:50"
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="jumuah" className="space-y-6">
              <div className="border border-[#550C18]/10 rounded-lg p-4">
                <h3 className="font-medium text-[#3A3A3A] text-lg mb-4">
                  Jumuah Prayer Times
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jumuah-1">First Jumuah</Label>
                    <Input
                      id="jumuah-1"
                      type="time"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      defaultValue="14:10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumuah-2">Second Jumuah</Label>
                    <Input
                      id="jumuah-2"
                      type="time"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      defaultValue="15:00"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-6">
              <div className="border border-[#550C18]/10 rounded-lg p-4">
                <h3 className="font-medium text-[#3A3A3A] text-lg mb-4">
                  Calculation Method
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calculation-method">Method</Label>
                    <select
                      id="calculation-method"
                      className="w-full rounded-md border border-[#550C18]/20 bg-white px-3 py-2 text-sm focus:border-[#550C18] focus:outline-none focus:ring-1 focus:ring-[#550C18]"
                      defaultValue="ISNA"
                    >
                      <option value="MWL">Muslim World League</option>
                      <option value="ISNA">
                        Islamic Society of North America
                      </option>
                      <option value="Egypt">
                        Egyptian General Authority of Survey
                      </option>
                      <option value="Makkah">
                        Umm al-Qura University, Makkah
                      </option>
                      <option value="Karachi">
                        University of Islamic Sciences, Karachi
                      </option>
                      <option value="Custom">Custom Settings</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter your city or address"
                      className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      defaultValue="New York, NY"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
            Monthly View
          </CardTitle>
          <CardDescription className="text-[#3A3A3A]/70">
            Preview prayer times for the entire month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Clock className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
            <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
              Monthly Calendar View
            </h3>
            <p className="text-[#3A3A3A]/70 mb-4">
              View and export prayer times for the entire month
            </p>
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
              Generate Monthly Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
