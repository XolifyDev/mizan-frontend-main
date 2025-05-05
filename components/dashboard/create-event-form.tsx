"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"
import { createEvent, updateEvent } from "@/lib/actions/events"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "../ui/tooltip"
import EditorComponent from "../markdown-editor/EditorComponent"
import { Switch } from "@/components/ui/switch"
import { getUserMasjid } from "@/lib/actions/masjid"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Event title must be at least 2 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required.",
  }),
  timeStart: z.string().min(1, {
    message: "Start time is required.",
  }),
  timeEnd: z.string().min(1, {
    message: "End time is required.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  type: z.string().min(2, {
    message: "Event type is required.",
  }),
  tagColor: z.string().min(1, {
    message: "Tag color is required.",
  }),
  syncToGoogleCalendar: z.boolean().default(false),
})

type Event = {
  id: string;
  title: string;
  date: Date;
  timeStart: Date;
  timeEnd: Date;
  location: string;
  description: string;
  type: string;
  tagColor: string;
  masjidId: string;
  createdAt: Date;
  updatedAt: Date;
  syncToGoogleCalendar: boolean;
  googleCalendarEventId: string | null;
  lastSyncedAt: Date | null;
  syncStatus: string | null;
};

interface CreateEventFormProps {
  onSuccess: () => void
  masjidId: string
  initialData?: Event
  isEditMode?: boolean
}

export function CreateEventForm({ 
  onSuccess, 
  masjidId, 
  initialData,
  isEditMode = false 
}: CreateEventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [masjid, setMasjid] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadMasjid = async () => {
      const m = await getUserMasjid();
      setMasjid(m);
    };
    loadMasjid();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
      timeStart: initialData?.timeStart ? new Date(initialData.timeStart).toTimeString().slice(0, 5) : "",
      timeEnd: initialData?.timeEnd ? new Date(initialData.timeEnd).toTimeString().slice(0, 5) : "",
      location: initialData?.location || "",
      description: initialData?.description || `<h2 class="tiptap-heading" style="text-align: center">Hello world 🌍</h2>`,
      type: initialData?.type || "",
      tagColor: initialData?.tagColor || "#550C18",
      syncToGoogleCalendar: initialData?.syncToGoogleCalendar || false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const eventData = {
        ...values,
        masjidId,
        date: new Date(values.date + 'T00:00:00'),
        timeStart: new Date(`2000-01-01T${values.timeStart}`),
        timeEnd: new Date(`2000-01-01T${values.timeEnd}`),
        syncStatus: values.syncToGoogleCalendar ? 'pending' : null,
      };

      console.log(eventData);

      if (isEditMode && initialData) {
        await updateEvent(initialData.id, eventData);
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        await createEvent(eventData);
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update event" : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeStart"
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
            name="timeEnd"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-medium border-b w-full">Event Tag</h1>
          <div className="grid grid-cols-2 gap-2 items-center">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-1 h-full items-end">
              {["prayer", "education", "community", "youth", "other"].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="md"
                  onClick={() => form.setValue("type", type)}
                  className="capitalize"
                  type="button"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <FormField
            control={form.control}
            name="tagColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag Color</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
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
                <TooltipProvider>
                  <EditorComponent content={field.value} setContent={field.onChange} />
                </TooltipProvider>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {masjid?.googleCalendarId && (
          <FormField
            control={form.control}
            name="syncToGoogleCalendar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Sync with Google Calendar</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Automatically sync this event with your masjid's Google Calendar
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Event" : "Create Event"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 