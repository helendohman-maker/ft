import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, FabricUsage, Pattern, ProjectPattern } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, FolderKanban, Calendar, Link2, X, TrendingUp, TrendingDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STATUS_LABELS: Record<string, string> = {
  active: "Активный",
  completed: "Завершён",
  paused: "На паузе",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  completed: "secondary",
  paused: "outline",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getDeadlineStatus(deadline: string | null | undefined): "overdue" | "soon" | "ok" | null {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "soon";
  return "ok";
}

type ProjectCost = {
  totalCost: number;
  fabricCost: number;
  notionCost: number;
  threadCost: number;
};

function ProjectCostSection({ projectId, salePrice }: { projectId: number; salePrice: number | null }) {
  const { data: cost, isLoading } = useQuery<ProjectCost>({
    queryKey: [`/api/projects/${projectId}/cost`],
  });

  if (isLoading) return <div className="text-xs text-muted-foreground animate-pulse">Загрузка...</div>;
  if (!cost) return null;

  const profit = salePrice != null ? salePrice - cost.totalCost : null;

  return (
    <div className="border-t pt-2 mt-2 space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Расчёт стоимости</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Себестоимость</span>
        <span className="font-medium">{cost.totalCost.toFixed(0)} ₽</span>
      </div>
      {salePrice != null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Цена продажи</span>
          <span className="font-medium">{salePrice.toFixed(0)} ₽</span>
        </div>
      )}
      {profit != null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Прибыль</span>
          <span className={`font-semibold flex items-center gap-1 ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {profit >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {profit.toFixed(0)} ₽
          </span>
        </div>
      )}
    </div>
  );
}

function PatternSection({ projectId }: { projectId: number }) {
  const { toast } = useToast();
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string>("");

  const { data: projectPatterns, isLoading: ppLoading } = useQuery<ProjectPattern[]>({
    queryKey: [`/api/project-patterns/${projectId}`],
  });

  const { data: allPatterns } = useQuery<Pattern[]>({
    queryKey: ["/api/patterns"],
    enabled: linkOpen,
  });

  const linkMutation = useMutation({
    mutationFn: async (patternId: number) => {
      await apiRequest("POST", "/api/project-patterns", { projectId, patternId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/project-patterns/${projectId}`] });
      toast({ title: "Выкройка привязана" });
      setLinkOpen(false);
      setSelectedPatternId("");
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      await apiRequest("DELETE", `/api/project-patterns/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/project-patterns/${projectId}`] });
      toast({ title: "Выкройка отвязана" });
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  // Fetch pattern names for linked items — use all patterns if available
  const { data: allPatternsForDisplay } = useQuery<Pattern[]>({
    queryKey: ["/api/patterns"],
  });

  const linkedPatternNames =
    projectPatterns?.map((pp) => {
      const pat = allPatternsForDisplay?.find((p) => p.id === pp.patternId);
      return { linkId: pp.id, name: pat?.name ?? `Выкройка #${pp.patternId}` };
    }) ?? [];

  const alreadyLinkedIds = new Set(projectPatterns?.map((pp) => pp.patternId) ?? []);
  const availableToLink = allPatterns?.filter((p) => !alreadyLinkedIds.has(p.id)) ?? [];

  return (
    <div className="border-t pt-2 mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Выкройки</p>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setLinkOpen(true)}
          data-testid={`button-link-pattern-${projectId}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {ppLoading ? (
        <div className="text-xs text-muted-foreground animate-pulse">Загрузка...</div>
      ) : linkedPatternNames.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Нет привязанных выкроек</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {linkedPatternNames.map(({ linkId, name }) => (
            <div
              key={linkId}
              className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs rounded-full px-2 py-0.5"
            >
              <Link2 className="size-3 shrink-0" />
              <span className="truncate max-w-[120px]">{name}</span>
              <button
                className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => unlinkMutation.mutate(linkId)}
                data-testid={`button-unlink-pattern-${linkId}`}
                aria-label="Отвязать выкройку"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Привязать выкройку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {availableToLink.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {allPatterns === undefined ? "Загрузка..." : "Все выкройки уже привязаны или нет выкроек"}
              </p>
            ) : (
              <div>
                <Label>Выкройка</Label>
                <Select value={selectedPatternId} onValueChange={setSelectedPatternId}>
                  <SelectTrigger data-testid="select-pattern-to-link"><SelectValue placeholder="Выберите выкройку" /></SelectTrigger>
                  <SelectContent>
                    {availableToLink.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              className="w-full"
              disabled={!selectedPatternId || linkMutation.isPending}
              onClick={() => selectedPatternId && linkMutation.mutate(parseInt(selectedPatternId))}
              data-testid="button-confirm-link-pattern"
            >
              {linkMutation.isPending ? "Сохранение..." : "Привязать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ProjectFormState = {
  name: string;
  description: string;
  status: string;
  deadline: string;
  salePrice: string;
  notes: string;
};

const EMPTY_FORM: ProjectFormState = {
  name: "",
  description: "",
  status: "active",
  deadline: "",
  salePrice: "",
  notes: "",
};

function ProjectDialog({
  open,
  onOpenChange,
  editProject,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editProject?: Project | null;
}) {
  const { toast } = useToast();
  const isEdit = !!editProject;

  const [form, setForm] = useState<ProjectFormState>(() =>
    editProject
      ? {
          name: editProject.name,
          description: editProject.description ?? "",
          status: editProject.status,
          deadline: editProject.deadline ?? "",
          salePrice: editProject.salePrice != null ? String(editProject.salePrice) : "",
          notes: editProject.notes ?? "",
        }
      : EMPTY_FORM
  );

  // Sync form when editProject changes
  const [lastEditId, setLastEditId] = useState<number | null>(null);
  if (editProject && editProject.id !== lastEditId) {
    setLastEditId(editProject.id);
    setForm({
      name: editProject.name,
      description: editProject.description ?? "",
      status: editProject.status,
      deadline: editProject.deadline ?? "",
      salePrice: editProject.salePrice != null ? String(editProject.salePrice) : "",
      notes: editProject.notes ?? "",
    });
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        description: form.description || null,
        status: form.status,
        deadline: form.deadline || null,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        notes: form.notes || null,
      };
      if (isEdit) {
        await apiRequest("PATCH", `/api/projects/${editProject!.id}`, body);
      } else {
        await apiRequest("POST", "/api/projects", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: isEdit ? "Проект обновлён" : "Проект создан" });
      onOpenChange(false);
      if (!isEdit) setForm(EMPTY_FORM);
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать проект" : "Новый проект"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="proj-name">Название</Label>
            <Input
              id="proj-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Напр. Летнее платье"
              data-testid="input-project-name"
            />
          </div>
          <div>
            <Label htmlFor="proj-desc">Описание</Label>
            <Textarea
              id="proj-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Краткое описание проекта"
              rows={2}
              data-testid="input-project-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="proj-status">Статус</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="proj-status" data-testid="select-project-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="paused">На паузе</SelectItem>
                  <SelectItem value="completed">Завершён</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="proj-deadline">Дедлайн</Label>
              <Input
                id="proj-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                data-testid="input-project-deadline"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="proj-sale-price">Цена продажи, ₽</Label>
            <Input
              id="proj-sale-price"
              type="number"
              step="0.01"
              min="0"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              placeholder="0"
              data-testid="input-project-sale-price"
            />
          </div>
          <div>
            <Label htmlFor="proj-notes">Заметки</Label>
            <Textarea
              id="proj-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Дополнительная информация"
              rows={2}
              data-testid="input-project-notes"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!form.name || mutation.isPending}
            data-testid="button-add-project"
          >
            {mutation.isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Создать проект"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const { data: usages } = useQuery<FabricUsage[]>({
    queryKey: ["/api/usages"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Проект удалён" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/projects/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const getProjectUsages = (projectId: number) =>
    usages?.filter((u) => u.projectId === projectId) ?? [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Проекты</h1>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-open-add-project">
          <Plus className="size-4 mr-1.5" /> Создать
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <FolderKanban className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">Нет проектов</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Создайте проект, чтобы привязывать к нему расход тканей
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
            <Plus className="size-4 mr-1.5" /> Создать проект
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const projectUsages = getProjectUsages(p.id);
            const totalUsed = projectUsages.reduce((s, u) => s + u.lengthUsedM, 0);
            const dlStatus = getDeadlineStatus(p.deadline);

            return (
              <Card key={p.id} data-testid={`card-project-${p.id}`} className="flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="min-w-0 pr-2 flex-1">
                    <CardTitle className="text-base font-medium truncate">{p.name}</CardTitle>
                    {p.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select value={p.status} onValueChange={(v) => updateStatusMutation.mutate({ id: p.id, status: v })}>
                      <SelectTrigger className="h-7 text-xs px-2 w-auto border-0 bg-transparent" data-testid={`select-status-${p.id}`}>
                        <Badge variant={STATUS_VARIANTS[p.status]} className="text-xs">
                          {STATUS_LABELS[p.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="paused">На паузе</SelectItem>
                        <SelectItem value="completed">Завершён</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-2">
                  {/* Deadline */}
                  {p.deadline && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit ${
                        dlStatus === "overdue"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : dlStatus === "soon"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                      data-testid={`deadline-${p.id}`}
                    >
                      <Calendar className="size-3.5 shrink-0" />
                      <span>
                        {dlStatus === "overdue" ? "Просрочен: " : "Дедлайн: "}
                        {formatDate(p.deadline)}
                      </span>
                    </div>
                  )}

                  {/* Usage stats */}
                  <div className="flex items-center justify-between text-sm pt-1">
                    <div>
                      <span className="text-muted-foreground">Расход: </span>
                      <span className="font-medium">{totalUsed.toFixed(2)} м</span>
                      <span className="text-muted-foreground ml-1">({projectUsages.length} записей)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setEditProject(p)}
                        data-testid={`button-edit-project-${p.id}`}
                        aria-label="Редактировать проект"
                      >
                        <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7" data-testid={`button-delete-project-${p.id}`}>
                            <Trash2 className="size-3.5 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Проект «{p.name}» будет удалён. Записи расхода тканей сохранятся.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(p.id)}>
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Cost calculation */}
                  <ProjectCostSection projectId={p.id} salePrice={p.salePrice ?? null} />

                  {/* Pattern linking */}
                  <PatternSection projectId={p.id} />

                  <p className="text-xs text-muted-foreground mt-auto pt-1">
                    Создан {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <ProjectDialog
        open={!!editProject}
        onOpenChange={(v) => { if (!v) setEditProject(null); }}
        editProject={editProject}
      />
    </div>
  );
}
