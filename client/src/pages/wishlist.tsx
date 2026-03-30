import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WishListItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Heart, ExternalLink, Search } from "lucide-react";
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

const CATEGORIES = ["ткань", "фурнитура", "нити", "выкройка", "другое"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  ткань: "Ткань",
  фурнитура: "Фурнитура",
  нити: "Нити",
  выкройка: "Выкройка",
  другое: "Другое",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const PRIORITY_CLASSES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

type WishFormState = {
  name: string;
  category: string;
  description: string;
  link: string;
  estimatedPrice: string;
  priority: string;
  notes: string;
};

const EMPTY_FORM: WishFormState = {
  name: "",
  category: "ткань",
  description: "",
  link: "",
  estimatedPrice: "",
  priority: "medium",
  notes: "",
};

function WishDialog({
  open,
  onOpenChange,
  editItem,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editItem?: WishListItem | null;
}) {
  const { toast } = useToast();
  const isEdit = !!editItem;

  const [form, setForm] = useState<WishFormState>(() =>
    editItem
      ? {
          name: editItem.name,
          category: editItem.category,
          description: editItem.description ?? "",
          link: editItem.link ?? "",
          estimatedPrice: editItem.estimatedPrice != null ? String(editItem.estimatedPrice) : "",
          priority: editItem.priority,
          notes: editItem.notes ?? "",
        }
      : EMPTY_FORM
  );

  const [lastEditId, setLastEditId] = useState<number | null>(null);
  if (editItem && editItem.id !== lastEditId) {
    setLastEditId(editItem.id);
    setForm({
      name: editItem.name,
      category: editItem.category,
      description: editItem.description ?? "",
      link: editItem.link ?? "",
      estimatedPrice: editItem.estimatedPrice != null ? String(editItem.estimatedPrice) : "",
      priority: editItem.priority,
      notes: editItem.notes ?? "",
    });
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        category: form.category,
        description: form.description || null,
        link: form.link || null,
        estimatedPrice: form.estimatedPrice ? parseFloat(form.estimatedPrice) : null,
        priority: form.priority,
        notes: form.notes || null,
      };
      if (isEdit) {
        await apiRequest("PATCH", `/api/wishlist/${editItem!.id}`, body);
      } else {
        await apiRequest("POST", "/api/wishlist", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: isEdit ? "Запись обновлена" : "Добавлено в вишлист" });
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
          <DialogTitle>{isEdit ? "Редактировать" : "Добавить в вишлист"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="wish-name">Название</Label>
            <Input
              id="wish-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Напр. Шёлковый атлас"
              data-testid="input-wish-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="wish-category">Категория</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="wish-category" data-testid="select-wish-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="wish-priority">Приоритет</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="wish-priority" data-testid="select-wish-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="wish-desc">Описание</Label>
            <Textarea
              id="wish-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Подробности"
              rows={2}
              data-testid="input-wish-description"
            />
          </div>
          <div>
            <Label htmlFor="wish-link">Ссылка (URL)</Label>
            <Input
              id="wish-link"
              type="url"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              data-testid="input-wish-link"
            />
          </div>
          <div>
            <Label htmlFor="wish-price">Примерная цена, ₽</Label>
            <Input
              id="wish-price"
              type="number"
              step="0.01"
              min="0"
              value={form.estimatedPrice}
              onChange={(e) => setForm({ ...form, estimatedPrice: e.target.value })}
              placeholder="0"
              data-testid="input-wish-price"
            />
          </div>
          <div>
            <Label htmlFor="wish-notes">Заметки</Label>
            <Textarea
              id="wish-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Дополнительно"
              rows={2}
              data-testid="input-wish-notes"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!form.name || mutation.isPending}
            data-testid="button-save-wish"
          >
            {mutation.isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WishlistPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<WishListItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterPurchased, setFilterPurchased] = useState<string>("all");
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery<WishListItem[]>({
    queryKey: ["/api/wishlist"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wishlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Удалено из вишлиста" });
    },
  });

  const togglePurchasedMutation = useMutation({
    mutationFn: async ({ id, purchased }: { id: number; purchased: number }) => {
      await apiRequest("PATCH", `/api/wishlist/${id}`, { purchased });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const filtered = (items ?? []).filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false);
    const matchCategory = filterCategory === "all" || item.category === filterCategory;
    const matchPriority = filterPriority === "all" || item.priority === filterPriority;
    const matchPurchased =
      filterPurchased === "all" ||
      (filterPurchased === "purchased" && item.purchased === 1) ||
      (filterPurchased === "not-purchased" && item.purchased === 0);
    return matchSearch && matchCategory && matchPriority && matchPurchased;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Вишлист</h1>
        <Button onClick={() => setAddOpen(true)} data-testid="button-open-add-wish">
          <Plus className="size-4 mr-1.5" /> Добавить
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-wishlist"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px]" data-testid="select-filter-category"><SelectValue placeholder="Категория" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px]" data-testid="select-filter-priority"><SelectValue placeholder="Приоритет" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPurchased} onValueChange={setFilterPurchased}>
          <SelectTrigger className="w-[140px]" data-testid="select-filter-purchased"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="not-purchased">Не куплено</SelectItem>
            <SelectItem value="purchased">Куплено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <Heart className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">
            {(items?.length ?? 0) === 0 ? "Вишлист пуст" : "Ничего не найдено"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {(items?.length ?? 0) === 0
              ? "Добавьте товары, которые хотите купить"
              : "Попробуйте изменить фильтры или поисковый запрос"}
          </p>
          {(items?.length ?? 0) === 0 && (
            <Button variant="outline" className="mt-4" onClick={() => setAddOpen(true)}>
              <Plus className="size-4 mr-1.5" /> Добавить товар
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              data-testid={`card-wish-${item.id}`}
              className={`transition-opacity ${item.purchased ? "opacity-60" : ""}`}
            >
              <CardContent className="pt-4 pb-4 px-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id={`purchased-${item.id}`}
                    checked={item.purchased === 1}
                    onCheckedChange={(checked) => {
                      togglePurchasedMutation.mutate({
                        id: item.id,
                        purchased: checked ? 1 : 0,
                      });
                    }}
                    data-testid={`checkbox-purchased-${item.id}`}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm leading-tight ${item.purchased ? "line-through text-muted-foreground" : ""}`}
                    >
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`link-wish-${item.id}`}
                        aria-label="Открыть ссылку"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => setEditItem(item)}
                      data-testid={`button-edit-wish-${item.id}`}
                      aria-label="Редактировать"
                    >
                      <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6" data-testid={`button-delete-wish-${item.id}`}>
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить из вишлиста?</AlertDialogTitle>
                          <AlertDialogDescription>
                            «{item.name}» будет удалён из вишлиста. Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {CATEGORY_LABELS[item.category as Category] ?? item.category}
                  </Badge>
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CLASSES[item.priority] ?? PRIORITY_CLASSES.medium}`}
                    data-testid={`badge-priority-${item.id}`}
                  >
                    {PRIORITY_LABELS[item.priority] ?? item.priority}
                  </span>
                  {item.purchased === 1 && (
                    <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 font-normal">
                      Куплено
                    </Badge>
                  )}
                </div>

                {/* Price */}
                {item.estimatedPrice != null && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Цена: </span>
                    <span className="font-medium">{item.estimatedPrice.toFixed(0)} ₽</span>
                  </p>
                )}

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2 line-clamp-2">{item.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WishDialog open={addOpen} onOpenChange={setAddOpen} />
      <WishDialog
        open={!!editItem}
        onOpenChange={(v) => { if (!v) setEditItem(null); }}
        editItem={editItem}
      />
    </div>
  );
}
