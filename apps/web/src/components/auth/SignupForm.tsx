"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getRequestErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/authStore";

export function SignupForm() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);
    try {
      await signup({
        email: String(formData.get("email")),
        username: String(formData.get("username")),
        password: String(formData.get("password")),
        displayName: String(formData.get("displayName") || "")
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      setError(getRequestErrorMessage(error, "Signup failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-white/10 bg-panel p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-accent">Start listening</p>
        <p className="mt-1 text-sm text-zinc-400">Create an account to upload music and save playlists.</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="username" placeholder="Username" required />
        <Input name="displayName" placeholder="Display name" />
        <Input name="password" type="password" placeholder="Password" required minLength={8} />
        {error ? <p className="text-sm text-coral">{error}</p> : null}
        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? "Creating..." : "Sign Up"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link className="font-semibold text-white hover:text-accent" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
