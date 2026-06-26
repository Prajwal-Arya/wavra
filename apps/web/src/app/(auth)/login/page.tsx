import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Log In</h1>
      <LoginForm />
    </div>
  );
}
