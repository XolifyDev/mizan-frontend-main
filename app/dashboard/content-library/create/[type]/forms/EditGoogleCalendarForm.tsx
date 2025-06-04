"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { getContentById, updateContent } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Masjid } from "@prisma/client";
import { getMasjidById } from "@/lib/actions/masjids";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MizanAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizanDonations", label: "Mizan Donation Kiosk" },
  { value: "MizanFrame", label: "Mizan Frame" },
  { value: "website", label: "Masjid Website" },
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
  description: z.string().optional(),
  url: z.string().min(1, "URL is required"),
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

export default function EditGoogleCalendarForm({ id }: { id: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      displayLocations: [],
      fullscreen: true,
      zones: "All",
      startDate: new Date(),
      endDate: new Date(),
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [masjid, setMasjid] = useState<Masjid | null>(null);

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
          description: contentData.data?.description || contentData.description || "",
          url: contentData.url || contentData.data?.url || "",
          displayLocations: contentData.displayLocations || [],
          fullscreen: contentData.fullscreen ?? true,
          zones: Array.isArray(contentData.zones) ? contentData.zones[0] : (typeof contentData.zones === "string" ? contentData.zones : "All"),
          startDate: contentData.startDate ? new Date(contentData.startDate) : new Date(),
          endDate: contentData.endDate ? new Date(contentData.endDate) : new Date(),
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

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await updateContent(id, {
        ...values,
        masjidId,
        type: "google_calendar",
        data: { url: values.url, masjidId },
        startDate: format(values.startDate, "yyyy-MM-dd HH:mm:ss"),
        endDate: format(values.endDate, "yyyy-MM-dd HH:mm:ss"),
      });
      toast({
        title: "Google Calendar content updated!",
        description: "Your changes have been saved!",
      });
      router.push("/dashboard/content-library#content-library-table");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update Google Calendar content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const googleCalendarConnectedWatch = form.watch("url");

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!masjid) return <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 rounded-full border-y border-[#550C18] animate-spin"></div>
    </div>
  </div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Edit Google Calendar Event</h2>
          <Link href="/dashboard/content-library" className="text-md text-[#550C18] hover:underline">
            <Button variant={"outline"} size={"sm"} className="text-md text-[#550C18] hover:bg-[#550C18]/10">
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Tabs defaultValue={googleCalendarConnectedWatch.length > 1 ? "connected" : "custom"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {masjid && masjid?.googleCalendarId ? (
              <TabsTrigger value="connected" onClick={() => {
                form.setValue("url", masjid?.googleCalendarId as string);
              }}>Connected Calendar</TabsTrigger>
            ) : (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <TabsTrigger value="connected">Connected Calendar</TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  You do not have a connected Google Calendar. Please connect one to continue. <Link href="/dashboard/settings/google-calendar" className="text-md text-[#550C18] underline hover:text-[#550C18]/80">Connect Google Calendar</Link>
                </TooltipContent>
              </Tooltip>
            )}
            <TabsTrigger value="custom">Custom URL</TabsTrigger>
          </TabsList>
          <TabsContent value="connected">
            {masjid?.googleCalendarId && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-3 p-3 border rounded-md">
                        <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                          <Image 
                            src={masjid?.googleCalendarPfp as string || "/default-avatar.png"}
                            placeholder="blur"
                            blurDataURL={masjid?.googleCalendarPfp as string || "/default-avatar.png"}
                            loading="lazy"
                            alt="Calendar profile" 
                            className="w-full h-full object-cover" 
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <p className="font-medium">Connected Google Calendar</p>
                          <p className="text-sm text-[#550C18]">{masjid?.googleCalendarId}</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </TabsContent>
          <TabsContent value="custom">
            <FormField
              control={form.control}
              name="url" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Calendar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter calendar URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <div>
          <FormLabel>Display Locations</FormLabel>
          <FormField
            control={form.control}
            name="displayLocations"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Combobox
                    multiple
                    options={displayLocations.map(loc => ({ value: loc.value, label: loc.label }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select display locations..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="fullscreen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display as</FormLabel>
              <FormControl>
                <Select value={field.value ? "fullscreen" : "split"} onValueChange={val => field.onChange(val === "fullscreen") }>
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
                    <SelectValue placeholder="Select zones" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Schedule Section */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-xl font-bold mb-2">Schedule</h3>
          <div className="grid grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
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
                  <FormLabel>End Date</FormLabel>
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
        <div className="flex flex-row w-full">
          <Button size={"lg"} type="submit" className="ml-auto text-md">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
} 