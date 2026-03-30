import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, FolderKanban, TrendingDown, Ruler, Package, Wind, ShoppingCart, Calendar } from "lucide-react";
import type { Fabric, Project, FabricUsage, Notion, Thread } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ShoppingListItem = {
  id: number;
  type: string;
  name: string;
  remaining: number;
  unit: string;
  supplier?: string | null;
};

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDeadlineDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Dashboard() {
  const { data: fabrics, isLoading: fabricsLoading } = useQuery<Fabric[]>({
    queryKey: ["/api/fabrics"],
  });
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const { data: usages, isLoading: usagesLoading } = useQuery<FabricUsage[]>({
    queryKey: ["/api/usages"],
  });
  const { data: notions, isLoading: notionsLoading } = useQuery<Notion[]>({
    queryKey: ["/api/notions"],
  });
  const { data: threads, isLoading: threadsLoading } = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
  });
  const { data: shoppingList, isLoading: shoppingLoading } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping-list"],
  });

  const isLoading =
    fabricsLoading || projectsLoading || usagesLoading || notionsLoading || threadsLoading;

  const totalFabrics = fabrics?.length ?? 0;
  const activeProjects = projects?.filter((p) => p.status === "active").length ?? 0;
  const totalUsedM = usages?.reduce((sum, u) => sum + u.lengthUsedM, 0) ?? 0;
  const totalRemainingM = fabrics?.reduce((sum, f) => sum + f.remainingLengthM, 0) ?? 0;
  const totalNotions = notions?.length ?? 0;
  const totalThreads = threads?.length ?? 0;

  const lowStockFabrics =
    fabrics?.filter((f) => f.remainingLengthM < f.totalLengthM * 0.2 && f.remainingLengthM > 0) ?? [];

  const recentUsages = usages?.slice(0, 5) ?? [];

  // Upcoming deadlines: projects with deadline, sorted by closest, top 5
  const upcomingDeadlines = (projects ?? [])
    .filter((p) => p.deadline)
    .map((p) => ({
      project: p,
      days: getDaysUntilDeadline(p.deadline!),
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const stats = [
    {
      title: "Тканей в запасе",
      value: totalFabrics,
      icon: Scissors,
      desc: "наименований",
    },
    {
      title: "Активных проектов",
      value: activeProjects,
      icon: FolderKanban,
      desc: "в работе",
    },
    {
      title: "Израсходовано",
      value: `${totalUsedM.toFixed(1)} м`,
      icon: TrendingDown,
      desc: "всего",
    },
    {
      title: "Остаток",
      value: `${totalRemainingM.toFixed(1)} м`,
      icon: Ruler,
      desc: "на складе",
    },
    {
      title: "Фурнитура",
      value: totalNotions,
      icon: Package,
      desc: "наименований",
    },
    {
      title: "Нити",
      value: totalThreads,
      icon: Wind,
      desc: "наименований",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        <h1 className="text-xl font-semibold">Обзор</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h1 className="text-xl font-semibold" data-testid="text-page-title">Обзор</h1>

      {/* Stats grid: 2 cols on sm, 3 on md/lg */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title}`}>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail sections 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock fabrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Заканчивающиеся ткани</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockFabrics.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Все ткани в достаточном количестве
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockFabrics.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between text-sm"
                    data-testid={`row-low-stock-${f.id}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="size-3 rounded-full shrink-0 border border-border"
                        style={{ backgroundColor: f.colorHex ?? (f.color.startsWith("#") ? f.color : undefined) }}
                      />
                      <span className="truncate font-medium">{f.name}</span>
                    </div>
                    <span className="text-destructive font-medium whitespace-nowrap ml-2">
                      {f.remainingLengthM.toFixed(2)} м
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent usages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Последний расход</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Нет записей о расходе
              </p>
            ) : (
              <div className="space-y-3">
                {recentUsages.map((u) => {
                  const fabric = fabrics?.find((f) => f.id === u.fabricId);
                  const project = projects?.find((p) => p.id === u.projectId);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between text-sm"
                      data-testid={`row-recent-usage-${u.id}`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{fabric?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {project?.name ?? "Без проекта"} · {new Date(u.usedAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <span className="font-medium whitespace-nowrap ml-2">
                        −{u.lengthUsedM.toFixed(2)} м
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopping list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Список закупок</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {shoppingLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : !shoppingList || shoppingList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Запасы в порядке
              </p>
            ) : (
              <div className="space-y-2.5">
                {shoppingList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between text-sm gap-2"
                    data-testid={`row-shopping-${item.id}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-normal py-0">{item.type}</Badge>
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      {item.supplier && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.supplier}</p>
                      )}
                    </div>
                    <span className="text-destructive font-medium whitespace-nowrap text-xs mt-0.5">
                      {typeof item.remaining === "number" ? item.remaining.toFixed(2) : item.remaining} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Ближайшие дедлайны</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Нет проектов с дедлайнами
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map(({ project, days }) => {
                  const isOverdue = days < 0;
                  const isSoon = days >= 0 && days <= 3;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between text-sm gap-2"
                      data-testid={`row-deadline-${project.id}`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDeadlineDate(project.deadline!)}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : isSoon
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isOverdue
                          ? `просрочен ${Math.abs(days)} дн.`
                          : days === 0
                          ? "сегодня"
                          : `${days} дн.`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
