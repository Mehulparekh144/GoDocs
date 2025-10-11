"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { type User } from "@/hooks/use-auth";
import { axiosClient } from "@/lib/axios-client";
import { useMutation } from "@tanstack/react-query";
import { FileIcon, LogOutIcon, ShareIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const menuItems = [
  {
    label: "My Documents",
    href: "/dashboard",
    icon: FileIcon,
  },
  {
    label: "Shared with me",
    href: "/dashboard/shared-with-me",
    icon: ShareIcon,
  },
];

export const AppSidebar = ({ user }: { user: User }) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await axiosClient.post("/auth/logout");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleLogout,
    onSuccess: async () => {
      localStorage.removeItem("accessToken");
      delete axiosClient.defaults.headers.common.Authorization;
      window.location.href = "/get-started";
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      {!pathname?.startsWith("/dashboard/document/") ? (
        <Sidebar variant="floating">
          <SidebarHeader className="p-4">
            <h1 className="text-2xl font-bold">
              Go<span className="text-primary">Docs</span>
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" /> {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <UserInfo
                  auth={user}
                  isLoading={isPending}
                  onLogout={() => mutate()}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      ) : null}
    </>
  );
};

const UserInfo = ({
  auth,
  isLoading,
  onLogout,
}: {
  auth: User | undefined;
  isLoading: boolean;
  onLogout: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isLoading ? (
          <Skeleton className="h-10 w-full rounded-md" />
        ) : (
          <div className="bg-card flex w-full items-center justify-start gap-2 rounded-md border px-4 py-1.5">
            <div className="bg-secondary ring-border mr-2 rounded-md p-1 ring-1">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start">
              {auth?.name}
              <span className="text-muted-foreground text-xs">
                {auth?.email}
              </span>
            </div>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
        <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
          <LogOutIcon className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
