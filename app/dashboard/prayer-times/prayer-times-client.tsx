"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Plus, Settings, Bell, Upload } from "lucide-react"
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
import { getUserMasjid } from "@/lib/actions/masjid"
import { Masjid } from "@prisma/client"
import { UploadIqamahTimings } from "./upload-iqamah-timings"

export default function PrayerTimesClient() {
  const [autoAdjust, setAutoAdjust] = useState(true)
  const [iqamahTimings, setIqamahTimings] = useState<Array<any>>([])
  const [calculationSettings, setCalculationSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openBulkDialog, setOpenBulkDialog] = useState(false)
  const { toast } = useToast()
  const [monthlyTimings, setMonthlyTimings] = useState<Array<any>>([])
  const [hasMonthlyTimings, setHasMonthlyTimings] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  )
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loadingMasjid, setLoadingMasjid] = useState(true);
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const masjidId = useSearchParams().get("masjidId") || "";
  const router = useRouter();

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingMasjid) {
        console.log('Loading timeout reached, forcing loading to stop');
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
    const fetchMasjid = async () => {
      try {
        const userMasjid = await fetch(`/api/masjids?masjidId=${masjidId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(res => res.json());
        if (!userMasjid || (typeof userMasjid === 'object' && 'error' in userMasjid)) {
          toast({
            title: "Error",
            description: "Failed to load masjid information",
            variant: "destructive",
          });
          return router.push("/dashboard");
        }
        setMasjid(userMasjid as Masjid);
        return userMasjid;
      } catch (error) {
        console.error('Error fetching masjid:', error);
        toast({
          title: "Error",
          description: "Failed to load masjid information",
          variant: "destructive",
        });
        return router.push("/dashboard");
      } finally {
        setLoadingMasjid(false);
      }
    }

    const loadData = async () => {
      if (!masjidId) {
        console.log('No masjidId provided, skipping data load');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const iqamahResult = await fetch(`/api/masjids/${masjidId}/dashboard/iqamah`).then(res => res.json());
        const calculationResult = await fetch(`/api/masjids/${masjidId}/dashboard/prayer-calculations`).then(res => res.json());
        const prayerResults = await fetch(`/api/masjids/${masjidId}/dashboard/prayer-timings`).then(res => res.json());

        if (iqamahResult.success && iqamahResult.data) {
          setIqamahTimings(iqamahResult.data)
          // After setting iqamah timings, check for monthly timings
          const now = new Date()
          const month = now.getMonth() + 1
          const year = now.getFullYear()

          const currentMonthTimings = iqamahResult.data.filter((timing: any) => {
            // @ts-ignore Ignore
            const timingDate = new Date(timing.changeDate)
            return timingDate.getMonth() + 1 === month && timingDate.getFullYear() === year
          })

          setMonthlyTimings(currentMonthTimings)
          setHasMonthlyTimings(currentMonthTimings.length > 0)
        } else {
          console.error('Iqamah result error:', iqamahResult.error);
          toast({
            title: "Error",
            description: "Failed to load Iqamah timings",
            variant: "destructive",
          })
        }

        if (calculationResult.success) {
          setCalculationSettings(calculationResult.data)
        } else {
          console.error('Calculation result error:', calculationResult.error);
          toast({
            title: "Error",
            description: "Failed to load prayer calculation settings",
            variant: "destructive",
          })
        }

        if (prayerResults.success && prayerResults.data) {
          const now = new Date()
          const month = now.getMonth()
          const year = now.getFullYear()

          const currentMonthTimings = prayerResults.data.filter((timing: any) => {
            // @ts-ignore Ignore
            const timingDate = new Date(timing.date)
            return timingDate.getMonth() === month && timingDate.getFullYear() === year
          })
          setMonthlyTimings(currentMonthTimings)
          setHasMonthlyTimings(currentMonthTimings.length > 0)
        } else {
          console.error('Prayer results error:', prayerResults.error);
          toast({
            title: "Error",
            description: "Failed to load Prayer timings",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Load data error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    // Run both functions
    fetchMasjid();
    loadData();
  }, [])

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
          // After setting iqamah timings, check for monthly timings
          const now = new Date()
          const month = now.getMonth() + 1
          const year = now.getFullYear()

          const currentMonthTimings = iqamahResult.data.filter((timing: any) => {
            // @ts-ignore Ignore
            const timingDate = new Date(timing.changeDate)
            return timingDate.getMonth() + 1 === month && timingDate.getFullYear() === year
          })

          setMonthlyTimings(currentMonthTimings)
          setHasMonthlyTimings(currentMonthTimings.length > 0)
        } else {
          toast({
            title: "Error",
            description: "Failed to load Iqamah timings",
            variant: "destructive",
          })
        }

        if (calculationResult.success) {
          setCalculationSettings(calculationResult.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load prayer calculation settings",
            variant: "destructive",
          })
        }

        if (prayerResults.success && prayerResults.data) {
          const now = new Date()
          const month = now.getMonth()
          const year = now.getFullYear()

          const currentMonthTimings = prayerResults.data.filter((timing: any) => {
            // @ts-ignore Ignore
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

  const fetchMonthlyTimings = async (month: number, year: number) => {
    try {
      const currentMonthTimings = iqamahTimings.filter((timing) => {
        const timingDate = new Date(timing.changeDate)
        return timingDate.getMonth() + 1 === month && timingDate.getFullYear() === year
      })

      setMonthlyTimings(currentMonthTimings)
      setHasMonthlyTimings(currentMonthTimings.length > 0)

      setCurrentMonth(new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch monthly prayer times",
        variant: "destructive",
      })
    }
  }

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#550C18]">Prayer Times</h2>
          <p className="text-[#3A3A3A]/70">Manage prayer and iqamah times for your masjid</p>
        </div>
        <div className="flex items-center gap-3">
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
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="iqamah" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="iqamah" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Iqamah Timings
          </TabsTrigger>
          <TabsTrigger value="calculation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Salah Timings/Prayer Calculation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="iqamah" className="space-y-6">
          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Iqamah Timings</CardTitle>
                  <CardDescription className="text-[#3A3A3A]/70">
                    Manage the iqamah times for each prayer
                  </CardDescription>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => setOpenUploadDialog(true)}>
                        <Upload className="h-4 w-4" />
                        Upload CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogTitle>
                      </DialogTitle>
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
                      <DialogTitle>
                      </DialogTitle>
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
                      <DialogTitle>
                      </DialogTitle>
                      <AddIqamahTimingForm
                        masjidId={masjidId}
                        lastIqamah={iqamahTimings.length > 0 ? iqamahTimings[iqamahTimings.length - 1] : null}
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
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A] flex flex-row gap-1 items-center">
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
                    Configure how prayer times are calculated
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
