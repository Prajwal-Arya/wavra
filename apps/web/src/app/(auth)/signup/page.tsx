import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
      <SignupForm />
    </div>
  );
}
