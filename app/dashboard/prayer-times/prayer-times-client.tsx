"use client"

import { useMemo, useState, useEffect } from "react"
import { RefreshCw, Plus, Settings, Bell, Upload, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { fetchIqamahTimings, fetchPrayerCalculationSettings, fetchPrayerTimings } from "@/lib/actions/prayer-times"
import { PrayerCalculationSettings } from "./prayer-calculation-settings"
import { IqamahTimingsTable } from "./iqamah-timings-table"
import { AddIqamahTimingForm } from "./add-iqamah-timing-form"
import { BulkIqamahTimingForm } from "./bulk-iqamah-timing-form"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MonthlyPrayerTimes } from "./monthly-prayer-times"
import { useRouter, useSearchParams } from "next/navigation"
import type { IqamahTiming, Masjid, PrayerTime } from "@prisma/client"
import { UploadIqamahTimings } from "./upload-iqamah-timings"
import type { PrayerCalculation } from "@/lib/models/iqamah-timings"

export default function PrayerTimesClient() {
  const [autoAdjust, setAutoAdjust] = useState(true)
  const [iqamahTimings, setIqamahTimings] = useState<IqamahTiming[]>([])
  const [calculationSettings, setCalculationSettings] = useState<PrayerCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openBulkDialog, setOpenBulkDialog] = useState(false)
  const { toast } = useToast()
  const [monthlyTimings, setMonthlyTimings] = useState<PrayerTime[]>([])
  const [allPrayerTimings, setAllPrayerTimings] = useState<PrayerTime[]>([])
  const [hasMonthlyTimings, setHasMonthlyTimings] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  )
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loadingMasjid, setLoadingMasjid] = useState(true);
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("iqamah");
  const masjidId = useSearchParams().get("masjidId") || "";
  const router = useRouter();

  useEffect(() => {
    if (!masjidId) {
      setLoadingMasjid(false);
      setLoading(false);
    }
  }, [masjidId]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingMasjid) {
        setLoadingMasjid(false);
        setLoading(false);
        toast({
          title: "Warning",
          description: "Loading took too long. Please refresh the page.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loadingMasjid, toast]);

  useEffect(() => {
    if (!masjidId) return;
    let isMounted = true;
    const controller = new AbortController();

    const fetchMasjid = async () => {
      try {
        const res = await fetch(`/api/masjids?masjidId=${masjidId}`, {
          method: "GET",
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data || (typeof data === "object" && "error" in data)) {
          throw new Error("Failed to load masjid information");
        }
        if (isMounted) setMasjid(data as Masjid);
      } catch (error) {
        if (!isMounted) return;
        toast({
          title: "Error",
          description: "Failed to load masjid information",
          variant: "destructive",
        });
        router.push("/dashboard");
      } finally {
        if (isMounted) setLoadingMasjid(false);
      }
    };

    const loadData = async () => {
      if (!masjidId) return;
      setLoading(true);
      try {
        const [iqamahResult, calculationResult, prayerResults] = await Promise.all([
          fetch(`/api/masjids/${masjidId}/dashboard/iqamah`, { signal: controller.signal }).then((res) => res.json()),
          fetch(`/api/masjids/${masjidId}/dashboard/prayer-calculations`, { signal: controller.signal }).then((res) => res.json()),
          fetch(`/api/masjids/${masjidId}/dashboard/prayer-timings`, { signal: controller.signal }).then((res) => res.json()),
        ]);

        if (iqamahResult?.success && iqamahResult.data) {
          setIqamahTimings(iqamahResult.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load Iqamah timings",
            variant: "destructive",
          });
        }

        if (calculationResult?.success && calculationResult.data) {
          setCalculationSettings(calculationResult.data as PrayerCalculation);
        } else {
          toast({
            title: "Error",
            description: "Failed to load prayer calculation settings",
            variant: "destructive",
          });
        }

        if (prayerResults?.success && prayerResults.data) {
          setAllPrayerTimings(prayerResults.data as PrayerTime[]);
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();
          const currentMonthTimings = (prayerResults.data as PrayerTime[]).filter((timing) => {
            const timingDate = new Date(timing.date);
            return timingDate.getMonth() === month && timingDate.getFullYear() === year;
          });
          setMonthlyTimings(currentMonthTimings);
          setHasMonthlyTimings(currentMonthTimings.length > 0);
        } else {
          toast({
            title: "Error",
            description: "Failed to load Prayer timings",
            variant: "destructive",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMasjid();
    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [masjidId, router, toast]);

  const handleRefresh = async () => {
    setLoading(true)
    try {
        const [iqamahResult, calculationResult, prayerResults] = await Promise.all([
          fetchIqamahTimings(masjidId),
          fetchPrayerCalculationSettings(masjidId),
          fetchPrayerTimings(masjidId),
        ])

        if (iqamahResult.success && iqamahResult.data) {
          setIqamahTimings(iqamahResult.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load Iqamah timings",
            variant: "destructive",
          })
        }

        if (calculationResult.success && calculationResult.data) {
          setCalculationSettings(calculationResult.data as PrayerCalculation)
        } else {
          toast({
            title: "Error",
            description: "Failed to load prayer calculation settings",
            variant: "destructive",
          })
        }

        if (prayerResults.success && prayerResults.data) {
          setAllPrayerTimings(prayerResults.data as PrayerTime[]);
          const now = new Date()
          const month = now.getMonth()
          const year = now.getFullYear()

          const currentMonthTimings = (prayerResults.data as PrayerTime[]).filter((timing) => {
            const timingDate = new Date(timing.date)
            return timingDate.getMonth() === month && timingDate.getFullYear() === year
          })
          setMonthlyTimings(currentMonthTimings)
          setHasMonthlyTimings(currentMonthTimings.length > 0)
        } else {
          toast({
            title: "Error",
            description: "Failed to load Prayer timings",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
  }

  const timezone = useMemo(() => {
    const candidate = masjid?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      Intl.DateTimeFormat("en-US", { timeZone: candidate });
      return candidate;
    } catch {
      return "UTC";
    }
  }, [masjid?.timezone]);

  const nextPrayer = useMemo(() => {
    const source = allPrayerTimings.length ? allPrayerTimings : monthlyTimings;
    if (!source.length) return null;
    const now = new Date();

    const allCandidates = source.flatMap((timing) => [
      { name: "Fajr", date: timing.fajr ? new Date(timing.fajr) : null },
      { name: "Dhuhr", date: timing.dhuhr ? new Date(timing.dhuhr) : null },
      { name: "Asr", date: timing.asr ? new Date(timing.asr) : null },
      { name: "Maghrib", date: timing.maghrib ? new Date(timing.maghrib) : null },
      { name: "Isha", date: timing.isha ? new Date(timing.isha) : null },
    ]);

    const upcoming = allCandidates
      .filter((candidate): candidate is { name: string; date: Date } => Boolean(candidate.date))
      .filter((candidate) => candidate.date.getTime() > now.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return upcoming[0] ?? null;
  }, [allPrayerTimings, monthlyTimings]);

  const latestIqamah = useMemo(() => {
    if (!iqamahTimings.length) return null;
    const sorted = [...iqamahTimings].sort(
      (a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()
    );
    return sorted[0];
  }, [iqamahTimings]);

  if(loadingMasjid) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
        <p className="mt-4 text-[#550C18]">Loading masjid information...</p>
        <p className="mt-2 text-[#3A3A3A]/70 text-sm">masjidId: {masjidId || 'Not provided'}</p>
      </div>
    </div>
  );

  if(!masjidId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-[#550C18] text-lg">No masjid ID provided</p>
          <p className="text-[#3A3A3A]/70 mt-2">Please select a masjid from the dashboard</p>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="mt-4 bg-[#550C18] hover:bg-[#78001A] text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if(!masjid) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-[#550C18] text-lg">Masjid not found</p>
          <p className="text-[#3A3A3A]/70 mt-2">The masjid with ID "{masjidId}" could not be found</p>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="mt-4 bg-[#550C18] hover:bg-[#78001A] text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#550C18]/10 bg-gradient-to-br from-[#fff5f5] via-white to-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#550C18]/60">
              Prayer Times
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2e0c12] mt-2">
              Keep salah and iqamah perfectly aligned.
            </h1>
            <p className="text-[#3A3A3A]/70 mt-2 max-w-xl">
              Manage iqamah schedules, calculation settings, and publish monthly prayer times in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Button
              variant="outline"
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>
            <Button
              className="bg-[#550C18] hover:bg-[#78001A] text-white"
              onClick={() => {
                setActiveTab("iqamah");
                setOpenAddDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Iqamah
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-[#3A3A3A]/70">
              <span>Next Prayer</span>
              <Clock className="h-4 w-4 text-[#550C18]" />
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              {nextPrayer ? nextPrayer.name : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#3A3A3A]/70">
            {nextPrayer
              ? nextPrayer.date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: timezone,
                })
              : "No upcoming prayers today."}
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-[#3A3A3A]/70">
              <span>Active Iqamah Schedule</span>
              <Bell className="h-4 w-4 text-[#550C18]" />
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              {latestIqamah ? new Date(latestIqamah.changeDate).toLocaleDateString() : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#3A3A3A]/70">
            {latestIqamah ? "Currently applied to displays" : "Add your first iqamah schedule."}
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-[#3A3A3A]/70">
              <span>Timezone</span>
              <Calendar className="h-4 w-4 text-[#550C18]" />
            </CardDescription>
            <CardTitle className="text-2xl text-[#2e0c12]">
              {timezone}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#3A3A3A]/70">
            Current time:{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: timezone,
            })}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-full bg-[#550C18]/10 p-1">
          <TabsTrigger value="iqamah" className="flex items-center gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
            <Bell className="h-4 w-4" />
            Iqamah Timings
          </TabsTrigger>
          <TabsTrigger value="calculation" className="flex items-center gap-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
            <Settings className="h-4 w-4" />
            Salah Calculation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iqamah" className="space-y-6">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#2e0c12]">Iqamah Timings</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">
                    Create and manage schedules for each prayer.
                  </CardDescription>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogTitle></DialogTitle>
                      <UploadIqamahTimings
                        masjidId={masjidId}
                        onSuccess={() => {
                          setOpenUploadDialog(false)
                          handleRefresh()
                        }}
                        onCancel={() => setOpenUploadDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Bulk Create
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogTitle></DialogTitle>
                      <BulkIqamahTimingForm
                        masjidId={masjidId}
                        onSuccess={() => {
                          setOpenBulkDialog(false)
                          handleRefresh()
                        }}
                        onCancel={() => setOpenBulkDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Iqamah Timing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-xl">
                      <DialogTitle></DialogTitle>
                      <AddIqamahTimingForm
                        masjidId={masjidId}
                        lastIqamah={latestIqamah}
                        onSuccess={() => {
                          setOpenAddDialog(false)
                          handleRefresh()
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <IqamahTimingsTable timings={iqamahTimings} loading={loading} onRefresh={handleRefresh} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculation" className="space-y-6">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#2e0c12] flex flex-row gap-1 items-center">
                    Prayer Calculation Settings
                    {calculationSettings?.updatedAt && (
                      <p className="text-gray-500 font-bold text-sm mt-1">
                        {(() => {
                          const date = new Date(calculationSettings.updatedAt);
                          if (isNaN(date.getTime())) return "";
                          return `- Updated at ${new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(date)}`;
                        })()}
                      </p>
                    )}
                  </CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">
                    Configure how prayer times are calculated.
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-adjust" checked={autoAdjust} onCheckedChange={setAutoAdjust} />
                  <label htmlFor="auto-adjust" className="text-sm text-[#3A3A3A]">
                    Auto-adjust for DST
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {calculationSettings && (
                <PrayerCalculationSettings
                  initialData={calculationSettings}
                  masjidId={masjidId}
                  onSuccess={handleRefresh}
                />
              )}
            </CardContent>
          </Card>

          <MonthlyPrayerTimes
            masjidId={masjidId}
            hasMonthlyTimings={hasMonthlyTimings}
            monthlyTimings={monthlyTimings || []}
            setMonthlyTimings={setMonthlyTimings}
            masjid={masjid}
            currentMonth={currentMonth}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
