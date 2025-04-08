"use client";

import { useState } from "react";
import {
  Download,
  DollarSign,
  Filter,
  Search,
  ArrowUpDown,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DonationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const donations = [
    {
      id: 1,
      name: "Ahmed Hassan",
      amount: 100.0,
      date: "2023-04-15",
      time: "10:30 AM",
      type: "General Fund",
      status: "completed",
      email: "ahmed.h@example.com",
    },
    {
      id: 2,
      name: "Sarah Ali",
      amount: 250.0,
      date: "2023-04-14",
      time: "3:45 PM",
      type: "Zakat",
      status: "completed",
      email: "sarah.a@example.com",
    },
    {
      id: 3,
      name: "Mohammed Khan",
      amount: 500.0,
      date: "2023-04-14",
      time: "1:20 PM",
      type: "Building Fund",
      status: "completed",
      email: "m.khan@example.com",
    },
    {
      id: 4,
      name: "Fatima Qureshi",
      amount: 150.0,
      date: "2023-04-13",
      time: "9:15 AM",
      type: "Education",
      status: "completed",
      email: "fatima.q@example.com",
    },
    {
      id: 5,
      name: "Yusuf Abdullah",
      amount: 75.0,
      date: "2023-04-13",
      time: "5:30 PM",
      type: "General Fund",
      status: "completed",
      email: "yusuf.a@example.com",
    },
  ];

  const filteredDonations = donations.filter(
    (donation) =>
      donation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Donations</h2>
          <p className="text-[#3A3A3A]/70">
            Track and manage donations for your masjid
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
            <DollarSign className="mr-2 h-4 w-4" />
            New Donation
          </Button>
          <Button
            variant="outline"
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              General Fund
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">$4,250.00</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">43% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Building Fund
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">$3,500.00</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">35% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Zakat
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              This month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">$2,154.00</div>
            <p className="text-xs text-[#3A3A3A]/70 mt-1">22% of total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Donation Overview
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                Monthly breakdown by category
              </CardDescription>
            </div>
          </div>
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
                      43%
                    </span>
                  </div>
                  <Progress value={43} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      Building Fund
                    </span>
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      35%
                    </span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      Zakat
                    </span>
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      22%
                    </span>
                  </div>
                  <Progress value={22} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      Education
                    </span>
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      15%
                    </span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      Sadaqah
                    </span>
                    <span className="text-sm font-medium text-[#3A3A3A]">
                      10%
                    </span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#550C18]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">
                Recent Donations
              </CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">
                View and manage donation transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A3A3A]/50" />
                <Input
                  placeholder="Search donations..."
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
              <TabsTrigger value="general">General Fund</TabsTrigger>
              <TabsTrigger value="building">Building Fund</TabsTrigger>
              <TabsTrigger value="zakat">Zakat</TabsTrigger>
            </TabsList>
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 bg-muted/50 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span>Donor</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Type</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Amount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </div>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="grid grid-cols-5 p-4 border-t hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#550C18]/10 text-[#550C18] text-xs">
                          {donation.name.split(" ")[0]?.charAt(0) +
                            donation.name.split(" ")[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#3A3A3A]">
                          {donation.name}
                        </p>
                        <p className="text-xs text-[#3A3A3A]/70">
                          {donation.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        className={
                          donation.type === "General Fund"
                            ? "bg-blue-500"
                            : donation.type === "Building Fund"
                            ? "bg-green-500"
                            : donation.type === "Zakat"
                            ? "bg-purple-500"
                            : donation.type === "Education"
                            ? "bg-orange-500"
                            : "bg-gray-500"
                        }
                      >
                        {donation.type}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-[#3A3A3A]">
                        {donation.date}, {donation.time}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-[#550C18]">
                        ${donation.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-500"
                      >
                        {donation.status.charAt(0).toUpperCase() +
                          donation.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border-t">
                  <DollarSign className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                  <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">
                    No donations found
                  </h3>
                  <p className="text-[#3A3A3A]/70 mb-4">
                    No donations match your search criteria. Try adjusting your
                    search.
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
