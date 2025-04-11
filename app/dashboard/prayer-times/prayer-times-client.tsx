"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Plus, Calendar, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { fetchIqamahTimings, fetchPrayerCalculationSettings } from "@/lib/actions/prayer-times"
import { PrayerCalculationSettings } from "./prayer-calculation-settings"
import { IqamahTimingsTable } from "./iqamah-timings-table"
import { AddIqamahTimingForm } from "./add-iqamah-timing-form"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSearchParams } from "next/navigation"

export default function PrayerTimesClient() {
  const [autoAdjust, setAutoAdjust] = useState(true)
  const [iqamahTimings, setIqamahTimings] = useState([])
  const [calculationSettings, setCalculationSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const { toast } = useToast()
  const masjidId = useSearchParams().get("masjidId") || "";

  // Mock masjid ID - replace with actual masjid ID from your auth context

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [iqamahResult, calculationResult] = await Promise.all([
          fetchIqamahTimings(masjidId),
          fetchPrayerCalculationSettings(masjidId),
        ])

        if (iqamahResult.success) {
          setIqamahTimings(iqamahResult.data)
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
  }, [masjidId, toast])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const [iqamahResult, calculationResult] = await Promise.all([
        fetchIqamahTimings(masjidId),
        fetchPrayerCalculationSettings(masjidId),
      ])

      if (iqamahResult.success) {
        setIqamahTimings(iqamahResult.data)
        toast({
          title: "Success",
          description: "Prayer times refreshed successfully",
        })
      }

      if (calculationResult.success) {
        setCalculationSettings(calculationResult.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh prayer times",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
            Prayer Calculation
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
                  <DialogTitle></DialogTitle>
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
                  <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Prayer Calculation Settings</CardTitle>
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

          <Card className="bg-white border-[#550C18]/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Monthly View</CardTitle>
              <CardDescription className="text-[#3A3A3A]/70">Preview prayer times for the entire month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <Calendar className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
                <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">Monthly Calendar View</h3>
                <p className="text-[#3A3A3A]/70 mb-4">View and export prayer times for the entire month</p>
                <Button className="bg-[#550C18] hover:bg-[#78001A] text-white">Generate Monthly Timings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

