import Sidebar from "@/components/Sidebar";
import { getCurrentEmployee } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, employee } = await getCurrentEmployee();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userName={employee?.name}
        userEmail={email}
        userTeam={employee?.team}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
