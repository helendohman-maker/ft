import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertFabricSchema, insertProjectSchema, insertFabricUsageSchema,
  insertNotionSchema, insertNotionUsageSchema,
  insertThreadSchema, insertThreadUsageSchema,
  insertPatternSchema, insertProjectPatternSchema,
  insertWishListItemSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== FABRICS =====
  app.get("/api/fabrics", (_req, res) => {
    const fabrics = storage.getAllFabrics();
    res.json(fabrics);
  });

  app.get("/api/fabrics/:id", (req, res) => {
    const fabric = storage.getFabric(Number(req.params.id));
    if (!fabric) return res.status(404).json({ message: "Ткань не найдена" });
    res.json(fabric);
  });

  app.post("/api/fabrics", (req, res) => {
    const parsed = insertFabricSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const fabric = storage.createFabric(parsed.data);
    res.status(201).json(fabric);
  });

  app.patch("/api/fabrics/:id", (req, res) => {
    const fabric = storage.updateFabric(Number(req.params.id), req.body);
    if (!fabric) return res.status(404).json({ message: "Ткань не найдена" });
    res.json(fabric);
  });

  app.delete("/api/fabrics/:id", (req, res) => {
    storage.deleteFabric(Number(req.params.id));
    res.status(204).send();
  });

  // ===== NOTIONS =====
  app.get("/api/notions", (_req, res) => {
    res.json(storage.getAllNotions());
  });

  app.get("/api/notions/:id", (req, res) => {
    const notion = storage.getNotion(Number(req.params.id));
    if (!notion) return res.status(404).json({ message: "Фурнитура не найдена" });
    res.json(notion);
  });

  app.post("/api/notions", (req, res) => {
    const parsed = insertNotionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.status(201).json(storage.createNotion(parsed.data));
  });

  app.patch("/api/notions/:id", (req, res) => {
    const notion = storage.updateNotion(Number(req.params.id), req.body);
    if (!notion) return res.status(404).json({ message: "Фурнитура не найдена" });
    res.json(notion);
  });

  app.delete("/api/notions/:id", (req, res) => {
    storage.deleteNotion(Number(req.params.id));
    res.status(204).send();
  });

  // ===== THREADS =====
  app.get("/api/threads", (_req, res) => {
    res.json(storage.getAllThreads());
  });

  app.get("/api/threads/:id", (req, res) => {
    const thread = storage.getThread(Number(req.params.id));
    if (!thread) return res.status(404).json({ message: "Нить не найдена" });
    res.json(thread);
  });

  app.post("/api/threads", (req, res) => {
    const parsed = insertThreadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.status(201).json(storage.createThread(parsed.data));
  });

  app.patch("/api/threads/:id", (req, res) => {
    const thread = storage.updateThread(Number(req.params.id), req.body);
    if (!thread) return res.status(404).json({ message: "Нить не найдена" });
    res.json(thread);
  });

  app.delete("/api/threads/:id", (req, res) => {
    storage.deleteThread(Number(req.params.id));
    res.status(204).send();
  });

  // ===== PATTERNS =====
  app.get("/api/patterns", (_req, res) => {
    res.json(storage.getAllPatterns());
  });

  app.get("/api/patterns/:id", (req, res) => {
    const pattern = storage.getPattern(Number(req.params.id));
    if (!pattern) return res.status(404).json({ message: "Выкройка не найдена" });
    res.json(pattern);
  });

  app.post("/api/patterns", (req, res) => {
    const parsed = insertPatternSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.status(201).json(storage.createPattern(parsed.data));
  });

  app.patch("/api/patterns/:id", (req, res) => {
    const pattern = storage.updatePattern(Number(req.params.id), req.body);
    if (!pattern) return res.status(404).json({ message: "Выкройка не найдена" });
    res.json(pattern);
  });

  app.delete("/api/patterns/:id", (req, res) => {
    storage.deletePattern(Number(req.params.id));
    res.status(204).send();
  });

  // ===== PROJECTS =====
  app.get("/api/projects", (_req, res) => {
    const projects = storage.getAllProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ message: "Проект не найден" });
    res.json(project);
  });

  app.post("/api/projects", (req, res) => {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const project = storage.createProject(parsed.data);
    res.status(201).json(project);
  });

  app.patch("/api/projects/:id", (req, res) => {
    const project = storage.updateProject(Number(req.params.id), req.body);
    if (!project) return res.status(404).json({ message: "Проект не найден" });
    res.json(project);
  });

  app.delete("/api/projects/:id", (req, res) => {
    storage.deleteProject(Number(req.params.id));
    res.status(204).send();
  });

  // ===== FABRIC USAGES =====
  app.get("/api/usages", (_req, res) => {
    const usages = storage.getAllUsages();
    res.json(usages);
  });

  app.get("/api/usages/fabric/:fabricId", (req, res) => {
    const usages = storage.getUsagesByFabric(Number(req.params.fabricId));
    res.json(usages);
  });

  app.get("/api/usages/project/:projectId", (req, res) => {
    const usages = storage.getUsagesByProject(Number(req.params.projectId));
    res.json(usages);
  });

  app.post("/api/usages", (req, res) => {
    const parsed = insertFabricUsageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const usage = storage.createUsage(parsed.data);
      res.status(201).json(usage);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/usages/:id", (req, res) => {
    storage.deleteUsage(Number(req.params.id));
    res.status(204).send();
  });

  // ===== NOTION USAGES =====
  app.get("/api/notion-usages", (_req, res) => {
    res.json(storage.getAllNotionUsages());
  });

  app.get("/api/notion-usages/project/:projectId", (req, res) => {
    res.json(storage.getNotionUsagesByProject(Number(req.params.projectId)));
  });

  app.post("/api/notion-usages", (req, res) => {
    const parsed = insertNotionUsageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      res.status(201).json(storage.createNotionUsage(parsed.data));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/notion-usages/:id", (req, res) => {
    storage.deleteNotionUsage(Number(req.params.id));
    res.status(204).send();
  });

  // ===== THREAD USAGES =====
  app.get("/api/thread-usages", (_req, res) => {
    res.json(storage.getAllThreadUsages());
  });

  app.get("/api/thread-usages/project/:projectId", (req, res) => {
    res.json(storage.getThreadUsagesByProject(Number(req.params.projectId)));
  });

  app.post("/api/thread-usages", (req, res) => {
    const parsed = insertThreadUsageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      res.status(201).json(storage.createThreadUsage(parsed.data));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/thread-usages/:id", (req, res) => {
    storage.deleteThreadUsage(Number(req.params.id));
    res.status(204).send();
  });

  // ===== PROJECT-PATTERN LINKS =====
  app.get("/api/project-patterns/:projectId", (req, res) => {
    res.json(storage.getProjectPatterns(Number(req.params.projectId)));
  });

  app.post("/api/project-patterns", (req, res) => {
    const parsed = insertProjectPatternSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.status(201).json(storage.addProjectPattern(parsed.data));
  });

  app.delete("/api/project-patterns/:id", (req, res) => {
    storage.removeProjectPattern(Number(req.params.id));
    res.status(204).send();
  });

  // ===== WISH LIST =====
  app.get("/api/wishlist", (_req, res) => {
    res.json(storage.getAllWishListItems());
  });

  app.get("/api/wishlist/:id", (req, res) => {
    const item = storage.getWishListItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Элемент не найден" });
    res.json(item);
  });

  app.post("/api/wishlist", (req, res) => {
    const parsed = insertWishListItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    res.status(201).json(storage.createWishListItem(parsed.data));
  });

  app.patch("/api/wishlist/:id", (req, res) => {
    const item = storage.updateWishListItem(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ message: "Элемент не найден" });
    res.json(item);
  });

  app.delete("/api/wishlist/:id", (req, res) => {
    storage.deleteWishListItem(Number(req.params.id));
    res.status(204).send();
  });

  // ===== CSV EXPORT =====
  app.get("/api/export/fabrics.csv", (_req, res) => {
    const allFabrics = storage.getAllFabrics();
    const headers = ["Название", "Тип", "Состав", "Цвет", "Артикул", "Поставщик", "Цена/м", "Ширина(см)", "Плотность", "Всего(м)", "Остаток(м)", "Заметки"];
    const rows = allFabrics.map(f => [
      f.name, f.type, f.composition || "", f.color, f.article || "",
      f.supplier || "", f.pricePerMeter ?? "", f.widthCm ?? "",
      f.density || "", f.totalLengthM, f.remainingLengthM, f.notes || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=fabrics.csv");
    res.send(csv);
  });

  app.get("/api/export/notions.csv", (_req, res) => {
    const allNotions = storage.getAllNotions();
    const headers = ["Название", "Категория", "Цвет", "Размер", "Единица", "Всего", "Остаток", "Цена/шт", "Поставщик", "Артикул", "Заметки"];
    const rows = allNotions.map(n => [
      n.name, n.category, n.color || "", n.size || "", n.unit,
      n.totalQuantity, n.remainingQuantity, n.pricePerUnit ?? "",
      n.supplier || "", n.article || "", n.notes || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=notions.csv");
    res.send(csv);
  });

  app.get("/api/export/threads.csv", (_req, res) => {
    const allThreads = storage.getAllThreads();
    const headers = ["Название", "Бренд", "Цвет", "Код цвета", "Тип", "Материал", "Толщина", "Всего катушек", "Остаток катушек", "Цена/кат", "Поставщик", "Заметки"];
    const rows = allThreads.map(t => [
      t.name, t.brand || "", t.color, t.colorCode || "", t.type,
      t.material || "", t.thickness || "", t.totalSpools, t.remainingSpools,
      t.pricePerSpool ?? "", t.supplier || "", t.notes || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=threads.csv");
    res.send(csv);
  });

  // ===== PROJECT COST CALCULATION =====
  app.get("/api/projects/:id/cost", (req, res) => {
    const projectId = Number(req.params.id);
    const project = storage.getProject(projectId);
    if (!project) return res.status(404).json({ message: "Проект не найден" });

    const fUsages = storage.getUsagesByProject(projectId);
    const nUsages = storage.getNotionUsagesByProject(projectId);
    const tUsages = storage.getThreadUsagesByProject(projectId);

    let fabricCost = 0;
    for (const u of fUsages) {
      const fabric = storage.getFabric(u.fabricId);
      if (fabric?.pricePerMeter) {
        fabricCost += fabric.pricePerMeter * u.lengthUsedM;
      }
    }

    let notionCost = 0;
    for (const u of nUsages) {
      const notion = storage.getNotion(u.notionId);
      if (notion?.pricePerUnit) {
        notionCost += notion.pricePerUnit * u.quantityUsed;
      }
    }

    let threadCost = 0;
    for (const u of tUsages) {
      const thread = storage.getThread(u.threadId);
      if (thread?.pricePerSpool) {
        threadCost += thread.pricePerSpool * u.spoolsUsed;
      }
    }

    const totalCost = fabricCost + notionCost + threadCost;
    const profit = project.salePrice ? project.salePrice - totalCost : null;

    res.json({
      fabricCost: Math.round(fabricCost * 100) / 100,
      notionCost: Math.round(notionCost * 100) / 100,
      threadCost: Math.round(threadCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      salePrice: project.salePrice,
      profit: profit !== null ? Math.round(profit * 100) / 100 : null,
    });
  });

  // ===== SHOPPING LIST (auto-generated from active projects) =====
  app.get("/api/shopping-list", (_req, res) => {
    const allFabrics = storage.getAllFabrics();
    const allNotions = storage.getAllNotions();
    const allThreads = storage.getAllThreads();

    const lowStockItems: any[] = [];

    for (const f of allFabrics) {
      if (f.remainingLengthM <= f.totalLengthM * 0.2) {
        lowStockItems.push({
          type: "ткань",
          name: f.name,
          remaining: `${f.remainingLengthM.toFixed(2)} м`,
          supplier: f.supplier,
          estimatedPrice: f.pricePerMeter ? `${f.pricePerMeter} ₽/м` : null,
        });
      }
    }

    for (const n of allNotions) {
      if (n.remainingQuantity <= n.totalQuantity * 0.2) {
        lowStockItems.push({
          type: "фурнитура",
          name: n.name,
          remaining: `${n.remainingQuantity} ${n.unit}`,
          supplier: n.supplier,
          estimatedPrice: n.pricePerUnit ? `${n.pricePerUnit} ₽/${n.unit}` : null,
        });
      }
    }

    for (const t of allThreads) {
      if (t.remainingSpools <= 1 && t.totalSpools > 1) {
        lowStockItems.push({
          type: "нити",
          name: t.name,
          remaining: `${t.remainingSpools} кат.`,
          supplier: t.supplier,
          estimatedPrice: t.pricePerSpool ? `${t.pricePerSpool} ₽/кат.` : null,
        });
      }
    }

    res.json(lowStockItems);
  });

  return httpServer;
}
