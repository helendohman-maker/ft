import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Fabric } from "@shared/schema";
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
import { Plus, Trash2, Search, Scissors, LayoutGrid, List, Download } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FABRIC_TYPES = ["Хлопок", "Шёлк", "Полиэстер", "Лён", "Шерсть", "Вискоза", "Смесовая", "Другое"];
const COMMON_FIBERS = ["хлопок", "полиэстер", "эластан", "вискоза", "шёлк", "шерсть", "лён", "нейлон", "акрил"];

interface CompositionEntry { fiber: string; percent: number; }

function CompositionInput({ value, onChange }: { value: CompositionEntry[]; onChange: (v: CompositionEntry[]) => void }) {
  const addEntry = () => {
    if (value.length < 5) onChange([...value, { fiber: "", percent: 0 }]);
  };
  const removeEntry = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const updateEntry = (idx: number, field: "fiber" | "percent", val: string) => {
    const newArr = [...value];
    if (field === "percent") {
      newArr[idx] = { ...newArr[idx], percent: parseInt(val) || 0 };
    } else {
      newArr[idx] = { ...newArr[idx], fiber: val };
    }
    onChange(newArr);
  };
  const totalPercent = value.reduce((s, e) => s + e.percent, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Состав</Label>
        {value.length > 0 && (
          <span className={`text-xs ${totalPercent === 100 ? "text-green-600" : "text-amber-600"}`}>
            {totalPercent}%
          </span>
        )}
      </div>
      {value.map((entry, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <Input
            className="flex-1"
            placeholder="Волокно"
            value={entry.fiber}
            onChange={(e) => updateEntry(idx, "fiber", e.target.value)}
            list="fiber-options"
            data-testid={`input-composition-fiber-${idx}`}
          />
          <Input
            className="w-20"
            type="number"
            min={0}
            max={100}
            placeholder="%"
            value={entry.percent || ""}
            onChange={(e) => updateEntry(idx, "percent", e.target.value)}
            data-testid={`input-composition-percent-${idx}`}
          />
          <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => removeEntry(idx)}>
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}
      <datalist id="fiber-options">
        {COMMON_FIBERS.map(f => <option key={f} value={f} />)}
      </datalist>
      {value.length < 5 && (
        <Button variant="outline" size="sm" onClick={addEntry} className="w-full" data-testid="button-add-composition">
          <Plus className="size-3 mr-1" /> Добавить волокно
        </Button>
      )}
    </div>
  );
}

function formatComposition(compositionJson: string | null): string {
  if (!compositionJson) return "—";
  try {
    const arr: CompositionEntry[] = JSON.parse(compositionJson);
    if (!Array.isArray(arr) || arr.length === 0) return compositionJson;
    return arr.map(e => `${e.fiber} ${e.percent}%`).join(", ");
  } catch {
    return compositionJson;
  }
}

function AddFabricDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", type: "Хлопок", color: "", colorHex: "", pattern: "",
    article: "", supplier: "", pricePerMeter: "", widthCm: "",
    density: "", totalLengthM: "", unit: "м", notes: "",
  });
  const [composition, setComposition] = useState<CompositionEntry[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        type: form.type,
        composition: composition.length > 0 ? JSON.stringify(composition) : null,
        color: form.color,
        colorHex: form.colorHex || null,
        pattern: form.pattern || null,
        article: form.article || null,
        supplier: form.supplier || null,
        pricePerMeter: form.pricePerMeter ? parseFloat(form.pricePerMeter) : null,
        widthCm: form.widthCm ? parseInt(form.widthCm) : null,
        density: form.density || null,
        totalLengthM: parseFloat(form.totalLengthM),
        unit: form.unit,
        notes: form.notes || null,
      };
      await apiRequest("POST", "/api/fabrics", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fabrics"] });
      toast({ title: "Ткань добавлена" });
      onOpenChange(false);
      setForm({
        name: "", type: "Хлопок", color: "", colorHex: "", pattern: "",
        article: "", supplier: "", pricePerMeter: "", widthCm: "",
        density: "", totalLengthM: "", unit: "м", notes: "",
      });
      setComposition([]);
    },
    onError: (err: Error) => {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    },
  });

  const canSubmit = form.name && form.color && form.totalLengthM && parseFloat(form.totalLengthM) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить ткань</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="fab-name">Название</Label>
              <Input id="fab-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Напр. Батист белый" data-testid="input-fabric-name" />
            </div>
            <div>
              <Label htmlFor="fab-type">Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="fab-type" data-testid="select-fabric-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FABRIC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fab-color">Цвет</Label>
              <div className="flex gap-2">
                <Input id="fab-color" className="flex-1" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Белый" data-testid="input-fabric-color" />
                <input
                  type="color"
                  className="size-9 rounded border cursor-pointer shrink-0"
                  value={form.colorHex || "#ffffff"}
                  onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                  data-testid="input-fabric-color-hex"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fab-pattern">Рисунок</Label>
              <Input id="fab-pattern" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} placeholder="Однотонный" data-testid="input-fabric-pattern" />
            </div>
            <div>
              <Label htmlFor="fab-article">Артикул</Label>
              <Input id="fab-article" value={form.article} onChange={(e) => setForm({ ...form, article: e.target.value })} placeholder="ART-001" data-testid="input-fabric-article" />
            </div>
            <div>
              <Label htmlFor="fab-supplier">Поставщик</Label>
              <Input id="fab-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Ткани Оптом" data-testid="input-fabric-supplier" />
            </div>
            <div>
              <Label htmlFor="fab-price">Цена за метр, ₽</Label>
              <Input id="fab-price" type="number" step="0.01" value={form.pricePerMeter} onChange={(e) => setForm({ ...form, pricePerMeter: e.target.value })} placeholder="350" data-testid="input-fabric-price" />
            </div>
            <div>
              <Label htmlFor="fab-width">Ширина, см</Label>
              <Input id="fab-width" type="number" value={form.widthCm} onChange={(e) => setForm({ ...form, widthCm: e.target.value })} placeholder="150" data-testid="input-fabric-width" />
            </div>
            <div>
              <Label htmlFor="fab-density">Плотность, г/м²</Label>
              <Input id="fab-density" value={form.density} onChange={(e) => setForm({ ...form, density: e.target.value })} placeholder="120" data-testid="input-fabric-density" />
            </div>
            <div>
              <Label htmlFor="fab-length">Длина, м</Label>
              <Input id="fab-length" type="number" step="0.01" value={form.totalLengthM} onChange={(e) => setForm({ ...form, totalLengthM: e.target.value })} placeholder="5.00" data-testid="input-fabric-length" />
            </div>
          </div>
          <CompositionInput value={composition} onChange={setComposition} />
          <div>
            <Label htmlFor="fab-notes">Заметки</Label>
            <Textarea id="fab-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Дополнительная информация" rows={2} data-testid="input-fabric-notes" />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            data-testid="button-add-fabric"
          >
            {mutation.isPending ? "Сохранение..." : "Добавить ткань"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FabricCard({ fabric, onDelete }: { fabric: Fabric; onDelete: (id: number) => void }) {
  const usagePercent = fabric.totalLengthM === 0 ? 0 : ((fabric.totalLengthM - fabric.remainingLengthM) / fabric.totalLengthM) * 100;
  const isLow = fabric.remainingLengthM < fabric.totalLengthM * 0.2;

  return (
    <Card className="group" data-testid={`card-fabric-${fabric.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {fabric.colorHex && (
                <div className="size-4 rounded-full border border-border shrink-0" style={{ backgroundColor: fabric.colorHex }} />
              )}
              <h3 className="font-medium text-sm truncate">{fabric.name}</h3>
            </div>
            {fabric.article && <p className="text-xs text-muted-foreground mt-0.5">{fabric.article}</p>}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Trash2 className="size-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить ткань?</AlertDialogTitle>
                <AlertDialogDescription>Ткань «{fabric.name}» и все записи о её расходе будут удалены.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(fabric.id)}>Удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="secondary" className="text-xs font-normal">{fabric.type}</Badge>
          <Badge variant="outline" className="text-xs font-normal">{fabric.color}</Badge>
          {fabric.widthCm && <Badge variant="outline" className="text-xs font-normal">{fabric.widthCm} см</Badge>}
        </div>
        {fabric.composition && (
          <p className="text-xs text-muted-foreground mb-2">{formatComposition(fabric.composition)}</p>
        )}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Остаток</span>
            <span className={`font-medium ${isLow ? "text-destructive" : ""}`}>
              {fabric.remainingLengthM.toFixed(2)} / {fabric.totalLengthM.toFixed(2)} м
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${100 - usagePercent}%`,
                backgroundColor: isLow ? "hsl(var(--destructive))" : "hsl(var(--primary))",
              }}
            />
          </div>
          {fabric.pricePerMeter && (
            <p className="text-xs text-muted-foreground">{fabric.pricePerMeter} ₽/м · {fabric.supplier ?? "—"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FabricsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterType, setFilterType] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const { toast } = useToast();

  const { data: fabrics, isLoading } = useQuery<Fabric[]>({
    queryKey: ["/api/fabrics"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/fabrics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fabrics"] });
      toast({ title: "Ткань удалена" });
    },
  });

  const filtered = fabrics?.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (
      f.name.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      f.color.toLowerCase().includes(q) ||
      (f.supplier?.toLowerCase().includes(q) ?? false) ||
      (f.article?.toLowerCase().includes(q) ?? false) ||
      (f.composition?.toLowerCase().includes(q) ?? false)
    );
    const matchType = filterType === "all" || f.type === filterType;
    const matchStock = filterStock === "all" ||
      (filterStock === "low" && f.remainingLengthM < f.totalLengthM * 0.2) ||
      (filterStock === "ok" && f.remainingLengthM >= f.totalLengthM * 0.2) ||
      (filterStock === "empty" && f.remainingLengthM === 0);
    return matchSearch && matchType && matchStock;
  }) ?? [];

  const getUsagePercent = (f: Fabric) => {
    if (f.totalLengthM === 0) return 0;
    return ((f.totalLengthM - f.remainingLengthM) / f.totalLengthM) * 100;
  };

  const handleExportCSV = () => {
    window.open("/api/export/fabrics.csv", "_blank");
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
        <h1 className="text-xl font-semibold" data-testid="text-page-title">Ткани</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} data-testid="button-export-csv">
            <Download className="size-4 mr-1.5" /> CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-open-add-fabric">
            <Plus className="size-4 mr-1.5" /> Добавить
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск по названию, типу, цвету, поставщику, составу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-fabrics"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="select-filter-type">
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {FABRIC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger className="w-36 h-9 text-sm" data-testid="select-filter-stock">
            <SelectValue placeholder="Все запасы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все запасы</SelectItem>
            <SelectItem value="ok">В наличии</SelectItem>
            <SelectItem value="low">Заканчивается</SelectItem>
            <SelectItem value="empty">Израсходовано</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="size-9 rounded-none"
            onClick={() => setViewMode("list")}
            data-testid="button-view-list"
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="size-9 rounded-none"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <Scissors className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">
            {search || filterType !== "all" || filterStock !== "all" ? "Ничего не найдено" : "Пока нет тканей"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search || filterType !== "all" || filterStock !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Добавьте первую ткань, чтобы начать учёт запасов"}
          </p>
          {!search && filterType === "all" && filterStock === "all" && (
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-1.5" /> Добавить ткань
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((f) => (
            <FabricCard key={f.id} fabric={f} onDelete={(id) => deleteMutation.mutate(id)} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead className="hidden md:table-cell">Состав</TableHead>
                    <TableHead className="hidden md:table-cell">Поставщик</TableHead>
                    <TableHead className="hidden lg:table-cell">Ширина</TableHead>
                    <TableHead className="hidden lg:table-cell">Цена/м</TableHead>
                    <TableHead>Остаток</TableHead>
                    <TableHead className="text-right">Расход</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((f) => (
                    <TableRow key={f.id} data-testid={`row-fabric-${f.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {f.colorHex && (
                            <div className="size-3 rounded-full border border-border shrink-0" style={{ backgroundColor: f.colorHex }} />
                          )}
                          <div>
                            <span className="font-medium">{f.name}</span>
                            {f.article && (
                              <span className="text-xs text-muted-foreground ml-1.5">({f.article})</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-normal">{f.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{f.color}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[160px] truncate">
                        {formatComposition(f.composition)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {f.supplier ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {f.widthCm ? `${f.widthCm} см` : "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {f.pricePerMeter ? `${f.pricePerMeter} ₽` : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium whitespace-nowrap">
                            {f.remainingLengthM.toFixed(2)} м
                          </span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${100 - getUsagePercent(f)}%`,
                                backgroundColor: f.remainingLengthM < f.totalLengthM * 0.2
                                  ? "hsl(var(--destructive))"
                                  : "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {getUsagePercent(f).toFixed(0)}%
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" data-testid={`button-delete-fabric-${f.id}`}>
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить ткань?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ткань «{f.name}» и все записи о её расходе будут удалены. Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(f.id)}>
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

      <AddFabricDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
