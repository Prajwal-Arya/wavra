import { ImportForm } from "@/components/track/ImportForm";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Import Track</h1>
      <ImportForm />
    </div>
  );
}
