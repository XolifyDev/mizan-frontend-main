"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { createContentWithConfig } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" 
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizDonations", label: "Mizan Donations Kiosk" },
  { value: "Mizan Frame", label: "Mizan Frame" },
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
]

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
  file: z.any().optional(),
  displayLocations: z.array(z.string()).min(1, "Select at least one location"),
  url: z.string().min(1, "URL is required"),
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

const predesignedOptions = [
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_children.jpg", label: "Children" },
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_keep_clean.jpg", label: "Keep Clean" },
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_mobile_app_poster.jpg", label: "Download App Image" },
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_park_properly.jpg", label: "Park Properly" },
];

type FormValues = z.infer<typeof schema>;

export default function CreatePreDesignedForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
      displayLocations: [],
      url: "",
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    await createContentWithConfig({
      masjidId,
      ...values,
      type: "predesigned",
      startDate: format(values.startDate, "yyyy-MM-dd HH:mm:ss"),
      endDate: format(values.endDate, "yyyy-MM-dd HH:mm:ss"),
    });
    router.push("/dashboard/content-library#content-library-table");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Select Pre-Designed Image</h2>
          <Link href="/dashboard/content-library">
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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div className="text-xs text-muted-foreground mb-2">
                  Select an image from the list of pre-designed images.
                </div>
                <FormControl>
                  <div
                    className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-2">
                    {field.value ? (
                      <div className="w-[100%] h-[200px] flex items-center justify-center">
                        <img src={field.value} alt="Preview" className="max-w-full max-h-full object-contain rounded-md shadow-md" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] w-full text-gray-400 cursor-pointer" onClick={() => document.getElementById('image-upload-input')?.click()}>
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 12 2 2.5 3-4L20 16"/></svg>
                        <span className="mt-2">No image selected</span>
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" size={"sm"} className="mt-2">Select Image</Button>
                      </DialogTrigger>
                      <DialogContent className="w-[70dvw] max-w-none">
                        <DialogHeader>
                          <DialogTitle>Select Pre-Designed Image</DialogTitle>
                          <DialogDescription>Select an image from the list of pre-designed images.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          {predesignedOptions.map((option) => (
                            <div key={option.url} className="flex flex-col items-center justify-center relative cursor-pointer hover:shadow-md transition-shadow duration-300" onClick={() => setSelectedImage(option.url)}>
                              <p className="top-0 right-0 absolute text-sm text-white bg-[#550C18]/80 px-2 py-1 rounded-bl-md rounded-tr-md border-l border-b border-[#550C18]">{option.label}</p>
                              <img src={option.url} alt={option.label} className={cn("w-full h-full object-contain rounded-md", selectedImage === option.url && "border border-[#550C18]")} />
                            </div>
                          ))}
                        </div>
                      <DialogFooter className="flex flex-row w-full border-t border-[#550C18]">
                        <DialogClose asChild>
                          <Button variant={"outline"} type="button" className="mt-2 border border-[#550C18] text-[#550C18]" onClick={() => setSelectedImage(null)}>Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant={"default"} type="button" className="mt-2" onClick={() => {
                            form.setValue("url", selectedImage!);
                          }}>Confirm Selection</Button>
                        </DialogClose>
                      </DialogFooter> 
                      </DialogContent>
                    </Dialog>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="grid grid-cols-2 gap-4 justify-center items-center">
          <FormField
            control={form.control}
            name="displayLocations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Locations</FormLabel>
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
          <FormField
            control={form.control}
            name="fullscreen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Mode</FormLabel>
                <FormControl>
                  <Select onValueChange={(value) => field.onChange(value === "fullscreen")} defaultValue={field.value ? "fullscreen" : "normal"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
       </div>
        <FormField
          control={form.control}
          name="zones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zones</FormLabel>
              <FormControl>
                <Combobox
                  options={zones.map(zone => ({ value: zone, label: zone }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select zones..."
                />
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
          <Button size={"lg"} type="submit" className="ml-auto text-md">Create</Button>
        </div>
      </form>
    </Form>
  );
} 