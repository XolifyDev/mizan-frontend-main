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
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Download, Filter, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const [date, setDate] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Analytics</h2>
          <p className="text-[#3A3A3A]/70">
            View insights and statistics for your masjid
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date.from}
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate?.from && selectedDate?.to) {
                    setDate({ from: selectedDate.from, to: selectedDate.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Visitors
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">2,845</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                  clipRule="evenodd"
                />
              </svg>
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Donations
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">$9,904</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                  clipRule="evenodd"
                />
              </svg>
              +5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Event Attendance
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">1,245</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                  clipRule="evenodd"
                />
              </svg>
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              New Members
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">32</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                  clipRule="evenodd"
                />
              </svg>
              +15% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                      Monthly Overview
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                      Key metrics for the past 30 days
                    </CardDescription>
                  </div>
                  <Select defaultValue="visitors">
                    <SelectTrigger className="w-[180px] border-[#550C18]/20">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitors">Visitors</SelectItem>
                      <SelectItem value="donations">Donations</SelectItem>
                      <SelectItem value="events">Event Attendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col">
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-full bg-[#550C18]/10 rounded-t-md"
                          style={{
                            height: `${Math.max(20, Math.random() * 100)}%`,
                          }}
                        ></div>
                        <span className="text-xs text-[#3A3A3A]/70 mt-1">
                          {format(subDays(new Date(), 6 - i), "EEE")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Avg. Daily
                      </span>
                      <span className="text-lg font-medium text-[#3A3A3A]">
                        95
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Peak Day
                      </span>
                      <span className="text-lg font-medium text-[#3A3A3A]">
                        Friday
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">Growth</span>
                      <span className="text-lg font-medium text-green-600">
                        +12%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  Top Sources
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  How people find your masjid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Website
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        45%
                      </span>
                    </div>
                    <Progress value={45} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Social Media
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        30%
                      </span>
                    </div>
                    <Progress value={30} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Word of Mouth
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        15%
                      </span>
                    </div>
                    <Progress value={15} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Community Events
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        10%
                      </span>
                    </div>
                    <Progress value={10} className="h-2 bg-[#550C18]/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                      Donation Trends
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                      Monthly donation patterns
                    </CardDescription>
                  </div>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="w-[180px] border-[#550C18]/20">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col">
                  <div className="flex-1 grid grid-cols-12 gap-2 items-end">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center h-full"
                      >
                        <div
                          className="w-full bg-[#550C18]/10 rounded-t-md"
                          style={{
                            height: `${Math.max(20, Math.random() * 100)}%`,
                          }}
                        ></div>
                        <span className="text-xs text-[#3A3A3A]/70 mt-1">
                          {format(new Date(2023, i, 1), "MMM")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Total YTD
                      </span>
                      <span className="text-lg font-medium text-[#3A3A3A]">
                        $124,500
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Avg. Donation
                      </span>
                      <span className="text-lg font-medium text-[#3A3A3A]">
                        $85
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">Growth</span>
                      <span className="text-lg font-medium text-green-600">
                        +8%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  Donation Categories
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  Breakdown by purpose
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        General Fund
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        45%
                      </span>
                    </div>
                    <Progress value={45} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Zakat
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        25%
                      </span>
                    </div>
                    <Progress value={25} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Building Fund
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        20%
                      </span>
                    </div>
                    <Progress value={20} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Education
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        10%
                      </span>
                    </div>
                    <Progress value={10} className="h-2 bg-[#550C18]/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                      Prayer Attendance
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                      Daily prayer attendance patterns
                    </CardDescription>
                  </div>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-[180px] border-[#550C18]/20">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <div className="grid grid-cols-5 gap-4 h-full">
                    {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map(
                      (prayer, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="flex-1 w-full flex items-end">
                            <div
                              className="w-full bg-[#550C18]/10 rounded-t-md"
                              style={{
                                height: `${Math.max(
                                  30,
                                  50 + Math.random() * 50
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-[#3A3A3A] mt-2">
                            {prayer}
                          </span>
                          <span className="text-xs text-[#3A3A3A]/70">
                            {Math.floor(50 + Math.random() * 150)} people
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  Event Attendance
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  Recent events by attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-[#550C18]/10 rounded-lg">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Friday Prayer
                      </p>
                      <p className="text-xs text-[#3A3A3A]/70">Last Friday</p>
                    </div>
                    <Badge className="bg-[#550C18]">450 people</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#550C18]/10 rounded-lg">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">Quran Study</p>
                      <p className="text-xs text-[#3A3A3A]/70">Saturday</p>
                    </div>
                    <Badge className="bg-[#550C18]">85 people</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#550C18]/10 rounded-lg">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Community Iftar
                      </p>
                      <p className="text-xs text-[#3A3A3A]/70">Sunday</p>
                    </div>
                    <Badge className="bg-[#550C18]">210 people</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-[#550C18]/10 rounded-lg">
                    <div>
                      <p className="font-medium text-[#3A3A3A]">
                        Youth Program
                      </p>
                      <p className="text-xs text-[#3A3A3A]/70">Monday</p>
                    </div>
                    <Badge className="bg-[#550C18]">65 people</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                      User Engagement
                    </CardTitle>
                    <CardDescription className="text-[#3A3A3A]/70">
                      App and website usage metrics
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#550C18]/20"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex flex-col">
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-full bg-[#550C18]/10 rounded-t-md"
                          style={{
                            height: `${Math.max(20, Math.random() * 100)}%`,
                          }}
                        ></div>
                        <span className="text-xs text-[#3A3A3A]/70 mt-1">
                          {format(subDays(new Date(), 6 - i), "EEE")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Active Users
                      </span>
                      <span className="text-lg font-medium text-[#3A3A3A]">
                        1,245
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Avg. Session
                      </span>
                      <span className="text-lg font-medium text-[#3A3A3A]">
                        4m 32s
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#3A3A3A]/70">
                        Retention
                      </span>
                      <span className="text-lg font-medium text-green-600">
                        78%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  Top Features
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  Most used app features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Prayer Times
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        65%
                      </span>
                    </div>
                    <Progress value={65} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Events Calendar
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        45%
                      </span>
                    </div>
                    <Progress value={45} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Donations
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        35%
                      </span>
                    </div>
                    <Progress value={35} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Announcements
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        25%
                      </span>
                    </div>
                    <Progress value={25} className="h-2 bg-[#550C18]/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                User Demographics
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Insights about your community members
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            >
              <Users className="mr-2 h-4 w-4" />
              View All Users
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-[#3A3A3A] mb-4">
                Age Distribution
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">Under 18</span>
                    <span className="text-sm text-[#3A3A3A]/70">15%</span>
                  </div>
                  <Progress value={15} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">18-34</span>
                    <span className="text-sm text-[#3A3A3A]/70">35%</span>
                  </div>
                  <Progress value={35} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">35-54</span>
                    <span className="text-sm text-[#3A3A3A]/70">30%</span>
                  </div>
                  <Progress value={30} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">55+</span>
                    <span className="text-sm text-[#3A3A3A]/70">20%</span>
                  </div>
                  <Progress value={20} className="h-2 bg-[#550C18]/5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-[#3A3A3A] mb-4">
                Gender Distribution
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">Male</span>
                    <span className="text-sm text-[#3A3A3A]/70">55%</span>
                  </div>
                  <Progress value={55} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">Female</span>
                    <span className="text-sm text-[#3A3A3A]/70">45%</span>
                  </div>
                  <Progress value={45} className="h-2 bg-[#550C18]/5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-[#3A3A3A] mb-4">
                Membership Duration
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">
                      {"< 1 year"}
                    </span>
                    <span className="text-sm text-[#3A3A3A]/70">25%</span>
                  </div>
                  <Progress value={25} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">1-3 years</span>
                    <span className="text-sm text-[#3A3A3A]/70">35%</span>
                  </div>
                  <Progress value={35} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">3-5 years</span>
                    <span className="text-sm text-[#3A3A3A]/70">20%</span>
                  </div>
                  <Progress value={20} className="h-2 bg-[#550C18]/5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#3A3A3A]/70">5+ years</span>
                    <span className="text-sm text-[#3A3A3A]/70">20%</span>
                  </div>
                  <Progress value={20} className="h-2 bg-[#550C18]/5" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
