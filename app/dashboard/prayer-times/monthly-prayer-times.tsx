"use client"

import { useState } from "react"
import { Calendar, Download, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { generateMonthlyPrayerTimes, saveMonthlyPrayerTimes } from "@/lib/actions/prayer-times"

type MonthlyPrayerTimesProps = {
  masjidId: string
}

export function MonthlyPrayerTimes({ masjidId }: MonthlyPrayerTimesProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [prayerTimes, setPrayerTimes] = useState<any[]>([])
  const { toast } = useToast()

  // Hardcoded coordinates for demo - in production, get these from the masjid record
  const latitude = 33.7490
  const longitude = -84.3880

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

  const years = Array.from({ length: 5 }, (_, i) => selectedYear + i - 2)

  const handleGenerateTimes = async () => {
    setIsGenerating(true)
    try {
      const result = await generateMonthlyPrayerTimes(
        masjidId,
        selectedMonth,
        selectedYear,
        latitude,
        longitude
      )

      if (result.success) {
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

  const handleSaveTimes = async () => {
    if (!prayerTimes.length) return

    setIsSaving(true)
    try {
      const result = await saveMonthlyPrayerTimes(masjidId, prayerTimes)

      if (result.success) {
        toast({
          title: "Success",
          description: "Prayer times saved successfully",
        })
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save prayer times",
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
      setIsSaving(false)
    }
  }

  const handleExportCSV = () => {
    if (!prayerTimes.length) return

    // Create CSV content
    const headers = ["Date", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]
    const csvContent = [
      headers.join(","),
      ...prayerTimes.map(pt => 
        [pt.date, pt.fajr, pt.sunrise, pt.dhuhr, pt.asr, pt.maghrib, pt.isha].join(",")
      )
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
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    })
  }

  return (
    <Card className="bg-white border-[#550C18]/10">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#3A3A3A]">Monthly Prayer Times</CardTitle>
        <CardDescription className="text-[#3A3A3A]/70">
          Generate and view prayer times for the entire month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#3A3A3A]">
                Monthly Prayer Times
              </DialogTitle>
              <DialogDescription className="text-[#3A3A3A]/70">
                View and export prayer times for the selected month
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-[#3A3A3A] mb-1">Month</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
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

              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-[#3A3A3A] mb-1">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
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

            {prayerTimes.length > 0 && (
              <>
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

                <div className="flex justify-end gap-4 mt-6">
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
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save to Database"
                    )}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <div className="text-center p-8">
          <Calendar className="h-16 w-16 mx-auto text-[#550C18]/50 mb-4" />
          <h3 className="text-lg font-medium text-[#3A3A3A] mb-2">Monthly Calendar View</h3>
          <p className="text-[#3A3A3A]/70 mb-4">
            Generate, view, and export prayer times for the entire month
          </p>
          <Button 
            className="bg-[#550C18] hover:bg-[#78001A] text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Generate Monthly Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
