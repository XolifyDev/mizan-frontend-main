"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils"
import { registerUser } from "@/lib/actions"

const MotionButton = motion.create(Button);

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
    termsAndConditions: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

export default function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [ButtonState, setButtonState] = useState("default");

  const states = {
    default: (
      <>
        <span className="text-sm text-white">Create account</span>
      </>
    ),
    loading: (
      <>
        {/* <div className="h-5 w-5 border-t border-b animate-spin rounded-full" /> */}
        <style>
          {`
                        .content-loader {
                            --uib-size: 20px !important;
                        }
                    `}
        </style>
        <div className="container-loader h-[20px] w-[20px] [&>.dot]:before:bg-white">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <span className="ml-2 text-sm text-white">Loading...</span>
      </>
    ),
    error: (
      <>
        <X size={20} />
        <span className="ml-2">Try Again</span>
      </>
    ),
    success: (
      <>
        <Check className="" size={20} />
        <span className="ml-2">Created Account!</span>
      </>
    ),
  };

  const stateVariants = {
    default: { opacity: 1 },
    error: {
      scale: [1.05, 1, 1.05],
      delay: "2s",
      opacity: 1,
    },
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAndConditions: false,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setButtonState("loading");

    try {
      const user = await registerUser({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        termsAndConditions: values.termsAndConditions,
        name: values.name
      })

      toast({
        title: "Account created successfully",
        description: "Welcome to Mizan!",
      });

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#3A3A3A]">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                  className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#3A3A3A]">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="your.email@example.com"
                  {...field}
                  className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18]"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#3A3A3A]">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18] pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3A3A]/70 hover:text-[#3A3A3A]"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormDescription className="text-xs text-[#3A3A3A]/70">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#3A3A3A]">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18] pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3A3A]/70 hover:text-[#3A3A3A]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAndConditions"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-[#550C18] data-[state=checked]:border-[#550C18] mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal text-[#3A3A3A]">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#550C18] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#550C18] hover:underline">
                    Privacy Policy
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <MotionButton
          transition={
            ButtonState === "error"
              ? {
                  repeat: Infinity,
                  repeatDelay: 1,
                }
              : {}
          }
          variant={ButtonState === "error" ? "destructive" : "default"}
          initial={{ opacity: 0 }}
          animate={
            ButtonState === "error"
              ? stateVariants.error
              : stateVariants.default
          }
          disabled={isLoading}
          className={cn(
            "w-full dark:text-white cursor-pointer bg-[#550C18] hover:bg-[#78001A]",
            ButtonState === "success" &&
              "bg-green-500 shadow-[rgb(34_197_94_/_var(--tw-bg-opacity))_0px_0px_15px] dark:shadow-[rgb(34_197_94_/_var(--tw-bg-opacity))_0px_0px_25px]",
            ButtonState === "error" &&
              "bg-red-500 shadow-[rgb(239_68_68_/_var(--tw-bg-opacity))_0px_0px_15px] dark:shadow-[rgb(239_68_68_/_var(--tw-bg-opacity))_0px_0px_25px] hover:bg-interit"
          )}
          whileHover={ButtonState !== "default" ? {} : { scale: 1.02 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              className="overflow-hidden relative flex justify-center items-center w-full"
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              key={ButtonState}
            >
              <span className="flex flex-row justify-center items-center w-full h-full relative">
                {/* @ts-ignore */}
                {states[ButtonState]}
              </span>
            </motion.span>
          </AnimatePresence>
        </MotionButton>
      </form>
    </Form>
  )
}

