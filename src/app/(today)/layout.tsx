import { TabBar } from "@/components/shared/tab-bar";

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Force-show all tabs as visual placeholder — will connect to real user data later */}
      <TabBar user={{ pathUnlocked: true, communityUnlocked: true }} />
    </>
  );
}
