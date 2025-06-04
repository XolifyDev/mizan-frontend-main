"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { getContentById, updateContent } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getMasjidById } from "@/lib/actions/masjids";
import { Masjid } from "@prisma/client";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MizanAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizanDonations", label: "Mizan Donation Kiosk" },
  { value: "MizanFrame", label: "Mizan Frame" },
  { value: "website", label: "Masjid website" },
];

const zones = ["All", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "Zone 7"];

const dayTypes = [
  "Daily",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeTypeOptions = [
  "Fixed",
  "Salah Fajr",
  "Salah Dhuhur",
  "Salah Asr",
  "Salah Maghrib",
  "Salah Isha",
  "Salah Jumuah 1",
  "Salah Jumuah 2",
  "Iqama Fajr",
  "Iqama Dhuhur",
  "Iqama Asr",
  "Iqama Maghrib",
  "Iqama Isha",
  "Iqama Jumuah 1",
  "Iqama Jumuah 2",
  "Every Iqama",
  "Every Salah"
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  displayLocations: z.array(z.string()).min(1, "Select at least one location"),
  fullscreen: z.boolean(),
  zones: z.string().min(1, "Zone is required"),
  startDate: z.date(),
  endDate: z.date(),
  timeType: z.string().min(1, "Time type required"),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  duration: z.string().min(1, "Duration required"),
  dayType: z.string().min(1, "Day type required"),
});

type FormValues = z.infer<typeof schema>;

export default function EditRamadanCountdownForm({ id }: { id: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      displayLocations: [],
      fullscreen: true,
      zones: "All",
      startDate: new Date(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 30),
      timeType: "Fixed",
      startTime: "12:00",
      endTime: "12:00",
      duration: "60",
      dayType: "Daily",
    },
  });
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayssTillRamadan, setDayssTillRamadan] = useState<number>(30);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [contentData, masjidData] = await Promise.all([
          getContentById(id),
          getMasjidById(masjidId)
        ]);
        if (!contentData) throw new Error("Content not found");
        setMasjid(masjidData);
        form.reset({
          title: contentData.title || "",
          displayLocations: contentData.displayLocations || [],
          fullscreen: contentData.fullscreen ?? true,
          zones: Array.isArray(contentData.zones) ? contentData.zones[0] : (typeof contentData.zones === "string" ? contentData.zones : "All"),
          startDate: contentData.startDate ? new Date(contentData.startDate) : new Date(),
          endDate: contentData.endDate ? new Date(contentData.endDate) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 30),
          timeType: contentData.timeType || "Fixed",
          startTime: contentData.startTime || "12:00",
          endTime: contentData.endTime || "12:00",
          duration: contentData.duration || "60",
          dayType: contentData.dayType || "Daily",
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch content");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");

  useEffect(() => {
    const days = Math.floor((new Date(watchEndDate).getTime() - new Date(watchStartDate).getTime()) / (1000 * 60 * 60 * 24));
    setDayssTillRamadan(days);
  }, [watchStartDate, watchEndDate]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await updateContent(id, {
        ...values,
        masjidId,
        type: "ramadan_countdown",
        startDate: format(values.startDate, "yyyy-MM-dd HH:mm:ss"),
        endDate: format(values.endDate, "yyyy-MM-dd HH:mm:ss"),
        description: "Ramadan Countdown",
      });
      toast({
        title: "Ramadan Countdown updated!",
        description: "Your changes have been saved!",
      });
      router.push("/dashboard/content-library#content-library-table");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update Ramadan Countdown", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!masjid) return <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center -mt-12">
      <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin -mt-12"></div>
    </div>
  </div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Edit Ramadan Countdown</h2>
          <Link href="/dashboard/content-library" className="text-md text-[#550C18] hover:underline">
            <Button variant="outline" size="sm" className="text-md text-[#550C18] hover:bg-[#550C18]/10">
              <ArrowLeftIcon className="w-4 h-4" />
              Go Back
            </Button>
          </Link>
        </div>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          <div className="flex flex-col gap-5 mt-auto">
            <FormField
              control={form.control}
              name="displayLocations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Locations</FormLabel>
                  <FormControl>
                    <Combobox
                      multiple
                      options={displayLocations.map((loc) => ({
                        value: loc.value,
                        label: loc.label,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select display locations..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullscreen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display as</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? "fullscreen" : "split"}
                      onValueChange={(val) =>
                        field.onChange(val === "fullscreen")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select display mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullscreen">Fullscreen</SelectItem>
                        <SelectItem value="split">Split Screen</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zones</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zones..." />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-2 w-full min-h-[250px]">
            <div
              className="relative flex flex-col items-center justify-center flex-1 rounded-2xl border-4 border-yellow-500 bg-gradient-to-br from-[#14332a] to-[#0d1a16] shadow-lg overflow-hidden min-h-[320px]"
            >
              {/* Decorative gold crescent and lanterns (use emoji or SVGs as placeholders) */}
              <div className="absolute left-6 top-6 flex flex-col items-center gap-2 text-yellow-400">
                <span className="text-3xl">🌙</span>
                <span className="text-xl">🏮</span>
                <span className="text-xl">🏮</span>
              </div>
              {/* Top center logo */}
              <div className="-mt-5">
                <Image src={masjid?.logo || "/mizan.svg"} width={70} height={70} alt="Masjid Logo" />
              </div>
              {/* Large countdown number */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[72px] font-extrabold text-white leading-none drop-shadow-lg">{dayssTillRamadan}</span>
                <span className="text-lg font-semibold text-white tracking-widest mt-2">DAYS LEFT UNTIL</span>
                <span className="text-2xl font-bold text-yellow-400 mt-1 tracking-wide">RAMADAN</span>
              </div>
              {/* Decorative gold lanterns right */}
              <div className="absolute right-6 top-6 flex flex-col items-center gap-2 text-yellow-400">
                <span className="text-3xl">🌙</span>
                <span className="text-xl">🏮</span>
                <span className="text-xl">🏮</span>
              </div>
              {/* Bottom right logo */}
              <div className="absolute bottom-4 right-6">
                <Image src="/mizan.svg" width={27} height={27} alt="Mizan Logo" />
              </div>
            </div>
          </div>
        </div>
        <br />
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-xl font-bold mb-2">Schedule</h3>
          <div className="grid grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Countdown Start Date</FormLabel>
                  <FormControl>
                    <DatePicker date={field.value} setDate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ramadan Start Date</FormLabel>
                  <FormControl>
                    <DatePicker date={field.value} setDate={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time type" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day type" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayTypes.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (In Seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex flex-row w-full items-center justify-end">
          <Button size={"lg"} type="submit" className="ml-auto text-md" disabled={loading}>
            {loading ? <span className="animate-spin">⏳</span> : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 