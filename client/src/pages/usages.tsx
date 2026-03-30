import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Fabric, Project, FabricUsage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ClipboardList } from "lucide-react";
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

function AddUsageDialog({
  open,
  onOpenChange,
  fabrics,
  projects,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fabrics: Fabric[];
  projects: Project[];
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({ fabricId: "", projectId: "", lengthUsedM: "", note: "" });

  const selectedFabric = fabrics.find((f) => f.id === Number(form.fabricId));

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/usages", {
        fabricId: parseInt(form.fabricId),
        projectId: form.projectId ? parseInt(form.projectId) : null,
        lengthUsedM: parseFloat(form.lengthUsedM),
        note: form.note || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fabrics"] });
      toast({ title: "Расход записан" });
      onOpenChange(false);
      setForm({ fabricId: "", projectId: "", lengthUsedM: "", note: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit = form.fabricId && form.lengthUsedM && parseFloat(form.lengthUsedM) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Записать расход</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="usage-fabric">Ткань</Label>
            <Select value={form.fabricId} onValueChange={(v) => setForm({ ...form, fabricId: v })}>
              <SelectTrigger id="usage-fabric" data-testid="select-usage-fabric"><SelectValue placeholder="Выберите ткань" /></SelectTrigger>
              <SelectContent>
                {fabrics.filter((f) => f.remainingLengthM > 0).map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name} ({f.remainingLengthM.toFixed(2)} м)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFabric && (
              <p className="text-xs text-muted-foreground mt-1">
                Доступно: {selectedFabric.remainingLengthM.toFixed(2)} м из {selectedFabric.totalLengthM.toFixed(2)} м
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="usage-project">Проект (необязательно)</Label>
            <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
              <SelectTrigger id="usage-project" data-testid="select-usage-project"><SelectValue placeholder="Без проекта" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без проекта</SelectItem>
                {projects.filter((p) => p.status === "active").map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="usage-length">Количество, м</Label>
            <Input
              id="usage-length"
              type="number"
              step="0.01"
              min="0.01"
              max={selectedFabric?.remainingLengthM}
              value={form.lengthUsedM}
              onChange={(e) => setForm({ ...form, lengthUsedM: e.target.value })}
              placeholder="1.50"
              data-testid="input-usage-length"
            />
          </div>
          <div>
            <Label htmlFor="usage-note">Примечание</Label>
            <Input
              id="usage-note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Раскрой полочки"
              data-testid="input-usage-note"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            data-testid="button-add-usage"
          >
            {mutation.isPending ? "Сохранение..." : "Записать расход"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UsagesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterFabric, setFilterFabric] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const { toast } = useToast();

  const { data: fabrics } = useQuery<Fabric[]>({ queryKey: ["/api/fabrics"] });
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: usages, isLoading } = useQuery<FabricUsage[]>({ queryKey: ["/api/usages"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/usages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fabrics"] });
      toast({ title: "Запись удалена, остаток восстановлен" });
    },
  });

  const filtered = usages?.filter((u) => {
    if (filterFabric !== "all" && u.fabricId !== Number(filterFabric)) return false;
    if (filterProject === "none" && u.projectId !== null) return false;
    if (filterProject !== "all" && filterProject !== "none" && u.projectId !== Number(filterProject)) return false;
    return true;
  }) ?? [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Расход тканей</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={!fabrics || fabrics.length === 0}
          data-testid="button-open-add-usage"
        >
          <Plus className="size-4 mr-1.5" /> Записать
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Select value={filterFabric} onValueChange={setFilterFabric}>
            <SelectTrigger className="h-9 text-sm" data-testid="select-filter-fabric">
              <SelectValue placeholder="Все ткани" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ткани</SelectItem>
              {fabrics?.map((f) => (
                <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="h-9 text-sm" data-testid="select-filter-project">
              <SelectValue placeholder="Все проекты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проекты</SelectItem>
              <SelectItem value="none">Без проекта</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <ClipboardList className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">Нет записей</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {!fabrics || fabrics.length === 0
              ? "Сначала добавьте ткани, чтобы записывать расход"
              : "Запишите расход ткани для отслеживания"}
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Ткань</TableHead>
                    <TableHead>Проект</TableHead>
                    <TableHead className="text-right">Расход</TableHead>
                    <TableHead className="hidden md:table-cell">Примечание</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const fabric = fabrics?.find((f) => f.id === u.fabricId);
                    const project = projects?.find((p) => p.id === u.projectId);
                    return (
                      <TableRow key={u.id} data-testid={`row-usage-${u.id}`}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(u.usedAt).toLocaleDateString("ru-RU")}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">{fabric?.name ?? "Удалена"}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm whitespace-nowrap">
                          −{u.lengthUsedM.toFixed(2)} м
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                          {u.note ?? "—"}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8" data-testid={`button-delete-usage-${u.id}`}>
                                <Trash2 className="size-3.5 text-muted-foreground" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Запись расхода будет удалена, а остаток ткани восстановлен.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(u.id)}>
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {fabrics && projects && (
        <AddUsageDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          fabrics={fabrics}
          projects={projects}
        />
      )}
    </div>
  );
}
