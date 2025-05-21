"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Upload, X, Image as ImageIcon } from "lucide-react"
import { createEvent, updateEvent } from "@/lib/actions/events"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "../ui/tooltip"
import EditorComponent from "../markdown-editor/EditorComponent"
import { Switch } from "@/components/ui/switch"
import { getUserMasjid } from "@/lib/actions/masjid"
import Image from "next/image"
import { uploadFiles } from "@/lib/actions/uploadthing"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useForm as useReactHookForm, Controller } from "react-hook-form"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
  flyerUrl: z.string().optional(),
  tvFlyerUrl: z.string().optional(),
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
  flyerUrl: string | null;
  tvFlyerUrl: string | null;
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
  const [selectedFlyer, setSelectedFlyer] = useState<File | null>(null);
  const [selectedTvFlyer, setSelectedTvFlyer] = useState<File | null>(null);
  const router = useRouter();
  const [recurrenceModalOpen, setRecurrenceModalOpen] = useState(false);
  const [recurrence, setRecurrence] = useState<any>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [typeState, setType] = useState<string>("");

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
      flyerUrl: initialData?.flyerUrl || "",
      tvFlyerUrl: initialData?.tvFlyerUrl || "",
    },
  });

  const typeWatch = form.watch("type");

  useEffect(() => {
    if (masjidId) {
      const fetchMasjid = async () => {
        const masjid = await getUserMasjid();
        setMasjid(masjid);
      };
      fetchMasjid();
    }
  }, [masjidId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let flyerUrl = values.flyerUrl;
      let tvFlyerUrl = values.tvFlyerUrl;

      // Upload flyers if new files were selected
      if (selectedFlyer) {
        const formData = new FormData();
        const newFile = new File([selectedFlyer], `flyer-${new Date().getTime()}-${masjidId}-${values.title}-${Math.random().toString(36).substring(2, 15)}.${selectedFlyer.name.split('.').pop()}`, { type: selectedFlyer.type });
        formData.append("files", newFile);
        const response = await fetch("/api/uploadthing/", {
          method: "POST",
          body: formData,
        });
        const results = await response.json();
        console.log(results);
        if (results?.[0]?.data?.ufsUrl) {
          flyerUrl = results[0].data?.ufsUrl;
        }
      }

      if (selectedTvFlyer) {
        const formData = new FormData();
        const newFile = new File([selectedTvFlyer], `tv-flyer-${new Date().getTime()}-${masjidId}-${values.title}-${Math.random().toString(36).substring(2, 15)}.${selectedTvFlyer.name.split('.').pop()}`, { type: selectedTvFlyer.type });
        formData.append("files", newFile);        
        const response = await fetch("/api/uploadthing/", {
          method: "POST",
          body: formData,
        });
        const results = await response.json();
        console.log(results);
        if (results?.[0]?.data?.ufsUrl) {
          tvFlyerUrl = results[0].data?.ufsUrl;
        }
      }

      const start = new Date(`2000-01-01T${values.timeStart}`);
      const end = new Date(`2000-01-01T${values.timeEnd}`);
      if (end <= start) {
        if (!(end.getHours() === 0 && end.getMinutes() === 0)) {
          setTimeError("End time must be after start time, or set to 12:00am for overnight events.");
          setIsLoading(false);
          return;
        }
      }
      setTimeError(null);

      const eventData = {
        ...values,
        masjidId,
        date: new Date(values.date + 'T00:00:00'),
        timeStart: start,
        timeEnd: end,
        syncToGoogleCalendar: values.syncToGoogleCalendar,
        syncStatus: values.syncToGoogleCalendar ? 'pending' : null,
        flyerUrl,
        tvFlyerUrl,
        recurrence,
      };

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

        <div className="flex flex-col w-full h-full">
          {recurrence && (
            <div className="flex flex-row w-full justify-between mt-auto">
              <div className="text-xs text-[#550C18] mt-auto">Recurs: {recurrence.summary}</div>
              <Link href="javascript:void(0)" onClick={() => setRecurrence(null)} className="text-[#550C18] text-xs underline hover:text-[#78001A]">
                Remove Recurrence
              </Link>
            </div>
          )}
          {timeError && <div className="text-xs text-red-600 mt-1">{timeError}</div>}
          <Button className={cn("animate-in fade-in-0", recurrence ? "mt-1" : "mt-auto")} type="button" variant="outline" onClick={() => setRecurrenceModalOpen(true)}>
            Custom Recurrence
          </Button>
        </div>
          <Dialog open={recurrenceModalOpen} onOpenChange={setRecurrenceModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Custom recurrence</DialogTitle>
              </DialogHeader>
              <RecurrenceForm
                value={recurrence}
                onChange={setRecurrence}
                onDone={() => setRecurrenceModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-medium border-b w-full">Event Tag</h1>
          <div className="grid grid-cols-2 gap-2 items-center">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row gap-2 text-center items-center">
                    <FormLabel>Event Type</FormLabel>
                    <FormDescription>(Select from list or enter custom)</FormDescription>
                  </div>
                  <FormControl>
                    <Input placeholder="Enter event type" {...field} onChange={(e) => {
                      setType(e.target.value);
                      field.onChange(e.target.value);
                    }} />
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
                  onClick={() => {
                    setType(type);
                    form.setValue("type", type);
                  }}
                  className={cn("capitalize", typeState === type && "bg-[#550C18] text-white", typeState.length > 0 && type === "other" && !["prayer", "education", "community", "youth"].includes(typeState) && typeState !== type && "bg-[#550C18] text-white")}
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="flyerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Flyer</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="flyer-upload"
                          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 relative overflow-hidden ${
                            (field.value || selectedFlyer) ? 'border-primary' : ''
                          }`}
                        >
                          {(field.value || selectedFlyer) ? (
                            <>
                              <div className="relative w-full h-full">
                                <Image
                                  src={field.value || URL.createObjectURL(selectedFlyer!)}
                                  alt="Event flyer"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <div className="flex flex-col items-center text-white">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <p className="text-sm">Click to change</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG or GIF (MAX. 4MB)
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Recommended: 1080 x 1080 pixels
                              </p>
                            </div>
                          )}
                          <input
                            id="flyer-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFlyer(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {(field.value || selectedFlyer) && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedFlyer(null);
                            form.setValue('flyerUrl', '');
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Flyer
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a flyer for the event (max 4MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tvFlyerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TV Display Flyer</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="tv-flyer-upload"
                          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 relative overflow-hidden ${
                            (field.value || selectedTvFlyer) ? 'border-primary' : ''
                          }`}
                        >
                          {(field.value || selectedTvFlyer) ? (
                            <>
                              <div className="relative w-full h-full">
                                <Image
                                  src={field.value || URL.createObjectURL(selectedTvFlyer!)}
                                  alt="TV event flyer"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <div className="flex flex-col items-center text-white">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <p className="text-sm">Click to change</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG or GIF (MAX. 4MB)
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Recommended: 1920 x 1080 pixels (16:9)
                              </p>
                            </div>
                          )}
                          <input
                            id="tv-flyer-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedTvFlyer(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {(field.value || selectedTvFlyer) && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedTvFlyer(null);
                            form.setValue('tvFlyerUrl', '');
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Flyer
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a flyer optimized for TV display (max 4MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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

function RecurrenceForm({ value, onChange, onDone }: any) {
  const [frequency, setFrequency] = useState(value?.frequency || 'week');
  const [interval, setInterval] = useState(value?.interval || 1);
  const [byDay, setByDay] = useState(value?.byDay || []);
  const [endsType, setEndsType] = useState(value?.ends?.type || 'never');
  const [endsOn, setEndsOn] = useState(value?.ends?.on || '');
  const [endsAfter, setEndsAfter] = useState(value?.ends?.after || 1);

  const days = [
    { label: 'S', value: 'SU' },
    { label: 'M', value: 'MO' },
    { label: 'T', value: 'TU' },
    { label: 'W', value: 'WE' },
    { label: 'T', value: 'TH' },
    { label: 'F', value: 'FR' },
    { label: 'S', value: 'SA' },
  ];

  function toggleDay(day: string) {
    setByDay((prev: string[]) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleDone() {
    // Generate summary
    let summary = `Repeats every ${interval} ${frequency}${interval > 1 ? 's' : ''}`;
    if (frequency === 'week' && byDay.length > 0) {
      summary += ' on ' + byDay.map((d) => days.find((x) => x.value === d)?.label).join(', ');
    }
    if (endsType === 'on' && endsOn) summary += ` until ${endsOn}`;
    if (endsType === 'after') summary += ` for ${endsAfter} occurrences`;
    if (endsType === 'never') summary += ', never ends';
    onChange({ frequency, interval, byDay, ends: { type: endsType, on: endsOn, after: endsAfter }, summary });
    onDone();
  }

  return (
    <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleDone(); }}>
      <div className="flex items-center gap-2">
        <span>Repeat every</span>
        <input
          type="number"
          min={1}
          value={interval}
          onChange={e => setInterval(Number(e.target.value))}
          className="w-16 border rounded px-2 py-1 bg-transparent text-center"
        />
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          className="border rounded px-2 py-1 bg-transparent"
        >
          <option value="day">day</option>
          <option value="week">week</option>
          <option value="month">month</option>
          <option value="year">year</option>
        </select>
      </div>
      {frequency === 'week' && (
        <div>
          <div className="mb-1">Repeat on</div>
          <div className="flex gap-2">
            {days.map((d) => (
              <button
                type="button"
                key={d.value}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${byDay.includes(d.value) ? 'bg-[#550C18] text-white' : 'bg-[#9f253a] text-gray-100'}`}
                onClick={() => toggleDay(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="mb-1">Ends</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="radio" checked={endsType === 'never'} onChange={() => setEndsType('never')} /> Never
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={endsType === 'on'} onChange={() => setEndsType('on')} /> On
            <input
              type="date"
              value={endsOn}
              onChange={e => setEndsOn(e.target.value)}
              disabled={endsType !== 'on'}
              className="border rounded px-2 py-1 bg-transparent"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={endsType === 'after'} onChange={() => setEndsType('after')} /> After
            <input
              type="number"
              min={1}
              value={endsAfter}
              onChange={e => setEndsAfter(Number(e.target.value))}
              disabled={endsType !== 'after'}
              className="w-16 border rounded px-2 py-1 bg-transparent"
            />
            occurrences
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onDone}>Cancel</Button>
        <Button className="bg-[#550C18] hover:bg-[#78001A] text-white" type="button" onClick={handleDone}>Done</Button>
      </div>
    </form>
  );
} 