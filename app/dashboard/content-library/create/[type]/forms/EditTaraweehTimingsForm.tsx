"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { getContentById, updateContent } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import GoogleColorPicker from "@/components/ui/google-color-picker";
import { Masjid } from "@prisma/client";
import { getMasjidById } from "@/lib/actions/masjids";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MizanAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizanDonations", label: "Mizan Donation Kiosk" },
  { value: "MizanFrame", label: "Mizan Frame" },
  { value: "website", label: "Masjid website" },
];

const dayTypeOptions = [
  "Daily",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
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

const zones = [
  "All",
  "Zone 1",
  "Zone 2",
  "Zone 3",
  "Zone 4",
  "Zone 5",
  "Zone 6",
  "Zone 7"
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  displayLocations: z.array(z.string()).min(1, "Select at least one location"),
  fullscreen: z.boolean().optional(),
  zones: z.string().optional(),
  startDate: z.date(), 
  endDate: z.date(),
  timeType: z.string().min(1, "Time type required"),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  duration: z.string().min(1, "Duration required"),
  dayType: z.string().min(1, "Day type required"),
});

type FormValues = z.infer<typeof schema>;

type EditTaraweehTimingsFormProps = {
  contentId: string;
  onSuccess?: () => void;
};

export default function EditTaraweehTimingsForm({ contentId, onSuccess }: EditTaraweehTimingsFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
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
  const [loading, setLoading] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [backgroundType, setBackgroundType] = useState<string>("color");
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [showFajrMagrib, setShowFajrMagrib] = useState<boolean>(true);
  const [taraweehTimings, setTaraweehTimings] = useState([
    { label: "Taraweeh 1", time: "22:00", color: "#000000", imam: "Imam 1" },
    { label: "Taraweeh 2", time: "22:15", color: "#000000", imam: "Imam 2" },
  ]);
  const [timingsModalOpen, setTimingsModalOpen] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setContentLoading(true);
      const content = await getContentById(contentId);
      if (content) {
        form.reset({
          title: content.title,
          description: content.description || "",
          displayLocations: content.displayLocations,
          fullscreen: content.fullscreen,
          zones: content.zones || "All",
          startDate: new Date(content.startDate),
          endDate: new Date(content.endDate),
          timeType: content.data.timeType,
          startTime: content.data.startTime,
          endTime: content.data.endTime,
          duration: content.duration,
          dayType: content.data.dayType,
        });
        setTaraweehTimings(content.data.taraweehTimings || []);
        setBackgroundColor(content.data.backgroundColor || "#000000");
        setBackgroundImage(content.data.backgroundImage || "");
        setBackgroundType(content.data.backgroundType || "color");
        setShowFajrMagrib(content.data.showFajrMagrib);
      }
      setContentLoading(false);
    };
    fetchContent();
  }, [contentId, form]);

  useEffect(() => {
    const fetchMasjid = async () => {
      const masjid = await getMasjidById(masjidId);
      setMasjid(masjid);
    };
    fetchMasjid();
  }, [masjidId]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await updateContent(contentId, {
      masjidId,
      ...values,
      type: "taraweeh_timings",
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      description: "Taraweeh Timings",
      data: {
        timeType: values.timeType,
        dayType: values.dayType,
        startTime: values.startTime,
        endTime: values.endTime,
        taraweehTimings,
        backgroundColor,
        backgroundImage,
        backgroundType,
        showFajrMagrib,
      },
    });
    toast({
      title: "Content updated successfully",
      description: "Your content has been updated in the content library",
    });
    router.push("/dashboard/content-library#content-library-table");
    setLoading(false);
  };

  if (contentLoading) {
    return <div className="p-8 text-center">Loading content...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4">Edit Taraweeh Timings</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          <div className="flex flex-col gap-3 mt-auto">
            <div className="grid grid-cols-2 gap-4 items-center">
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
              <FormItem className="flex flex-row gap-2 items-center justify-center text-center mt-4">
                <FormLabel className="mt-2">Show Fajr and Magrib</FormLabel>
                <FormControl>
                  <Switch
                    defaultChecked={showFajrMagrib}
                    checked={showFajrMagrib}
                    onCheckedChange={setShowFajrMagrib}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
            <Tabs defaultValue="color" className="w-full" onValueChange={(value) => {
              setBackgroundType(value);
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="color">Background Color</TabsTrigger>
                <TabsTrigger value="image">Background Image</TabsTrigger>
              </TabsList>
              <TabsContent value="color">
              <FormItem className="flex flex-col gap-2">
                <FormControl>
                  <GoogleColorPicker
                    className="w-full"
                    value={backgroundColor}
                    onChange={(color) => {
                      setBackgroundColor(color);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              </TabsContent>
              <TabsContent value="image">
                <FormItem>
                  <FormLabel>Background Image URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="Enter image URL..."
                      onChange={(e) => {
                        setBackgroundImage(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </TabsContent>
            </Tabs>
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
                  <FormLabel>Display as</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? "fullscreen" : "split"}
                      onValueChange={(val) =>
                        field.onChange(val === "fullscreen")
                      }
                    >
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
            <Button
              type="button"
              variant="outline"
              className="mb-2 w-fit"
              onClick={() => setTimingsModalOpen(true)}
            >
              Edit Taraweeh Timings
            </Button>
            <Dialog open={timingsModalOpen} onOpenChange={setTimingsModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Taraweeh Timings</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  {taraweehTimings.map((timing, idx) => (
                    <div key={idx} className="flex flex-col gap-2 items-center w-full">
                      <div className="flex flex-row gap-2 w-full">
                        <Input
                          className="w-full"
                          value={timing.label}
                          onChange={e => {
                            const newArr = [...taraweehTimings];
                            newArr[idx].label = e.target.value;
                            setTaraweehTimings(newArr);
                          }}
                          placeholder="Label"
                        />
                        <Input
                          className="w-28"
                          type="time"
                          value={timing.time}
                          onChange={e => {
                            const newArr = [...taraweehTimings];
                            newArr[idx].time = e.target.value;
                            setTaraweehTimings(newArr);
                          }}
                          placeholder="Time"
                        />
                      </div>
                      <div className="flex flex-row gap-2 w-full">
                        <Input
                          className="w-full"
                          value={timing.imam}
                          onChange={e => {
                            const newArr = [...taraweehTimings];
                            newArr[idx].imam = e.target.value;
                            setTaraweehTimings(newArr);
                          }}
                          placeholder="Imam"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-36"
                          onClick={() => setTaraweehTimings(taraweehTimings.filter((_, i) => i !== idx))}
                          disabled={taraweehTimings.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <p className="text-muted-foreground w-full text-sm text-center">
                    To remove Imam, just leave it blank
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (taraweehTimings.length === 4) {
                        toast({
                          title: "Maximum 4 Taraweeh Timings",
                          description: "You can only add up to 4 Taraweeh Timings",
                        });
                      } else {
                        setTaraweehTimings([...taraweehTimings, { label: `Taraweeh ${taraweehTimings.length + 1}`, time: "22:00", color: "#000000", imam: "" }]);
                      }
                    }}
                  >
                    + Add Taraweeh Timing
                  </Button>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={() => setTimingsModalOpen(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col gap-2 w-full min-h-[250px]">
            <div
              className={cn("relative flex flex-col items-center justify-center flex-1 rounded-2xl border border-gray-200 shadow-lg overflow-hidden min-h-[320px]")}
              style={{
                backgroundColor: backgroundType === "color" ? backgroundColor : "transparent",
                backgroundImage: backgroundType === "image" ? `url(${backgroundImage})` : "none",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Main content */}
              <div className="flex flex-col items-center justify-center w-full h-full p-10 bg-gradient-to-b from-black/40 to-black/60">
                <div className="text-center mb-8 -mt-10">
                  <h3 className="text-2xl font-medium text-white/90 mb-2">{form.watch("title").toUpperCase()}</h3>
                  <div className="w-32 h-1 bg-white/30 mx-auto rounded-full"/>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
                  <AnimatePresence mode="popLayout">
                    {showFajrMagrib && (
                      <motion.div 
                        key="fajr"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, display: "flex" }}
                        transition={{ duration: 0.5, ease: "easeIn" }}
                        className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-3"
                      >
                        <span className="text-white/70 text-lg mb-1">FAJR</span>
                        <span className="text-2xl font-bold text-white">4:46 AM</span>
                      </motion.div>
                    )}
                    {showFajrMagrib && (
                      <motion.div 
                        key="magrib"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, display: "flex" }}
                        transition={{ duration: 0.5, ease: "easeIn" }}
                        className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-3"
                      >
                        <span className="text-white/70 text-lg mb-1">MAGHRIB</span>
                        <span className="text-2xl font-bold text-white">8:12 PM</span>
                      </motion.div>
                    )}
                    <div className="col-span-2 grid grid-cols-2 gap-8 w-full">
                      {taraweehTimings.map((timing, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, display: "flex" }}
                          exit={{ opacity: 0, y: -10, display: "none" }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className={cn(
                            "flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-2 justify-center text-center",
                            taraweehTimings.length === 3 && idx === 2 && "col-span-2 mx-auto w-[calc(50%-0.5rem)]"
                          )}
                        >
                          <span className="text-white/70 text-base mb-1">{timing.label.toUpperCase()}</span>
                          <span className="text-2xl font-bold text-white">{timing.time}</span>
                          {timing.imam.length > 0 && <span className="text-white/40 text-sm mb-1 font-sans">{timing.imam}</span>}
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Logos */}
              <div className="absolute bottom-4 right-4">
                <Image src="/mizan.svg" width={24} height={24} alt="Mizan Logo" className="" />
              </div>
              <div className="absolute bottom-3 left-3">
                <Image 
                  src={masjid?.logo || "/mizan.svg"} 
                  width={40} 
                  height={40} 
                  alt="Masjid Logo"
                  className="opacity-70" 
                />
              </div>
            </div>
          </div>
        </div>
        <br />
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
                        {dayTypeOptions.map((d) => (
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
        <div className="flex flex-row w-full items-center justify-end">
          <Button size={"lg"} type="submit" className="ml-auto text-md" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 