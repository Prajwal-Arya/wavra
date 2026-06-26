"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getRequestErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/authStore";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);
    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      router.push("/");
      router.refresh();
    } catch (error) {
      setError(getRequestErrorMessage(error, "Login failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-white/10 bg-panel p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-accent">Welcome back</p>
        <p className="mt-1 text-sm text-zinc-400">Log in to upload tracks and build playlists.</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />
        {error ? <p className="text-sm text-coral">{error}</p> : null}
        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-400">
        New here?{" "}
        <Link className="font-semibold text-white hover:text-accent" href="/signup">
          Create account
        </Link>
      </p>
    </div>
  );
}
