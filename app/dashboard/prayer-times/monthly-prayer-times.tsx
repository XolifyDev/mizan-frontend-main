"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, Loader2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { fetchMonthPrayerTimes, generateMonthlyPrayerTimes, saveMonthlyPrayerTimes } from "@/lib/actions/prayer-times"
import type { Masjid } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { mockMonthlyTimings } from "@/lib/mock/monthlyTimings"
import moment from "moment";
import { EditPrayerTimeDialog } from "@/components/dashboard/edit-prayer-time-dialog"

type MonthlyPrayerTimesProps = {
  masjidId: string
  hasMonthlyTimings: boolean
  monthlyTimings: any[];
  setMonthlyTimings: (e: any) => void;
  currentMonth: string
  masjid?: Masjid
}

export function MonthlyPrayerTimes({
  masjidId,
  masjid,
  hasMonthlyTimings,
  monthlyTimings = [],
  setMonthlyTimings,
  currentMonth: initialCurrentMonth,
}: MonthlyPrayerTimesProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savingError, setSavingError] = useState<string | null>(null);
  const [monthOrYear, setMonthOrYear] = useState("month")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [prayerTimes, setPrayerTimes] = useState<any[]>([])
  const [yearlyPrayerTimes, setYearlyPrayerTimes] = useState<Record<number, any[]>>({})
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1)
  const [currentMonth, setCurrentMonth] = useState<string>(
    initialCurrentMonth || new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [saveToDatabase, setSaveToDatabase] = useState(false);
  const [editPrayerTime, setEditPrayerTime] = useState<{
    id: string
    date: string
    prayer: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"
    time: string
  } | null>(null);

  // Hardcoded coordinates for demo - in production, get these from the masjid record
  const latitude = masjid?.latitude ? Number.parseFloat(masjid.latitude) : 0
  const longitude = masjid?.longitude ? Number.parseFloat(masjid.longitude) : 0

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i - 2)

  // Update current month string when display month changes
  useEffect(() => {
    const monthName = months.find((m) => m.value === displayMonth)?.label
    setCurrentMonth(`${monthName} ${selectedYear}`)
  }, [displayMonth, selectedYear, months])

  const handleGenerateTimes = async () => {
    setIsGenerating(true)
    try {
      if (monthOrYear === "month") {
        // Generate for a single month
        const result = await generateMonthlyPrayerTimes(
          masjidId,
          selectedMonth,
          selectedYear,
          Number(latitude),
          Number(longitude),
        )

        if (result.success) {
          // @ts-ignore Ignore
          setPrayerTimes(result.data)
          toast({
            title: "Success",
            description: "Prayer times generated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to generate prayer times",
            variant: "destructive",
          })
        }
      } else {
        // Generate for the entire year
        const yearData: Record<number, any[]> = {}

        // Show a toast to indicate the process has started
        toast({
          title: "Generating",
          description: "Generating prayer times for the entire year...",
        })

        // Generate prayer times for each month
        for (let month = 1; month <= 12; month++) {
          const result = await generateMonthlyPrayerTimes(
            masjidId,
            month,
            selectedYear,
            Number(latitude),
            Number(longitude),
          )

          if (result.success) {
            // @ts-ignore Ignore
            yearData[month] = result.data
          } else {
            toast({
              title: "Error",
              description: `Failed to generate prayer times for ${months.find((m) => m.value === month)?.label}`,
              variant: "destructive",
            })
          }
        }

        setYearlyPrayerTimes(yearData)
        // Set the prayer times to display the first month
        setPrayerTimes(yearData[displayMonth] || [])

        toast({
          title: "Success",
          description: "Prayer times for the entire year generated successfully",
          variant: "default"
        })
        
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    console.log("SAVE TO CHANGE", saveToDatabase)
  }, [saveToDatabase])

  const handleSaveTimes = async () => {
    setSaveToDatabase(true);
    if (monthOrYear === "month" && !prayerTimes.length) return;
    if (monthOrYear === "year" && Object.keys(yearlyPrayerTimes).length === 0) return;

    try {
      if (monthOrYear === "month") {
        // Save a single month
        const result = await saveMonthlyPrayerTimes(masjidId, prayerTimes)

        if (result.success) {
          toast({
            title: "Success",
            description: "Prayer times saved successfully",
          });
          setIsDialogOpen(false);
          setPrayerTimes([]);
          await fetch("/api/revalidate?path=/dashboard/prayer-times");
          setIsDialogOpen(false);
        } else {
          setSavingError(result.error!);
          toast({
            title: "Error",
            description: result.error || "Failed to save prayer times",
            variant: "destructive",
          })
        }
      } else {
        // Save the entire year
        let allSaved = true

        // Show a toast to indicate the process has started
        toast({
          title: "Saving",
          description: "Saving prayer times for the entire year...",
        })

        // Save each month's data
        for (const month in yearlyPrayerTimes) {
          const monthData = yearlyPrayerTimes[Number(month)]
          setTimeout(async () => {
            const result = await saveMonthlyPrayerTimes(masjidId, monthData)
            if (!result.success) {
              allSaved = false
              toast({
                title: "Error",
                description: `Failed to save prayer times for ${months.find((m) => m.value === Number(month))?.label}`,
                variant: "destructive",
              })
            }
          }, 1000)
        }

        setTimeout(() => {
          if (allSaved) {
            toast({
              title: "Success",
              description: "Prayer times for the entire year saved successfully",
            });
            setIsDialogOpen(false);
            setPrayerTimes([]);
          }
        }, 1400);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setSaveToDatabase(false)
    }
  }

  const handleExportCSV = () => {
    if (monthOrYear === "month" && !prayerTimes.length) return
    if (monthOrYear === "year" && Object.keys(yearlyPrayerTimes).length === 0) return

    // Create CSV content
    const headers = ["Date", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]

    if (monthOrYear === "month") {
      // Export a single month
      const csvContent = [
        headers.join(","),
        ...prayerTimes.map((pt) => [pt.date, pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha].join(",")),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `prayer-times-${selectedYear}-${selectedMonth}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Export the entire year
      const allData: any[] = []

      // Combine all months' data
      for (const month in yearlyPrayerTimes) {
        allData.push(...yearlyPrayerTimes[Number(month)])
      }

      // Sort by date
      allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const csvContent = [
        headers.join(","),
        ...allData.map((pt) => [pt.date, pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha].join(",")),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `prayer-times-${selectedYear}-full.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handlePreviousMonth = () => {
    if (displayMonth > 1) {
      setDisplayMonth((prev) => prev - 1)
    } else {
      setDisplayMonth(12)
      setSelectedYear((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (displayMonth < 12) {
      setDisplayMonth((prev) => prev + 1)
    } else {
      setDisplayMonth(1)
      setSelectedYear((prev) => prev + 1)
    }
  }

  const handleMonthYearChange = async (month: number, year: number) => {
    setIsLoading(true)
    setDisplayMonth(month)
    setSelectedYear(year)

    try {
      // Fetch prayer times for the selected month and year
      const result = await fetchMonthPrayerTimes(masjidId, month - 1, year);

      if (result.success) {
        // @ts-ignore Ignore
        setMonthlyTimings(result.data)
        // Update the display month and current month string
        setDisplayMonth(month)
        const monthName = months.find((m) => m.value === month)?.label
        setCurrentMonth(`${monthName} ${year}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch prayer times",
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
      setIsLoading(false)
    }
  }

  const handleEditPrayerTime = (timing: any, prayer: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha") => {
    const time = timing[prayer]
    const formattedTime = moment(time).toISOString();

    setEditPrayerTime({
      id: timing.id,
      date: timing.date,
      prayer,
      time: formattedTime,
    })
  }

  const handleEditSuccess = () => {
    // Refresh the prayer times for the current month
    handleMonthYearChange(displayMonth, selectedYear)
  }

  useEffect(() => {
    if (monthOrYear === "year" && yearlyPrayerTimes[displayMonth]) {
      setPrayerTimes(yearlyPrayerTimes[displayMonth])
    }
  }, [displayMonth, yearlyPrayerTimes, monthOrYear])

  return (
    <Card className="bg-white border-[#550C18]/10">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Prayer Times Calendar</CardTitle>
            <CardDescription className="text-[#3A3A3A]/70">
              Generate and view prayer times for the entire month or year
            </CardDescription>
          </div>

          {/* Month/Year Picker - Added in the highlighted area */}
          <div className="flex items-center gap-2">
            <Select
              value={displayMonth.toString()}
              onValueChange={(value) => handleMonthYearChange(Number.parseInt(value), selectedYear)}
            >
              <SelectTrigger className="w-[130px] border-[#550C18]/20 focus:ring-[#550C18]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => handleMonthYearChange(selectedMonth, Number.parseInt(value))}
            >
              <SelectTrigger className="w-[100px] border-[#550C18]/20 focus:ring-[#550C18]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoading ? (
              <Button variant="outline" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthYearChange(selectedMonth, selectedYear)}
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Edit Prayer Time Dialog */}
        {editPrayerTime && (
          <EditPrayerTimeDialog
            open={!!editPrayerTime}
            onOpenChange={(open) => !open && setEditPrayerTime(null)}
            prayerTime={editPrayerTime}
            masjidId={masjidId}
            onSuccess={handleEditSuccess}
          />
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#3A3A3A]">Generate Prayer Times</DialogTitle>
              <DialogDescription className="text-[#3A3A3A]/70">
                Generate, view and export prayer times for a month or the entire year
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-[#3A3A3A] mb-1">Generate for</label>
                <Select value={monthOrYear} onValueChange={(value) => setMonthOrYear(value)}>
                  <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                    <SelectValue placeholder="Select month or year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {monthOrYear === "month" && (
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-[#3A3A3A] mb-1">Month</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                  >
                    <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-[#3A3A3A] mb-1">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateTimes}
                className="bg-[#550C18] hover:bg-[#78001A] text-white w-full md:w-auto"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            {savingError && (
              <p className="text-red-400 text-left font-semibold">
                  {savingError || "There was an error saving your timings.. Please try again!"}
              </p>
            )}

            {(prayerTimes.length > 0 || Object.keys(yearlyPrayerTimes).length > 0) && (
              <>
                {monthOrYear === "year" && (
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousMonth}
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <h3 className="text-lg font-medium text-[#3A3A3A]">
                      {months.find((m) => m.value === displayMonth)?.label} {selectedYear}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}

                <div className="rounded-md border border-[#550C18]/10 overflow-hidden">
                  <div className="max-h-[50vh] overflow-auto">
                    <Table>
                      <TableHeader className="bg-[#550C18]/5 sticky top-0">
                        <TableRow>
                          <TableHead className="text-[#3A3A3A] font-medium">Date</TableHead>
                          <TableHead className="text-[#3A3A3A] font-medium">Fajr</TableHead>
                          <TableHead className="text-[#3A3A3A] font-medium">Sunrise</TableHead>
                          <TableHead className="text-[#3A3A3A] font-medium">Dhuhr</TableHead>
                          <TableHead className="text-[#3A3A3A] font-medium">Asr</TableHead>
                          <TableHead className="text-[#3A3A3A] font-medium">Maghrib</TableHead>
                          <TableHead className="text-[#3A3A3A] font-medium">Isha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prayerTimes.map((pt, index) => (
                          <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#550C18]/5"}>
                            <TableCell className="font-medium">{formatDate(pt.date)}</TableCell>
                            <TableCell>{pt.fajr}</TableCell>
                            <TableCell>{pt.sunrise}</TableCell>
                            <TableCell>{pt.dhuhr}</TableCell>
                            <TableCell>{pt.asr}</TableCell>
                            <TableCell>{pt.maghrib}</TableCell>
                            <TableCell>{pt.isha}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex flex-row w-full justify-between items-center mt-">
                  <p className="text-red-500 text-lg font-medium">
                    *NOTICE* - This may take a few minutes
                  </p>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
                      onClick={handleExportCSV}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      className="bg-[#550C18] hover:bg-[#78001A] text-white"
                      onClick={handleSaveTimes}
                      disabled={saveToDatabase}
                    >
                      {saveToDatabase ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save to Database"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {hasMonthlyTimings ? (
          <>
            <div className="flex flex-row-w-full justify-between items-center mb-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleMonthYearChange(displayMonth === 1 ? 12 : displayMonth - 1, selectedYear)
                }
                disabled={isLoading}
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <h3 className="text-lg font-medium text-[#3A3A3A] mb-1">{currentMonth} Prayer Times</h3>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleMonthYearChange(displayMonth === 12 ? 1 : displayMonth + 1, selectedYear)
                }
                disabled={isLoading}
                className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {isLoading ? (
              <div className="rounded-md border border-[#550C18]/10 overflow-hidden">
                <div className="max-h-[50vh] overflow-auto">
                  <Table className="rounded-md border border-[#550C18]/10">
                    <TableHeader>
                      <TableRow className="bg-[#550C18]/5">
                        <TableHead className="text-left text-[#3A3A3A]">Date</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Fajr</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Sunrise</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Dhuhr</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Asr</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Maghrib</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Isha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockMonthlyTimings.map((timing, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#550C18]/5"}>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                          <TableCell className="text-[#3A3A3A]">
                            <Skeleton className="w-[20] h-[10px]" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-[#550C18]/10 overflow-hidden">
                <div className="max-h-[50vh] overflow-auto">
                  <Table className="rounded-md border border-[#550C18]/10">
                    <TableHeader>
                      <TableRow className="bg-[#550C18]/5">
                        <TableHead className="text-left text-[#3A3A3A]">Date</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Fajr</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Sunrise</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Dhuhr</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Asr</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Maghrib</TableHead>
                        <TableHead className="text-left text-[#3A3A3A]">Isha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyTimings.map((timing, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#550C18]/5"}>
                          <TableCell className="text-gray-500">
                            {timing.date ? moment(timing.date).format("L") : "N/A"}
                          </TableCell>
                          <TableCell className="text-[#3A3A3A] group relative">
                            <div className="flex items-center">
                              <span>
                                {moment(timing.fajr).format("h:mm A")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPrayerTime(timing, "fajr")}
                              >
                                <Edit2 className="h-3 w-3 text-[#550C18]" />
                                <span className="sr-only">Edit Fajr</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#3A3A3A] group relative">
                            <div className="flex items-center">
                              <span>
                                {moment(timing.sunrise).format("h:mm A")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPrayerTime(timing, "sunrise")}
                              >
                                <Edit2 className="h-3 w-3 text-[#550C18]" />
                                <span className="sr-only">Edit Sunrise</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#3A3A3A] group relative">
                            <div className="flex items-center">
                              <span>
                                {moment(timing.dhuhr).format("h:mm A")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPrayerTime(timing, "dhuhr")}
                              >
                                <Edit2 className="h-3 w-3 text-[#550C18]" />
                                <span className="sr-only">Edit Dhuhr</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#3A3A3A] group relative">
                            <div className="flex items-center">
                              <span>
                                {moment(timing.asr).format("h:mm A")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPrayerTime(timing, "asr")}
                              >
                                <Edit2 className="h-3 w-3 text-[#550C18]" />
                                <span className="sr-only">Edit Asr</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#3A3A3A] group relative">
                            <div className="flex items-center">
                              <span>
                                {moment(timing.maghrib).format("h:mm A")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPrayerTime(timing, "maghrib")}
                              >
                                <Edit2 className="h-3 w-3 text-[#550C18]" />
                                <span className="sr-only">Edit Maghrib</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#3A3A3A] group relative">
                            <div className="flex items-center">
                              <span>
                                {moment(timing.isha).format("h:mm A")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPrayerTime(timing, "isha")}
                              >
                                <Edit2 className="h-3 w-3 text-[#550C18]" />
                                <span className="sr-only">Edit Isha</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={() => setIsDialogOpen(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Generate New Calendar
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <Calendar className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
            <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">Prayer Times Calendar</h3>
            <p className="text-[#3A3A3A]/70 mb-4">No prayer times found for the current month</p>
            <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" onClick={() => setIsDialogOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Monthly/Yearly Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
