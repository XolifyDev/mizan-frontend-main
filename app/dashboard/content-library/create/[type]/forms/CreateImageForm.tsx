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
import React from "react";
import { Combobox } from "@/components/ui/combobox";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MizanAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizanDonations", label: "Mizan Donation Kiosk" },
  { value: "MizanFrame", label: "Mizan Frame" },
  { value: "website", label: "Masjid website" },
];
const zones = ["All", "Zone 1", "Zone 2", "Zone 3"];
const dayTypes = ["Daily", "Weekdays", "Weekends"];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  file: z.any().refine((file) => file instanceof File, "Image file is required"),
  displayLocations: z.array(z.string()).min(1, "Select at least one location"),
  fullscreen: z.boolean(),
  zone: z.string().min(1, "Zone is required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  duration: z.string().min(1, "Duration required"),
  dayType: z.string().min(1, "Day type required"),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateImageForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
      displayLocations: [],
      fullscreen: true,
      zone: "All", 
      startDate: "",
      endDate: "",
      startTime: "12:00",
      endTime: "12:00",
      duration: "60",
      dayType: "Daily",
      status: "Active",
    },
  });
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    // TODO: Upload file and get URL, then save content
    // For now, just pass file name as url (replace with real upload logic)
    await createContentWithConfig({
      masjidId,
      ...values,
      type: "image",
      url: values.file.name, // Replace with real file URL after upload
      data: { description: values.description },
    });
    router.push("/dashboard/content-library");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4">Upload Image</h2>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Name</FormLabel>
              <FormControl>
                <Input placeholder="Something that will help you identify this content" {...field} />
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value || "Active"} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => {
            const file = field.value;
            const [preview, setPreview] = React.useState<string | null>(null);
            React.useEffect(() => {
              if (file instanceof File) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              } else {
                setPreview(null);
              }
            }, [file]);
            return (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div className="text-xs text-muted-foreground mb-2">
                  Landscape images should be 1920px X 1080px and portrait images should be 1080px X 1920px
                </div>
                <FormControl>
                  <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-2">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 mb-4 object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 w-full text-gray-400">
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 12 2 2.5 3-4L20 16"/></svg>
                        <span className="mt-2">No image selected</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload-input"
                      onChange={e => field.onChange(e.target.files?.[0])}
                    />
                    <label htmlFor="image-upload-input">
                      <Button type="button" className="mt-2">Upload Image</Button>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
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
          name="zone"
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (seconds)</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
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
              <FormLabel>Day Type</FormLabel>
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
        <Button type="submit" className="bg-[#550C18] text-white px-4 py-2 rounded">Upload</Button>
      </form>
    </Form>
  );
} 