import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Thread } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, Wind } from "lucide-react";
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

const THREAD_TYPES = ["универсальные", "оверлочные", "декоративные", "вышивальные"];
const THREAD_MATERIALS = ["полиэстер", "хлопок", "шёлк"];

function AddThreadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    color: "",
    colorCode: "",
    type: "универсальные",
    material: "полиэстер",
    thickness: "",
    totalSpools: "",
    pricePerSpool: "",
    supplier: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        brand: form.brand || null,
        color: form.color,
        colorCode: form.colorCode || null,
        type: form.type,
        material: form.material || null,
        thickness: form.thickness || null,
        totalSpools: form.totalSpools ? parseInt(form.totalSpools) : 1,
        pricePerSpool: form.pricePerSpool ? parseFloat(form.pricePerSpool) : null,
        supplier: form.supplier || null,
        notes: form.notes || null,
      };
      await apiRequest("POST", "/api/threads", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      toast({ title: "Нити добавлены" });
      onOpenChange(false);
      setForm({
        name: "",
        brand: "",
        color: "",
        colorCode: "",
        type: "универсальные",
        material: "полиэстер",
        thickness: "",
        totalSpools: "",
        pricePerSpool: "",
        supplier: "",
        notes: "",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit = form.name && form.color;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить нити</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="thr-name">Название</Label>
              <Input
                id="thr-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Напр. Нить швейная №40"
                data-testid="input-thread-name"
              />
            </div>
            <div>
              <Label htmlFor="thr-brand">Бренд</Label>
              <Input
                id="thr-brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Gutermann"
                data-testid="input-thread-brand"
              />
            </div>
            <div>
              <Label htmlFor="thr-color">Цвет</Label>
              <Input
                id="thr-color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Белый"
                data-testid="input-thread-color"
              />
            </div>
            <div>
              <Label htmlFor="thr-color-code">Код цвета</Label>
              <Input
                id="thr-color-code"
                value={form.colorCode}
                onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                placeholder="100"
                data-testid="input-thread-color-code"
              />
            </div>
            <div>
              <Label htmlFor="thr-type">Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="thr-type" data-testid="select-thread-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THREAD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="thr-material">Материал</Label>
              <Select value={form.material} onValueChange={(v) => setForm({ ...form, material: v })}>
                <SelectTrigger id="thr-material" data-testid="select-thread-material">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THREAD_MATERIALS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="thr-thickness">Толщина/номер</Label>
              <Input
                id="thr-thickness"
                value={form.thickness}
                onChange={(e) => setForm({ ...form, thickness: e.target.value })}
                placeholder="40/2"
                data-testid="input-thread-thickness"
              />
            </div>
            <div>
              <Label htmlFor="thr-spools">Кол-во катушек</Label>
              <Input
                id="thr-spools"
                type="number"
                min="1"
                value={form.totalSpools}
                onChange={(e) => setForm({ ...form, totalSpools: e.target.value })}
                placeholder="3"
                data-testid="input-thread-spools"
              />
            </div>
            <div>
              <Label htmlFor="thr-price">Цена за катушку, ₽</Label>
              <Input
                id="thr-price"
                type="number"
                step="0.01"
                value={form.pricePerSpool}
                onChange={(e) => setForm({ ...form, pricePerSpool: e.target.value })}
                placeholder="120"
                data-testid="input-thread-price"
              />
            </div>
            <div>
              <Label htmlFor="thr-supplier">Поставщик</Label>
              <Input
                id="thr-supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Ткани Оптом"
                data-testid="input-thread-supplier"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="thr-notes">Заметки</Label>
            <Textarea
              id="thr-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Дополнительная информация"
              rows={2}
              data-testid="input-thread-notes"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            data-testid="button-add-thread"
          >
            {mutation.isPending ? "Сохранение..." : "Добавить нити"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ThreadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: threads, isLoading } = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/threads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      toast({ title: "Нити удалены" });
    },
  });

  const filtered =
    threads?.filter((t) => {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.brand?.toLowerCase().includes(q) ?? false) ||
        t.color.toLowerCase().includes(q)
      );
    }) ?? [];

  const getRemainPercent = (t: Thread) => {
    if (t.totalSpools === 0) return 0;
    return (t.remainingSpools / t.totalSpools) * 100;
  };

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
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Нити</h1>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-open-add-thread">
          <Plus className="size-4 mr-1.5" /> Добавить
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Поиск по названию, бренду, цвету..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-threads"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <Wind className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">
            {search ? "Ничего не найдено" : "Пока нет нитей"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search
              ? "Попробуйте изменить параметры поиска"
              : "Добавьте первые нити, чтобы начать учёт запасов"}
          </p>
          {!search && (
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-1.5" /> Добавить нити
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead className="hidden sm:table-cell">Бренд</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Катушки</TableHead>
                    <TableHead className="hidden md:table-cell">Цена/кат.</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} data-testid={`row-thread-${t.id}`}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{t.name}</span>
                          {t.thickness && (
                            <span className="text-xs text-muted-foreground ml-1.5">№{t.thickness}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {t.brand ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{t.color}</span>
                          {t.colorCode && (
                            <span className="text-xs text-muted-foreground">({t.colorCode})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">{t.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium whitespace-nowrap">
                            {t.remainingSpools} / {t.totalSpools} шт
                          </span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${getRemainPercent(t)}%`,
                                backgroundColor:
                                  getRemainPercent(t) < 20
                                    ? "hsl(var(--destructive))"
                                    : "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {t.pricePerSpool ? `${t.pricePerSpool} ₽` : "—"}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              data-testid={`button-delete-thread-${t.id}`}
                            >
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить нити?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Позиция «{t.name}» и все записи о её расходе будут удалены. Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(t.id)}>
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddThreadDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
