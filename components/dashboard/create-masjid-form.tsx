"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Building2, Loader2, MapPin, Home, MapIcon as City, Map } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OpenStreetMapAddressAutocomplete } from "./openstreetmap-address-autocomplete"
import { createMasjid } from "@/lib/actions/masjid"
import { useRouter } from "next/navigation"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Masjid name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  state: z.string().min(2, {
    message: "State is required.",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

interface CreateMasjidFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateMasjidForm({ isOpen, onClose, onSuccess }: CreateMasjidFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      description: "",
      latitude: 0,
      longitude: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // @ts-ignore Ignore
      const result = await createMasjid({
        ...values,
      })

      if (!result || result.error) {
        toast({
          title: "Error creating masjid",
          description: result?.message || "Please try again later.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Masjid created successfully",
        description: `${values.name} has been created.`,
      })

      setTimeout(() => {
        router.refresh();
      }, 500)

      form.reset()
    } catch (error) {
      console.error("Error creating masjid:", error)
      toast({
        title: "Error creating masjid",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <DialogContent className="sm:max-w-[600px] p-0 border-0 rounded-lg overflow-hidden">
        <div className="bg-[#550C18] text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6" />
            <DialogTitle className="text-2xl font-bold">Create New Masjid</DialogTitle>
          </div>
          <DialogDescription className="text-white/80">
            Fill in the details below to create a new masjid in your account.
            <br />
            <br />
            <span className="text-white/80">
              <b>Note:</b> If you are a mizan home owner, and not a masjid, You can manage your home in the <Link href="https://home.mizan.app" className="text-white underline">Home Dashboard</Link> website.
            </span>
          </DialogDescription>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#550C18]" />
                      Masjid Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter masjid name"
                        {...field}
                        className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-[#550C18]" />
                        Address
                      </FormLabel>
                      <OpenStreetMapAddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        error={!!form.formState.errors.address}
                        disabled={isLoading}
                        onAddressSelect={(addressData) => {
                          // Update all address-related fields
                          form.setValue("address", addressData.fullAddress)
                          form.setValue("city", addressData.city)
                          form.setValue("state", addressData.state)
                          form.setValue("zipCode", addressData.zipCode)
                          form.setValue("latitude", addressData.latitude)
                          form.setValue("longitude", addressData.longitude)
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name="city" */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel className="flex items-center gap-2"> */}
                {/*         <City className="h-4 w-4 text-[#550C18]" /> */}
                {/*         City */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*         <Input */}
                {/*           placeholder="City" */}
                {/*           {...field} */}
                {/*           className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]" */}
                {/*           readOnly */}
                {/*         /> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}
                {/**/}
                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name="state" */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel className="flex items-center gap-2"> */}
                {/*         <Map className="h-4 w-4 text-[#550C18]" /> */}
                {/*         State */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*         <Input */}
                {/*           placeholder="State" */}
                {/*           {...field} */}
                {/*           className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]" */}
                {/*           readOnly */}
                {/*         /> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}
                {/**/}
                {/* <FormField */}
                {/*   control={form.control} */}
                {/*   name="zipCode" */}
                {/*   render={({ field }) => ( */}
                {/*     <FormItem> */}
                {/*       <FormLabel className="flex items-center gap-2"> */}
                {/*         <MapPin className="h-4 w-4 text-[#550C18]" /> */}
                {/*         Zip Code */}
                {/*       </FormLabel> */}
                {/*       <FormControl> */}
                {/*         <Input */}
                {/*           placeholder="Zip Code" */}
                {/*           {...field} */}
                {/*           className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]" */}
                {/*           readOnly */}
                {/*         /> */}
                {/*       </FormControl> */}
                {/*       <FormMessage /> */}
                {/*     </FormItem> */}
                {/*   )} */}
                {/* /> */}
              </div>

              {/* <FormField */}
              {/*   control={form.control} */}
              {/*   name="country" */}
              {/*   render={({ field }) => ( */}
              {/*     <FormItem> */}
              {/*       <FormLabel className="flex items-center gap-2"> */}
              {/*         <MapPin className="h-4 w-4 text-[#550C18]" /> */}
              {/*         Country */}
              {/*       </FormLabel> */}
              {/*       <Select onValueChange={field.onChange} defaultValue={field.value}> */}
              {/*         <FormControl> */}
              {/*           <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]"> */}
              {/*             <SelectValue placeholder="Select a country" /> */}
              {/*           </SelectTrigger> */}
              {/*         </FormControl> */}
              {/*         <SelectContent> */}
              {/*           <SelectItem value="United States">United States</SelectItem> */}
              {/*           <SelectItem value="Canada">Canada</SelectItem> */}
              {/*           <SelectItem value="United Kingdom">United Kingdom</SelectItem> */}
              {/*           <SelectItem value="Australia">Australia</SelectItem> */}
              {/*           <SelectItem value="Other">Other</SelectItem> */}
              {/*         </SelectContent> */}
              {/*       </Select> */}
              {/*       <FormMessage /> */}
              {/*     </FormItem> */}
              {/*   )} */}
              {/* /> */}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of your masjid"
                        className="resize-none border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 border-t border-gray-100">
                <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Masjid"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
  )
}
