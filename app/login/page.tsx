"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { authSchema, type AuthFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Mode = "sign-in" | "sign-up";

function getUnexpectedAuthErrorMessage(error: unknown) {
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return "Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local, make sure the project is active, then restart npm run dev.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication failed. Check your Supabase settings and try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    setConfirmEmailSent(false);
    setFormError(null);

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) {
          setFormError(error.message);
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setFormError(error.message);
          toast.error(error.message);
          return;
        }
        if (data.session) {
          toast.success("Account created!");
          router.push("/dashboard");
          router.refresh();
        } else {
          setConfirmEmailSent(true);
          toast.success("Check your email to confirm your account.");
        }
      }
    } catch (error) {
      const message = getUnexpectedAuthErrorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-500 to-brand-300 p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Briefcase className="h-5 w-5" />
          </div>
          Job Application Tracker
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-semibold leading-tight">
            Stay organized. Land the role.
          </h1>
          <p className="text-white/80">
            Track every application, interview, and recruiter conversation in one elegant,
            executive-grade dashboard — synced securely across all your devices.
          </p>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} Job Application Tracker</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold">Job Application Tracker</h1>
          </div>

          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setFormError(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "sign-in"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("sign-up");
                setFormError(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "sign-up"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="mb-1 text-2xl font-semibold tracking-tight">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "sign-in"
              ? "Sign in to access your application tracker."
              : "Start tracking your job search in minutes."}
          </p>

          {confirmEmailSent ? (
            <div className="rounded-lg border border-border bg-muted p-4 text-sm text-foreground">
              We sent a confirmation link to your email. Confirm your address, then sign in.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {formError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                  {formError}
                </div>
              ) : null}
              <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </Field>
              <Field label="Password" htmlFor="password" error={errors.password?.message} required>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  {...register("password")}
                />
              </Field>
              <Button type="submit" className="w-full" loading={loading}>
                {mode === "sign-in" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
