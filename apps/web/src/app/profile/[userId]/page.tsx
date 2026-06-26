import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage({ params }: { params: { userId: string } }) {
  return (
    <div className="p-4 md:p-8">
      <ProfileView userId={params.userId} />
    </div>
  );
}
