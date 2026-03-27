"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CalendarIcon, Loader2, Monitor, HandCoins, Store } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type AnalyticsResponse = {
  success: boolean;
  data?: {
    website: {
      hasWebsite: boolean;
      websiteUrl: string;
      websiteProducts: number;
    };
    donations: {
      totalAmount: number;
      totalCount: number;
      averageAmount: number;
      byCategory: { categoryId: string; name: string; amount: number; count: number }[];
      kioskAmount: number;
      kioskCount: number;
      onlineAmount: number;
      onlineCount: number;
    };
    kiosk: {
      hasKiosk: boolean;
      totalKiosks: number;
      activeKiosks: number;
      inactiveKiosks: number;
      topKiosks: { id: string; name: string; location: string; amount: number; count: number }[];
    };
    pageAnalytics: {
      eventsCreated: number;
      announcementsCreated: number;
      contentItems: number;
      totalDisplays: number;
      activeDisplays: number;
    };
  };
  error?: string;
};

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const [date, setDate] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse["data"] | null>(null);

  const fetchAnalytics = async () => {
    if (!masjidId) {
      setLoading(false);
      setAnalytics(null);
      setError("No masjid selected.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const from = date.from.toISOString();
      const to = date.to.toISOString();
      const res = await fetch(
        `/api/masjids/${masjidId}/dashboard/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const data: AnalyticsResponse = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || "Failed to load analytics");
      }
      setAnalytics(data.data);
    } catch (err) {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [masjidId, date.from, date.to]);

  const donationCategoryTotal = useMemo(
    () => analytics?.donations.byCategory.reduce((sum, c) => sum + c.amount, 0) ?? 0,
    [analytics]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Analytics
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Track growth across donations, events, and engagement.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Measure the impact of your masjid programs and campaigns over time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <Button variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5" onClick={fetchAnalytics}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Visitors
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Selected range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {analytics?.donations.totalCount ?? 0}
            </div>
            <div className="text-xs text-[#3A3A3A]/70 mt-1">Completed donations</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Total Donations
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Selected range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              ${(analytics?.donations.totalAmount ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#3A3A3A]/70 mt-1">Total donation volume</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              Event Attendance
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Selected range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              ${(analytics?.donations.averageAmount ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#3A3A3A]/70 mt-1">Average donation</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#550C18]/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#3A3A3A]">
              New Members
            </CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Kiosk status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#550C18]">
              {analytics?.kiosk.totalKiosks ?? 0}
            </div>
            <div className="text-xs text-[#3A3A3A]/70 mt-1">
              {analytics?.kiosk.activeKiosks ?? 0} active kiosks
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 rounded-full bg-[#550C18]/10 p-1">
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="page">Page Analytics</TabsTrigger>
          <TabsTrigger value="kiosk">Kiosk Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#550C18]/10 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Donation Categories</CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">Real donations by category for selected date range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analytics?.donations.byCategory ?? []).map((cat) => {
                    const pct = donationCategoryTotal > 0 ? Math.round((cat.amount / donationCategoryTotal) * 100) : 0;
                    return (
                      <div key={cat.categoryId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#3A3A3A]">{cat.name}</span>
                          <span className="text-sm text-[#3A3A3A]/70">
                            ${cat.amount.toLocaleString()} ({cat.count})
                          </span>
                        </div>
                        <Progress value={pct} className="h-2 bg-[#550C18]/5" />
                      </div>
                    );
                  })}
                  {analytics && analytics.donations.byCategory.length === 0 ? (
                    <p className="text-sm text-[#3A3A3A]/70">No donations found in this date range.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#550C18]/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Donation Channels</CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">Kiosk vs online</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">Kiosk</span>
                      <span className="text-sm font-medium text-[#3A3A3A]">${(analytics?.donations.kioskAmount ?? 0).toLocaleString()}</span>
                    </div>
                    <Progress value={analytics?.donations.totalAmount ? Math.round(((analytics.donations.kioskAmount ?? 0) / analytics.donations.totalAmount) * 100) : 0} className="h-2 bg-[#550C18]/5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#3A3A3A]">Online</span>
                      <span className="text-sm font-medium text-[#3A3A3A]">${(analytics?.donations.onlineAmount ?? 0).toLocaleString()}</span>
                    </div>
                    <Progress value={analytics?.donations.totalAmount ? Math.round(((analytics.donations.onlineAmount ?? 0) / analytics.donations.totalAmount) * 100) : 0} className="h-2 bg-[#550C18]/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="page">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#550C18]/10 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Page Analytics</CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">Real activity from your masjid records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#550C18]/10 p-4">
                    <p className="text-sm text-[#3A3A3A]/70">Events Created</p>
                    <p className="text-2xl font-semibold text-[#2e0c12]">{analytics?.pageAnalytics.eventsCreated ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-[#550C18]/10 p-4">
                    <p className="text-sm text-[#3A3A3A]/70">Announcements</p>
                    <p className="text-2xl font-semibold text-[#2e0c12]">{analytics?.pageAnalytics.announcementsCreated ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-[#550C18]/10 p-4">
                    <p className="text-sm text-[#3A3A3A]/70">Content Items</p>
                    <p className="text-2xl font-semibold text-[#2e0c12]">{analytics?.pageAnalytics.contentItems ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-[#550C18]/10 p-4">
                    <p className="text-sm text-[#3A3A3A]/70">Displays Online</p>
                    <p className="text-2xl font-semibold text-[#2e0c12]">
                      {analytics?.pageAnalytics.activeDisplays ?? 0}/{analytics?.pageAnalytics.totalDisplays ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#550C18]/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Source</CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">Only website source is shown when available</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.website.hasWebsite ? (
                  <div className="rounded-xl border border-[#550C18]/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[#2e0c12] font-medium">
                      <Monitor className="h-4 w-4" />
                      Website
                    </div>
                    <p className="text-sm text-[#3A3A3A]/70 break-all">
                      {analytics.website.websiteUrl || "Website product active through Mizan"}
                    </p>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                ) : (
                  <p className="text-sm text-[#3A3A3A]/70">No website analytics available for this masjid.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kiosk">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#550C18]/10 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Kiosk Performance</CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">Real donation activity from kiosks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-xl border border-[#550C18]/10 p-4">
                    <p className="text-sm text-[#3A3A3A]/70">Kiosk Donations</p>
                    <p className="text-2xl font-semibold text-[#2e0c12]">${(analytics?.donations.kioskAmount ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-[#550C18]/10 p-4">
                    <p className="text-sm text-[#3A3A3A]/70">Kiosk Transactions</p>
                    <p className="text-2xl font-semibold text-[#2e0c12]">{analytics?.donations.kioskCount ?? 0}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {(analytics?.kiosk.topKiosks ?? []).map((kiosk) => (
                    <div key={kiosk.id} className="flex items-center justify-between p-3 border border-[#550C18]/10 rounded-lg">
                      <div>
                        <p className="font-medium text-[#3A3A3A]">{kiosk.name}</p>
                        <p className="text-xs text-[#3A3A3A]/70">{kiosk.location || "No location set"}</p>
                      </div>
                      <Badge className="bg-[#550C18]">
                        ${kiosk.amount.toLocaleString()} ({kiosk.count})
                      </Badge>
                    </div>
                  ))}
                  {analytics && analytics.kiosk.topKiosks.length === 0 ? (
                    <p className="text-sm text-[#3A3A3A]/70">No kiosk donations in selected date range.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#550C18]/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Kiosk Status</CardTitle>
                <CardDescription className="text-[#3A3A3A]/70">Installed kiosks for this masjid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#550C18]/10 p-4 flex items-center justify-between">
                    <span className="text-sm text-[#3A3A3A]/70">Total kiosks</span>
                    <Badge variant="secondary">{analytics?.kiosk.totalKiosks ?? 0}</Badge>
                  </div>
                  <div className="rounded-xl border border-[#550C18]/10 p-4 flex items-center justify-between">
                    <span className="text-sm text-[#3A3A3A]/70">Active kiosks</span>
                    <Badge className="bg-green-600">{analytics?.kiosk.activeKiosks ?? 0}</Badge>
                  </div>
                  <div className="rounded-xl border border-[#550C18]/10 p-4 flex items-center justify-between">
                    <span className="text-sm text-[#3A3A3A]/70">Inactive kiosks</span>
                    <Badge variant="outline">{analytics?.kiosk.inactiveKiosks ?? 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
