import { UploadForm } from "@/components/track/UploadForm";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Upload Track</h1>
      <UploadForm />
    </div>
  );
}
