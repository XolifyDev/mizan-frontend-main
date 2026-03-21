"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  MessageSquare,
  Monitor,
  PlusCircle,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#550C18]">Welcome back!</h2>
            <p className="text-[#3A3A3A]/70">
              What would you like to do today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Content
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Today's Prayer Times
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Wednesday, Mar 26 | Ramadan 26, 1446
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                      <span className="text-xs">☀️</span>
                    </div>
                    <span className="font-medium text-[#3A3A3A]">Fajr</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#3A3A3A]">06:07 AM</span>
                    <span className="text-sm font-medium text-[#550C18]">
                      06:27 AM
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                      <span className="text-xs">☀️</span>
                    </div>
                    <span className="font-medium text-[#3A3A3A]">Dhuhr</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#3A3A3A]">01:42 PM</span>
                    <span className="text-sm font-medium text-[#550C18]">
                      02:00 PM
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                      <span className="text-xs">☀️</span>
                    </div>
                    <span className="font-medium text-[#3A3A3A]">Asr</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#3A3A3A]">05:12 PM</span>
                    <span className="text-sm font-medium text-[#550C18]">
                      06:45 PM
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                      <span className="text-xs">☀️</span>
                    </div>
                    <span className="font-medium text-[#3A3A3A]">Maghrib</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#3A3A3A]">07:58 PM</span>
                    <span className="text-sm font-medium text-[#550C18]">
                      08:03 PM
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#550C18]/10 flex items-center justify-center text-[#550C18]">
                      <span className="text-xs">☀️</span>
                    </div>
                    <span className="font-medium text-[#3A3A3A]">Isha</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#3A3A3A]">09:17 PM</span>
                    <span className="text-sm font-medium text-[#550C18]">
                      09:50 PM
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#550C18]/10 text-center">
                <p className="text-xs text-[#3A3A3A]/70">
                  JUMU'AH-1: 02:10 PM / JUMU'AH-2: 03:00 PM
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Manage your masjid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-[#550C18]/20 hover:bg-[#550C18]/5 hover:text-[#550C18]"
                  asChild
                >
                  <Link href="/dashboard/prayer-times">
                    <Clock className="h-6 w-6 text-[#550C18]" />
                    <span className="text-sm">Manage Iqamah Times</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-[#550C18]/20 hover:bg-[#550C18]/5 hover:text-[#550C18]"
                  asChild
                >
                  <Link href="/dashboard/tv-displays">
                    <Monitor className="h-6 w-6 text-[#550C18]" />
                    <span className="text-sm">Display New Content</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-[#550C18]/20 hover:bg-[#550C18]/5 hover:text-[#550C18]"
                  asChild
                >
                  <Link href="/dashboard/announcements">
                    <MessageSquare className="h-6 w-6 text-[#550C18]" />
                    <span className="text-sm">Add Announcement</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-[#550C18]/20 hover:bg-[#550C18]/5 hover:text-[#550C18]"
                  asChild
                >
                  <Link href="/dashboard/events">
                    <Calendar className="h-6 w-6 text-[#550C18]" />
                    <span className="text-sm">View Monthly Schedule</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-3xl font-bold text-[#550C18]">$9,904.00</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              57 donations received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Active Users
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">1,245</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">+5% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Events
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Upcoming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">8</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">
              Next: Friday Prayer
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Prayer Times
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">5</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">Next: Asr 4:30 PM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-3">
        <Card className="bg-white border-[#550C18]/10 col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
              Donation Overview
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Monthly breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        General Fund
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        65%
                      </span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Zakat
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        45%
                      </span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Building Fund
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        80%
                      </span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        Education
                      </span>
                      <span className="text-sm font-medium text-[#3A3A3A]">
                        30%
                      </span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 md:row-span-2 md:col-span-1 col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
              Upcoming Events
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-[#550C18]/10">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                  <span className="text-xs font-medium">FRI</span>
                  <span className="text-lg font-bold">15</span>
                </div>
                <div>
                  <p className="font-medium text-[#3A3A3A]">Friday Prayer</p>
                  <p className="text-sm text-[#3A3A3A]/70">1:30 PM - 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-[#550C18]/10">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                  <span className="text-xs font-medium">SAT</span>
                  <span className="text-lg font-bold">16</span>
                </div>
                <div>
                  <p className="font-medium text-[#3A3A3A]">Quran Study</p>
                  <p className="text-sm text-[#3A3A3A]/70">
                    10:00 AM - 12:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-[#550C18]/10">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                  <span className="text-xs font-medium">SUN</span>
                  <span className="text-lg font-bold">17</span>
                </div>
                <div>
                  <p className="font-medium text-[#3A3A3A]">Community Iftar</p>
                  <p className="text-sm text-[#3A3A3A]/70">7:30 PM - 9:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-[#550C18]/10 text-[#550C18]">
                  <span className="text-xs font-medium">MON</span>
                  <span className="text-lg font-bold">18</span>
                </div>
                <div>
                  <p className="font-medium text-[#3A3A3A]">Youth Program</p>
                  <p className="text-sm text-[#3A3A3A]/70">6:00 PM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
              Recent Donations
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Last 5 transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                      AH
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#3A3A3A]">
                      Ahmed Hassan
                    </p>
                    <p className="text-xs text-[#3A3A3A]/70">General Fund</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#550C18]">$100.00</p>
                  <p className="text-xs text-[#3A3A3A]/70">Today, 10:30 AM</p>
                </div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                      SA
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#3A3A3A]">
                      Sarah Ali
                    </p>
                    <p className="text-xs text-[#3A3A3A]/70">Zakat</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#550C18]">$250.00</p>
                  <p className="text-xs text-[#3A3A3A]/70">
                    Yesterday, 3:45 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                      MK
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#3A3A3A]">
                      Mohammed Khan
                    </p>
                    <p className="text-xs text-[#3A3A3A]/70">Building Fund</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#550C18]">$500.00</p>
                  <p className="text-xs text-[#3A3A3A]/70">
                    Yesterday, 1:20 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#550C18]/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                      FQ
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#3A3A3A]">
                      Fatima Qureshi
                    </p>
                    <p className="text-xs text-[#3A3A3A]/70">Education</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#550C18]">$150.00</p>
                  <p className="text-xs text-[#3A3A3A]/70">
                    2 days ago, 9:15 AM
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                      YA
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#3A3A3A]">
                      Yusuf Abdullah
                    </p>
                    <p className="text-xs text-[#3A3A3A]/70">General Fund</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#550C18]">$75.00</p>
                  <p className="text-xs text-[#3A3A3A]/70">
                    2 days ago, 5:30 PM
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-3">
        <Card className="bg-white border-[#550C18]/10 col-span-full hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                  Device Status
                </CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">
                  Monitor your kiosks and displays
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
                <Button
                  size="sm"
                  className="bg-[#550C18] hover:bg-[#78001A] text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-[#550C18]/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[#3A3A3A] text-xl">
                    Men Lobby - Left
                  </h3>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-[#3A3A3A]/70 mb-3">
                  Last updated: 5 minutes ago
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border border-[#550C18]/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[#3A3A3A] text-xl">
                    Sisters Side
                  </h3>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-[#3A3A3A]/70 mb-3">
                  Last updated: 10 minutes ago
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border border-[#550C18]/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[#3A3A3A] text-xl">
                    Kiosk 3
                  </h3>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    Checking
                  </Badge>
                </div>
                <p className="text-sm text-[#3A3A3A]/70 mb-3">
                  Last updated: 2 hours ago
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
