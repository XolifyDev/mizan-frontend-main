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

const displayLocations = [
  { value: "al_iqamah", label: "Al-Iqamah TV Screens" },
  { value: "athan_plus", label: "Athan+ Phone App" },
  { value: "mdonate", label: "mDonate Donation Kiosk" },
  { value: "athan_frame", label: "Athan Frame" },
  { value: "website", label: "Masjid website" },
];
const zones = ["All", "Zone 1", "Zone 2", "Zone 3"];
const dayTypes = ["Daily", "Weekdays", "Weekends"];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  hadith: z.string().min(2, "Hadith is required"),
  displayLocations: z.array(z.string()).min(1, "Select at least one location"),
  fullscreen: z.boolean(),
  zones: z.array(z.string()).min(1, "Select at least one zone"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  duration: z.string().min(1, "Duration required"),
  dayType: z.string().min(1, "Day type required"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateDailyHadithForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      hadith: "",
      displayLocations: [],
      fullscreen: true,
      zones: ["All"],
      startDate: "",
      endDate: "",
      startTime: "12:00",
      endTime: "12:00",
      duration: "60",
      dayType: "Daily",
    },
  });
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    await createContentWithConfig({
      masjidId,
      ...values,
      type: "daily_hadith",
      data: { hadith: values.hadith },
    });
    router.push("/dashboard/content-library");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4">Add Daily Hadith</h2>
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
          name="hadith"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hadith</FormLabel>
              <FormControl>
                <Textarea placeholder="Hadith content" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Display Locations</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {displayLocations.map((loc) => (
              <FormField
                key={loc.value}
                control={form.control}
                name="displayLocations"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(loc.value)}
                        onCheckedChange={(checked) => {
                          if (checked) field.onChange([...field.value, loc.value]);
                          else field.onChange(field.value.filter((v: string) => v !== loc.value));
                        }}
                      />
                    </FormControl>
                    <FormLabel>{loc.label}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        <FormField
          control={form.control}
          name="fullscreen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display as Fullscreen?</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
                <Select multiple value={field.value} onValueChange={field.onChange}>
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
        <Button type="submit" className="bg-[#550C18] text-white px-4 py-2 rounded">Add</Button>
      </form>
    </Form>
  );
} 