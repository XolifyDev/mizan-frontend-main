"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Plus, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { fetchIqamahTimings, fetchPrayerCalculationSettings, fetchPrayerTimings } from "@/lib/actions/prayer-times"
import { PrayerCalculationSettings } from "./prayer-calculation-settings"
import { IqamahTimingsTable } from "./iqamah-timings-table"
import { AddIqamahTimingForm } from "./add-iqamah-timing-form"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { MonthlyPrayerTimes } from "./monthly-prayer-times"
import { useRouter, useSearchParams } from "next/navigation"
import { getUserMasjid } from "@/lib/actions/masjid"
import { Masjid } from "@prisma/client"

export default function PrayerTimesClient() {
  const [autoAdjust, setAutoAdjust] = useState(true)
  const [iqamahTimings, setIqamahTimings] = useState<Array<any>>([])
  const [calculationSettings, setCalculationSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const { toast } = useToast()
  const [monthlyTimings, setMonthlyTimings] = useState<Array<any>>([])
  const [hasMonthlyTimings, setHasMonthlyTimings] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  )
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loadingMasjid, setLoadingMasjid] = useState(true);
  const masjidId = useSearchParams().get("masjidId") || "";
  const router = useRouter();

  useEffect(() => {
    const fetchMasjid = async () => {
      const userMasjid = await getUserMasjid();

      setMasjid(userMasjid as Masjid);
      setLoadingMasjid(false)
    };
    const loadData = async () => {
      setLoading(true)
      try {
        const [iqamahResult, calculationResult, prayerResults] = await Promise.all([
          fetchIqamahTimings(masjidId),
          fetchPrayerCalculationSettings(masjidId),
          fetchPrayerTimings(masjidId),
        ])

        if (iqamahResult.success) {
          if(!iqamahResult.data) return;
          setIqamahTimings(iqamahResult.data)
          // After setting iqamah timings, check for monthly timings
          const now = new Date()
          const month = now.getMonth() + 1
          const year = now.getFullYear()

          const currentMonthTimings = iqamahResult.data.filter((timing) => {
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

        if (prayerResults.success) {
          const now = new Date()
          const month = now.getMonth()
          const year = now.getFullYear()
          if (!prayerResults.data) return

          const currentMonthTimings = prayerResults.data.filter((timing) => {
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

    loadData()
    fetchMasjid();
  }, [masjidId, toast])

  const handleRefresh = async () => {
    setLoading(true)
    try {
        const [iqamahResult, calculationResult, prayerResults] = await Promise.all([
          fetchIqamahTimings(masjidId),
          fetchPrayerCalculationSettings(masjidId),
          fetchPrayerTimings(masjidId),
        ])

        if (iqamahResult.success) {
          if(!iqamahResult.data) return;
          setIqamahTimings(iqamahResult.data)
          // After setting iqamah timings, check for monthly timings
          const now = new Date()
          const month = now.getMonth() + 1
          const year = now.getFullYear()

          const currentMonthTimings = iqamahResult.data.filter((timing) => {
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

        if (prayerResults.success) {
          const now = new Date()
          const month = now.getMonth()
          const year = now.getFullYear()
          if (!prayerResults.data) return

          const currentMonthTimings = prayerResults.data.filter((timing) => {
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
      </div>
    </div>
  );

  if(!masjid) return router.push("/dashboard");

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
                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Iqamah Timing
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <AddIqamahTimingForm
                      masjidId={masjidId}
                      onSuccess={() => {
                        setOpenAddDialog(false)
                        handleRefresh()
                      }}
                    />
                  </DialogContent>
                </Dialog>
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
                        - Updated at {new Intl. DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(calculationSettings.updatedAt)}
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
