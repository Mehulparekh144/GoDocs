import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { getUser } from "@/app/actions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ScreenLoader } from "@/components/screen-loader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/get-started");
  }

  return (
    <SidebarProvider>
      <Suspense fallback={<ScreenLoader />}>
        <AppSidebar user={user} />
      </Suspense>
      <main className="h-screen w-full">{children}</main>
    </SidebarProvider>
  );
}
