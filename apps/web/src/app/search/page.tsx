import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";

export default function SearchPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">Loading search...</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
