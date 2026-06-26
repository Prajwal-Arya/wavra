import { StatsDashboard } from "@/components/stats/StatsDashboard";

export default function StatsPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Wrapped</h1>
      <StatsDashboard />
    </div>
  );
}
