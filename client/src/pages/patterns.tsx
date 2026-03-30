import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pattern } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, FileText } from "lucide-react";
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

const PATTERN_CATEGORIES = [
  "платья",
  "юбки",
  "блузки",
  "брюки",
  "верхняя одежда",
  "аксессуары",
  "другое",
];

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    // not JSON — ignore
  }
  return [];
}

function AddPatternDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    source: "",
    category: "платья",
    sizes: "",
    fabricConsumptionM: "",
    description: "",
    tags: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const body = {
        name: form.name,
        source: form.source || null,
        category: form.category || null,
        sizes: form.sizes || null,
        fabricConsumptionM: form.fabricConsumptionM ? parseFloat(form.fabricConsumptionM) : null,
        description: form.description || null,
        tags: tagsArray.length > 0 ? JSON.stringify(tagsArray) : null,
        notes: form.notes || null,
      };
      await apiRequest("POST", "/api/patterns", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patterns"] });
      toast({ title: "Выкройка добавлена" });
      onOpenChange(false);
      setForm({
        name: "",
        source: "",
        category: "платья",
        sizes: "",
        fabricConsumptionM: "",
        description: "",
        tags: "",
        notes: "",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit = form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить выкройку</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="pat-name">Название</Label>
              <Input
                id="pat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Напр. Платье А-силуэт"
                data-testid="input-pattern-name"
              />
            </div>
            <div>
              <Label htmlFor="pat-source">Источник</Label>
              <Input
                id="pat-source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Burda 2024/01"
                data-testid="input-pattern-source"
              />
            </div>
            <div>
              <Label htmlFor="pat-category">Категория</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="pat-category" data-testid="select-pattern-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATTERN_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pat-sizes">Размеры</Label>
              <Input
                id="pat-sizes"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="42–48"
                data-testid="input-pattern-sizes"
              />
            </div>
            <div>
              <Label htmlFor="pat-consumption">Расход ткани, м</Label>
              <Input
                id="pat-consumption"
                type="number"
                step="0.01"
                value={form.fabricConsumptionM}
                onChange={(e) => setForm({ ...form, fabricConsumptionM: e.target.value })}
                placeholder="2.5"
                data-testid="input-pattern-consumption"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="pat-tags">Теги (через запятую)</Label>
              <Input
                id="pat-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="лето, повседневное, простое"
                data-testid="input-pattern-tags"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="pat-description">Описание</Label>
            <Textarea
              id="pat-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание выкройки"
              rows={2}
              data-testid="input-pattern-description"
            />
          </div>
          <div>
            <Label htmlFor="pat-notes">Заметки</Label>
            <Textarea
              id="pat-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Дополнительная информация"
              rows={2}
              data-testid="input-pattern-notes"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            data-testid="button-add-pattern"
          >
            {mutation.isPending ? "Сохранение..." : "Добавить выкройку"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PatternsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: patterns, isLoading } = useQuery<Pattern[]>({
    queryKey: ["/api/patterns"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/patterns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patterns"] });
      toast({ title: "Выкройка удалена" });
    },
  });

  const filtered =
    patterns?.filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.source?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false) ||
        (p.description?.toLowerCase().includes(q) ?? false)
      );
    }) ?? [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Выкройки</h1>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-open-add-pattern">
          <Plus className="size-4 mr-1.5" /> Добавить
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Поиск по названию, источнику, категории, описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-patterns"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <FileText className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">
            {search ? "Ничего не найдено" : "Пока нет выкроек"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search
              ? "Попробуйте изменить параметры поиска"
              : "Добавьте первую выкройку, чтобы начать учёт"}
          </p>
          {!search && (
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-1.5" /> Добавить выкройку
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const tags = parseTags(p.tags);
            return (
              <Card key={p.id} data-testid={`card-pattern-${p.id}`} className="flex flex-col">
                <CardContent className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight truncate" title={p.name}>
                        {p.name}
                      </p>
                      {p.source && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.source}</p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 -mr-1 -mt-1"
                          data-testid={`button-delete-pattern-${p.id}`}
                        >
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить выкройку?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Выкройка «{p.name}» будет удалена. Это действие нельзя отменить.
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

                  <div className="flex flex-wrap gap-1.5">
                    {p.category && (
                      <Badge variant="secondary" className="text-xs font-normal">{p.category}</Badge>
                    )}
                    {p.sizes && (
                      <Badge variant="outline" className="text-xs font-normal">р. {p.sizes}</Badge>
                    )}
                  </div>

                  {p.fabricConsumptionM != null && (
                    <p className="text-xs text-muted-foreground">
                      Расход ткани: <span className="font-medium text-foreground">{p.fabricConsumptionM} м</span>
                    </p>
                  )}

                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddPatternDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
