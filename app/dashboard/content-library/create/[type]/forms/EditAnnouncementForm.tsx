"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Combobox } from "@/components/ui/combobox";
import EditorComponent from "@/components/markdown-editor/EditorComponent";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  getAnnouncementById,
  updateAnnouncement,
} from "@/lib/actions/announcements";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizDonations", label: "Mizan Donations Kiosk" },
  { value: "Mizan Frame", label: "Mizan Frame" },
  { value: "website", label: "Masjid website" },
];
const zones = [
  "All",
  "Zone 1",
  "Zone 2",
  "Zone 3",
  "Zone 4",
  "Zone 5",
  "Zone 6",
  "Zone 7",
];
const typeOptions = ["Regular", "Important", "Orbituary", "Donation"];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  content: z.string().min(2, "Content is required"),
  displayLocations: z.array(z.string().min(1, "Select at least one location")),
  type: z.string().min(1, "Select a type"),
  startDate: z.date(),
  endDate: z.date(),
  zones: z.string().min(1, "Select a zone"),
  fullscreen: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function EditAnnouncementForm({ id }: { id: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      displayLocations: [],
      type: "regular",
      startDate: new Date(),
      endDate: new Date(),
      zones: "All",
      fullscreen: true,
    },
  });
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAnnouncementById(id);
        if (!data) throw new Error("Content not found");
        form.reset({
          title: data.title || "",
          content: data.content || "",
          displayLocations: data.displayLocations || [],
          type: data.type,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          zones: Array.isArray(data.zones)
            ? data.zones[0]
            : typeof data.zones === "string"
            ? data.zones
            : "All",
          fullscreen: data.fullscreen,
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
      await updateAnnouncement(id, {
        ...values,
        masjidId,
        fullscreen: values.fullscreen,
        data: { content: values.content },
        zones: values.zones,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
      toast({
        title: "Announcement updated!",
        description: "Your changes have been saved.",
      });
      router.push("/dashboard/content-library#announcement-table");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update announcement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4"
      >
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Edit Announcement</h2>
          <Link
            href="/dashboard/content-library"
            className="text-md text-[#550C18] hover:underline"
          >
            <Button
              variant={"outline"}
              size={"sm"}
              className="text-md text-[#550C18] hover:bg-[#550C18]/10"
            >
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select_type" disabled>
                      Select Type
                    </SelectItem>
                    {typeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <EditorComponent
                  content={field.value}
                  setContent={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
                <FormLabel>Display Mode</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "fullscreen")
                    }
                    defaultValue={field.value ? "fullscreen" : "split"}
                    value={field.value ? "fullscreen" : "split"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                      <SelectItem value="split">Split</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
        {/* Schedule Section */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-xl font-bold mb-2">Schedule</h3>
          <div className="grid grid-cols-3 gap-4">
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
          </div>
        </div>
        <div className="flex flex-row w-full">
          <Button
            size={"lg"}
            type="submit"
            className="ml-auto text-md"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
