import { Home, Users, Briefcase, CheckSquare, Settings, BarChart3, UserCog, LogOut, Clock, Share2, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserAvatar } from "./user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Briefcase,
    roles: ["admin"],
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: Clock,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Social Profiles",
    url: "/social-profiles",
    icon: Share2,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Posting Schedule",
    url: "/posting-schedule",
    icon: Calendar,
    roles: ["admin", "manager", "employee"],
  },
  {
    title: "Admin",
    url: "/admin",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["admin", "manager", "employee"],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || "User";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <div>
            <h1 className="font-semibold text-base">Launch CRM</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => {
                const userRole = user?.role || "employee";
                return item.roles.includes(userRole);
              }).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3">
          <UserAvatar name={userName} imageUrl={user?.profileImageUrl} className="h-9 w-9" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <Badge variant="secondary" className="text-xs mt-0.5 capitalize">
              {user?.role || "employee"}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={async () => {
            try {
              await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
              });
              queryClient.clear();
              window.location.href = "/login";
            } catch (error) {
              console.error("Logout error:", error);
              window.location.href = "/login";
            }
          }}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
