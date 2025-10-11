"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Suspense } from "react";
import { ScreenLoader } from "@/components/screen-loader";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (error) {
    window.location.href = "/get-started";
  }

  return (
    <SidebarProvider>
      <Suspense fallback={<ScreenLoader />}>
        <AppSidebar user={user!} />
      </Suspense>
      <main className="h-screen w-full">{children}</main>
    </SidebarProvider>
  );
}
