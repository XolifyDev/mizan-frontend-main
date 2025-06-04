"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { createContentWithConfig } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import EditorComponent from "@/components/markdown-editor/EditorComponent";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, Loader2, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { getLinkStatus } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL"),
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

export default function CreateWebsiteForm() {
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
  const [loading, setLoading] = useState<boolean>(false);
  const [linkStatus, setLinkStatus] = useState<boolean>(false);
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();
  const linkWatch = form.watch("url");

  const checkLink = async (url: string) => {
    try {
      setLinkLoading(true);
      const status = await getLinkStatus(url);
      setLinkStatus(status === 200 || status === 0);
      setLinkLoading(false);
    } catch (error) {
      setLinkStatus(false);
      setLinkLoading(false);
    }
  }


  useEffect(() => {
    if (linkWatch) {
      checkLink(linkWatch);
    }
  }, [linkWatch]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await createContentWithConfig({
      masjidId,
      ...values,
      type: "website",
      zones: values.zones.split(","),
      data: { url: values.url },
      startDate: format(values.startDate, "yyyy-MM-dd HH:mm:ss"),
      endDate: format(values.endDate, "yyyy-MM-dd HH:mm:ss"),
    });
    router.push("/dashboard/content-library#content-library-table");
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add Website</h2>
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
                <EditorComponent content={field.value} setContent={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex flex-row items-center gap-2">Website URL <span className={`${linkStatus ? "text-green-500" : "text-red-500"}`}>{linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : linkStatus ? <Tooltip><TooltipTrigger><CheckCircleIcon className="w-4 h-4" /></TooltipTrigger><TooltipContent>Valid URL ✅</TooltipContent></Tooltip> : <Tooltip><TooltipTrigger><XCircleIcon className="w-4 h-4" /></TooltipTrigger><TooltipContent>Please enter a valid URL</TooltipContent></Tooltip>}</span></FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <div className="grid grid-cols-2 gap-4">
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
        </div>
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
          <Button size={"lg"} type="submit" className="ml-auto text-md" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
} 