import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notion } from "@shared/schema";
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
import { Plus, Trash2, Search, Package } from "lucide-react";
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

const NOTION_CATEGORIES = ["пуговицы", "молнии", "ленты", "кнопки", "крючки", "резинка", "другое"];
const NOTION_UNITS = ["шт", "м", "см"];

function AddNotionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    category: "пуговицы",
    color: "",
    size: "",
    unit: "шт",
    totalQuantity: "",
    pricePerUnit: "",
    supplier: "",
    article: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        category: form.category,
        color: form.color || null,
        size: form.size || null,
        unit: form.unit,
        totalQuantity: parseFloat(form.totalQuantity),
        pricePerUnit: form.pricePerUnit ? parseFloat(form.pricePerUnit) : null,
        supplier: form.supplier || null,
        article: form.article || null,
        notes: form.notes || null,
      };
      await apiRequest("POST", "/api/notions", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notions"] });
      toast({ title: "Фурнитура добавлена" });
      onOpenChange(false);
      setForm({
        name: "",
        category: "пуговицы",
        color: "",
        size: "",
        unit: "шт",
        totalQuantity: "",
        pricePerUnit: "",
        supplier: "",
        article: "",
        notes: "",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit = form.name && form.totalQuantity && parseFloat(form.totalQuantity) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить фурнитуру</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="not-name">Название</Label>
              <Input
                id="not-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Напр. Пуговицы перламутровые"
                data-testid="input-notion-name"
              />
            </div>
            <div>
              <Label htmlFor="not-category">Категория</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="not-category" data-testid="select-notion-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTION_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="not-unit">Единица</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger id="not-unit" data-testid="select-notion-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTION_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="not-color">Цвет</Label>
              <Input
                id="not-color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Белый"
                data-testid="input-notion-color"
              />
            </div>
            <div>
              <Label htmlFor="not-size">Размер</Label>
              <Input
                id="not-size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="2 см"
                data-testid="input-notion-size"
              />
            </div>
            <div>
              <Label htmlFor="not-quantity">Количество</Label>
              <Input
                id="not-quantity"
                type="number"
                step="0.01"
                value={form.totalQuantity}
                onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })}
                placeholder="50"
                data-testid="input-notion-quantity"
              />
            </div>
            <div>
              <Label htmlFor="not-price">Цена за ед., ₽</Label>
              <Input
                id="not-price"
                type="number"
                step="0.01"
                value={form.pricePerUnit}
                onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
                placeholder="5"
                data-testid="input-notion-price"
              />
            </div>
            <div>
              <Label htmlFor="not-supplier">Поставщик</Label>
              <Input
                id="not-supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Ткани Оптом"
                data-testid="input-notion-supplier"
              />
            </div>
            <div>
              <Label htmlFor="not-article">Артикул</Label>
              <Input
                id="not-article"
                value={form.article}
                onChange={(e) => setForm({ ...form, article: e.target.value })}
                placeholder="ART-001"
                data-testid="input-notion-article"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="not-notes">Заметки</Label>
            <Textarea
              id="not-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Дополнительная информация"
              rows={2}
              data-testid="input-notion-notes"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            data-testid="button-add-notion"
          >
            {mutation.isPending ? "Сохранение..." : "Добавить фурнитуру"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function NotionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: notions, isLoading } = useQuery<Notion[]>({
    queryKey: ["/api/notions"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notions"] });
      toast({ title: "Фурнитура удалена" });
    },
  });

  const filtered =
    notions?.filter((n) => {
      const q = search.toLowerCase();
      return (
        n.name.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        (n.color?.toLowerCase().includes(q) ?? false) ||
        (n.supplier?.toLowerCase().includes(q) ?? false)
      );
    }) ?? [];

  const getRemainPercent = (n: Notion) => {
    if (n.totalQuantity === 0) return 0;
    return (n.remainingQuantity / n.totalQuantity) * 100;
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
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Фурнитура</h1>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-open-add-notion">
          <Plus className="size-4 mr-1.5" /> Добавить
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Поиск по названию, категории, цвету, поставщику..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-notions"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <Package className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">
            {search ? "Ничего не найдено" : "Пока нет фурнитуры"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search
              ? "Попробуйте изменить параметры поиска"
              : "Добавьте первую позицию, чтобы начать учёт фурнитуры"}
          </p>
          {!search && (
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-1.5" /> Добавить фурнитуру
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
                    <TableHead>Категория</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead>Остаток</TableHead>
                    <TableHead className="hidden md:table-cell">Цена/ед.</TableHead>
                    <TableHead className="hidden md:table-cell">Поставщик</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((n) => (
                    <TableRow key={n.id} data-testid={`row-notion-${n.id}`}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{n.name}</span>
                          {n.article && (
                            <span className="text-xs text-muted-foreground ml-1.5">({n.article})</span>
                          )}
                          {n.size && (
                            <span className="text-xs text-muted-foreground ml-1.5">{n.size}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">{n.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{n.color ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium whitespace-nowrap">
                            {n.remainingQuantity} / {n.totalQuantity} {n.unit}
                          </span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${getRemainPercent(n)}%`,
                                backgroundColor:
                                  getRemainPercent(n) < 20
                                    ? "hsl(var(--destructive))"
                                    : "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {n.pricePerUnit ? `${n.pricePerUnit} ₽` : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {n.supplier ?? "—"}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              data-testid={`button-delete-notion-${n.id}`}
                            >
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить фурнитуру?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Позиция «{n.name}» и все записи о её расходе будут удалены. Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(n.id)}>
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

      <AddNotionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
