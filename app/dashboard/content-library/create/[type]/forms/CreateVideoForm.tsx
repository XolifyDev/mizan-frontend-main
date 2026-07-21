"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { createContentWithConfig } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeftIcon, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MizanAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizanDonations", label: "Mizan Donation Kiosk" },
  { value: "MizanFrame", label: "Mizan Frame" },
  { value: "website", label: "Masjid website" },
];
const zones = ["All", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "Zone 7"];
const dayTypes = ["Daily", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeTypeOptions = [
  "Fixed", "Salah Fajr", "Salah Dhuhur", "Salah Asr", "Salah Maghrib", "Salah Isha",
  "Iqama Fajr", "Iqama Dhuhur", "Iqama Asr", "Iqama Maghrib", "Iqama Isha", "Every Iqama", "Every Salah",
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  videoSource: z.enum(["upload", "url"]),
  videoUrl: z.string().optional(),
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
  muted: z.boolean(),
  loop: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateVideoForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      videoSource: "url",
      videoUrl: "",
      displayLocations: [],
      fullscreen: true,
      zones: "All",
      startDate: new Date(),
      endDate: new Date(),
      timeType: "Fixed",
      startTime: "08:00",
      endTime: "22:00",
      duration: "60",
      dayType: "Daily",
      muted: true,
      loop: true,
    },
  });

  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();
  const videoSource = form.watch("videoSource");
  const videoUrl = form.watch("videoUrl");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const onSubmit = async (values: FormValues) => {
    let finalUrl = values.videoUrl || "";

    if (values.videoSource === "upload" && uploadedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("files", uploadedFile);
        const res = await fetch("/api/uploadthing", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const uploaded = await res.json();
        finalUrl = uploaded[0]?.data?.ufsUrl || "";
      } finally {
        setUploading(false);
      }
    }

    if (!finalUrl) {
      toast({ title: "Video required", description: "Upload a file or enter a URL.", variant: "destructive" });
      return;
    }

    await createContentWithConfig({
      masjidId,
      title: values.title,
      description: values.description,
      type: "video",
      url: finalUrl,
      data: { muted: values.muted, loop: values.loop, videoSource: values.videoSource },
      displayLocations: values.displayLocations,
      fullscreen: values.fullscreen,
      zones: [values.zones],
      startDate: format(values.startDate, "yyyy-MM-dd HH:mm:ss"),
      endDate: format(values.endDate, "yyyy-MM-dd HH:mm:ss"),
      startTime: values.startTime,
      endTime: values.endTime,
      duration: values.duration,
      dayType: values.dayType,
      timeType: values.timeType,
    });

    toast({ title: "Video content created!", description: "You can now view your content on your devices!" });
    router.push("/dashboard/content-library");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add Video</h2>
          <Link href="/dashboard/content-library">
            <Button variant="outline" size="sm" className="text-[#550C18] hover:bg-[#550C18]/10">
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Go Back
            </Button>
          </Link>
        </div>

        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Content Name</FormLabel>
            <FormControl><Input placeholder="e.g. Friday Khutbah Clip" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optional)</FormLabel>
            <FormControl><Input placeholder="Short description" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Video source toggle */}
        <FormField control={form.control} name="videoSource" render={({ field }) => (
          <FormItem>
            <FormLabel>Video Source</FormLabel>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={field.value === "url" ? "default" : "outline"}
                className={field.value === "url" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#550C18]"}
                onClick={() => field.onChange("url")}
              >
                <LinkIcon className="w-4 h-4 mr-2" /> URL / Embed
              </Button>
              <Button
                type="button"
                variant={field.value === "upload" ? "default" : "outline"}
                className={field.value === "upload" ? "bg-[#550C18] text-white" : "border-[#550C18]/20 text-[#550C18]"}
                onClick={() => field.onChange("upload")}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload File
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        {videoSource === "url" ? (
          <FormField control={form.control} name="videoUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/watch?v=... or direct .mp4 URL" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, or direct video URLs.</p>
              {field.value && (
                <div className="mt-2 rounded-md overflow-hidden border aspect-video">
                  <iframe
                    src={field.value.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )} />
        ) : (
          <FormItem>
            <FormLabel>Video File</FormLabel>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#550C18]/40 transition"
              onClick={() => document.getElementById("video-upload-input")?.click()}
            >
              {uploadedFile ? (
                <div>
                  <p className="font-medium text-[#2e0c12]">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <p>Click or drag a video file here</p>
                  <p className="text-xs">MP4, WebM, MOV supported</p>
                </div>
              )}
              <input
                id="video-upload-input"
                type="file"
                accept="video/mp4,video/webm,video/mov,video/quicktime"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </FormItem>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="muted" render={({ field }) => (
            <FormItem>
              <FormLabel>Audio</FormLabel>
              <Select value={field.value ? "muted" : "audio"} onValueChange={v => field.onChange(v === "muted")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="muted">Muted</SelectItem>
                  <SelectItem value="audio">With Audio</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />

          <FormField control={form.control} name="loop" render={({ field }) => (
            <FormItem>
              <FormLabel>Playback</FormLabel>
              <Select value={field.value ? "loop" : "once"} onValueChange={v => field.onChange(v === "loop")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loop">Loop</SelectItem>
                  <SelectItem value="once">Play Once</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="displayLocations" render={({ field }) => (
          <FormItem>
            <FormLabel>Display Locations</FormLabel>
            <FormControl>
              <Combobox
                multiple
                options={displayLocations.map(l => ({ value: l.value, label: l.label }))}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select display locations..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="fullscreen" render={({ field }) => (
            <FormItem>
              <FormLabel>Display as</FormLabel>
              <Select value={field.value ? "fullscreen" : "split"} onValueChange={v => field.onChange(v === "fullscreen")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullscreen">Fullscreen</SelectItem>
                  <SelectItem value="split">Split Screen</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />

          <FormField control={form.control} name="zones" render={({ field }) => (
            <FormItem>
              <FormLabel>Zone</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{zones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
          <h3 className="text-lg font-semibold">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeType" render={({ field }) => (
              <FormItem>
                <FormLabel>Time Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{timeTypeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dayType" render={({ field }) => (
              <FormItem>
                <FormLabel>Day</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{dayTypes.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="startTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="endTime" render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (seconds)</FormLabel>
              <FormControl><Input type="number" min="1" className="w-40" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end">
          <Button size="lg" type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={uploading}>
            {uploading ? "Uploading..." : "Create Video Slide"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
