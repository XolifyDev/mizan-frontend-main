"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { loginUser } from "@/lib/actions";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MotionButton = motion.create(Button);

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ButtonState, setButtonState] = useState("default");

  const states = {
    default: (
      <>
        <span className="text-sm text-white">Sign in</span>
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
        <span className="ml-2">Logged in!</span>
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
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setButtonState("loading");

    console.log("Sign in values:", values);

    try {
      const user = await loginUser({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe || false,
      });
      if (user && !user?.data) {
        console.log("NO USER", user);
        setIsLoading(false);
        setButtonState("error");
        toast({
          title: "Sign in failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });

        setTimeout(() => {
          setButtonState("default");
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }

    // const user = await authClient.signIn.email({
    //   email: values.email,
    //   password: values.password,
    //   rememberMe: true,
    // }, {
    //   onSuccess: (ctx) => {
    //     console.log(ctx);
    //     toast({
    //       title: "Sign in successful",
    //       description: "Welcome back to Mizan!",
    //     })
    //   },
    //   onError: (ctx) => {
    //     console.log("ERROR" , ctx);
    //   },
    // })

    // try {
    //   // This is where you would normally call your authentication API
    //   console.log("Sign in values:", values)
    //
    //   const user = await authClient.signIn.email({
    //     email: values.email,
    //     password: values.password,
    //     rememberMe: true,
    //   });
    //
    //   console.log(user);
    //
    //   if(user.error) {
    //     toast({
    //       title: "Sign in failed",
    //       description: "Please check your credentials and try again.",
    //       variant: "destructive",
    //     })
    //   } else if(user.data) {
    //     toast({
    //       title: "Sign in successful",
    //       description: "Welcome back to Mizan!",
    //     })
    //   }
    //   router.push("/dashboard")
    // } catch (error) {
    //   toast({
    //     title: "Sign in failed",
    //     description: "Please check your credentials and try again.",
    //     variant: "destructive",
    //   })
    // } finally {
    //   setIsLoading(false)
    // }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <FormLabel className="text-[#3A3A3A]">Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#550C18] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-[#550C18] data-[state=checked]:border-[#550C18]"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-[#3A3A3A] cursor-pointer">
                Remember me for 30 days
              </FormLabel>
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
        {/* <MotionButton type="submit" className="w-full bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isLoading}> */}
        {/*   {isLoading ? ( */}
        {/*     <> */}
        {/*       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
        {/*       Signing in... */}
        {/*     </> */}
        {/*   ) : ( */}
        {/*     "Sign in" */}
        {/*   )} */}
        {/* </MotionButton> */}
      </form>
    </Form>
  );
}
