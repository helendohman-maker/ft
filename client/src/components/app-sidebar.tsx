import {
  Scissors, FolderKanban, ClipboardList, LayoutDashboard,
  Heart, Puzzle, Spline, BookOpen
} from "lucide-react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Обзор", url: "/", icon: LayoutDashboard },
  { title: "Ткани", url: "/fabrics", icon: Scissors },
  { title: "Фурнитура", url: "/notions", icon: Puzzle },
  { title: "Нити", url: "/threads", icon: Spline },
  { title: "Выкройки", url: "/patterns", icon: BookOpen },
];

const projectNav = [
  { title: "Проекты", url: "/projects", icon: FolderKanban },
  { title: "Расход", url: "/usages", icon: ClipboardList },
  { title: "Вишлист", url: "/wishlist", icon: Heart },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Трекер тканей">
            <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <path d="M8 12h16M8 16h16M8 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" opacity="0.5" />
            <path d="M12 8v16M20 8v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" opacity="0.3" />
          </svg>
          <span className="text-base font-semibold tracking-tight">Трекер тканей</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Материалы</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url !== "/" && location.startsWith(item.url))}
                  >
                    <Link href={item.url} data-testid={`nav-${item.url.replace("/", "") || "home"}`}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Планирование</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url !== "/" && location.startsWith(item.url))}
                  >
                    <Link href={item.url} data-testid={`nav-${item.url.replace("/", "") || "home"}`}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
