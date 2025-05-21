"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { createContentWithConfig } from "@/lib/actions/content";
import { Combobox } from "@/components/ui/combobox";

const displayLocations = [
  { value: "MizanTv", label: "Mizan TV Screens" },
  { value: "MizanAdhaan", label: "Mizan Adhaan Phone App" },
  { value: "MizanDonations", label: "Mizan Donation Kiosk" },
  { value: "MizanFrame", label: "Mizan Frame" },
  { value: "website", label: "Masjid website" },
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  displayLocations: z.array(z.string()).min(1, "Select at least one location"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateEidCountdownForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", displayLocations: [] },
  });
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";
  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    await createContentWithConfig({
      masjidId,
      ...values,
      type: "eid_countdown",
      data: {},
    });
    router.push("/dashboard/content-library");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold mb-4">Add Eid Countdown</h2>
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
        <Button type="submit" className="bg-[#550C18] text-white px-4 py-2 rounded">Add</Button>
      </form>
    </Form>
  );
} 