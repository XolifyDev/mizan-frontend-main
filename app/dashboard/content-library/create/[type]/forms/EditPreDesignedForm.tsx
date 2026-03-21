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
import { getContentById, updateContent } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

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
const predesignedOptions = [
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_children.jpg", label: "Children" },
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_keep_clean.jpg", label: "Keep Clean" },
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_mobile_app_poster.jpg", label: "Download App Image" },
  { url: "https://masjidal.com/common/assets/images/slideshow/tmp_park_properly.jpg", label: "Park Properly" },
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

type FormValues = z.infer<typeof schema>;

export default function EditPreDesignedForm({ id }: { id: string }) {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getContentById(id);
        if (!data) throw new Error("Content not found");
        form.reset({
          title: data.title || "",
          description: data.data?.description || data.description || "",
          file: undefined,
          displayLocations: data.displayLocations || [],
          url: data.url || "",
          fullscreen: data.fullscreen ?? true,
          zones: Array.isArray(data.zones) ? data.zones[0] : (typeof data.zones === "string" ? data.zones : "All"),
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          timeType: data.timeType || "Fixed",
          startTime: data.startTime || "12:00",
          endTime: data.endTime || "12:00",
          duration: data.duration || "60",
          dayType: data.dayType || "Daily",
        });
        setSelectedImage(data.url || null);
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
        type: "predesigned",
        startDate: format(values.startDate, "yyyy-MM-dd HH:mm:ss"),
        endDate: format(values.endDate, "yyyy-MM-dd HH:mm:ss"),
      });
      toast({
        title: "Pre-Designed content updated!",
        description: "Your changes have been saved!",
      });
      router.push("/dashboard/content-library#content-library-table");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update predesigned content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Edit Pre-Designed Image</h2>
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
        {/* ...rest of the form fields (displayLocations, fullscreen, zones, schedule, etc.) ... */}
      </form>
    </Form>
  );
} 