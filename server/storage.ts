import {
  type Fabric, type InsertFabric, fabrics,
  type Project, type InsertProject, projects,
  type FabricUsage, type InsertFabricUsage, fabricUsages,
  type Notion, type InsertNotion, notions,
  type NotionUsage, type InsertNotionUsage, notionUsages,
  type Thread, type InsertThread, threads,
  type ThreadUsage, type InsertThreadUsage, threadUsages,
  type Pattern, type InsertPattern, patterns,
  type ProjectPattern, type InsertProjectPattern, projectPatterns,
  type WishListItem, type InsertWishListItem, wishListItems,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Fabrics
  getAllFabrics(): Fabric[];
  getFabric(id: number): Fabric | undefined;
  createFabric(fabric: InsertFabric): Fabric;
  updateFabric(id: number, fabric: Partial<InsertFabric>): Fabric | undefined;
  deleteFabric(id: number): void;

  // Notions
  getAllNotions(): Notion[];
  getNotion(id: number): Notion | undefined;
  createNotion(notion: InsertNotion): Notion;
  updateNotion(id: number, data: Partial<InsertNotion>): Notion | undefined;
  deleteNotion(id: number): void;

  // Threads
  getAllThreads(): Thread[];
  getThread(id: number): Thread | undefined;
  createThread(thread: InsertThread): Thread;
  updateThread(id: number, data: Partial<InsertThread>): Thread | undefined;
  deleteThread(id: number): void;

  // Patterns
  getAllPatterns(): Pattern[];
  getPattern(id: number): Pattern | undefined;
  createPattern(pattern: InsertPattern): Pattern;
  updatePattern(id: number, data: Partial<InsertPattern>): Pattern | undefined;
  deletePattern(id: number): void;

  // Projects
  getAllProjects(): Project[];
  getProject(id: number): Project | undefined;
  createProject(project: InsertProject): Project;
  updateProject(id: number, project: Partial<InsertProject>): Project | undefined;
  deleteProject(id: number): void;

  // Fabric Usages
  getAllUsages(): FabricUsage[];
  getUsagesByFabric(fabricId: number): FabricUsage[];
  getUsagesByProject(projectId: number): FabricUsage[];
  createUsage(usage: InsertFabricUsage): FabricUsage;
  deleteUsage(id: number): void;

  // Notion Usages
  getAllNotionUsages(): NotionUsage[];
  getNotionUsagesByProject(projectId: number): NotionUsage[];
  createNotionUsage(usage: InsertNotionUsage): NotionUsage;
  deleteNotionUsage(id: number): void;

  // Thread Usages
  getAllThreadUsages(): ThreadUsage[];
  getThreadUsagesByProject(projectId: number): ThreadUsage[];
  createThreadUsage(usage: InsertThreadUsage): ThreadUsage;
  deleteThreadUsage(id: number): void;

  // Project-Pattern Links
  getProjectPatterns(projectId: number): ProjectPattern[];
  addProjectPattern(link: InsertProjectPattern): ProjectPattern;
  removeProjectPattern(id: number): void;

  // Wish List
  getAllWishListItems(): WishListItem[];
  getWishListItem(id: number): WishListItem | undefined;
  createWishListItem(item: InsertWishListItem): WishListItem;
  updateWishListItem(id: number, data: Partial<InsertWishListItem>): WishListItem | undefined;
  deleteWishListItem(id: number): void;
}

export class DatabaseStorage implements IStorage {
  // ===== FABRICS =====
  getAllFabrics(): Fabric[] {
    return db.select().from(fabrics).orderBy(desc(fabrics.createdAt)).all();
  }

  getFabric(id: number): Fabric | undefined {
    return db.select().from(fabrics).where(eq(fabrics.id, id)).get();
  }

  createFabric(fabric: InsertFabric): Fabric {
    const now = new Date().toISOString();
    return db.insert(fabrics).values({
      ...fabric,
      remainingLengthM: fabric.totalLengthM,
      createdAt: now,
    }).returning().get();
  }

  updateFabric(id: number, data: Partial<InsertFabric>): Fabric | undefined {
    return db.update(fabrics).set(data).where(eq(fabrics.id, id)).returning().get();
  }

  deleteFabric(id: number): void {
    db.delete(fabricUsages).where(eq(fabricUsages.fabricId, id)).run();
    db.delete(fabrics).where(eq(fabrics.id, id)).run();
  }

  // ===== NOTIONS =====
  getAllNotions(): Notion[] {
    return db.select().from(notions).orderBy(desc(notions.createdAt)).all();
  }

  getNotion(id: number): Notion | undefined {
    return db.select().from(notions).where(eq(notions.id, id)).get();
  }

  createNotion(notion: InsertNotion): Notion {
    const now = new Date().toISOString();
    return db.insert(notions).values({
      ...notion,
      remainingQuantity: notion.totalQuantity,
      createdAt: now,
    }).returning().get();
  }

  updateNotion(id: number, data: Partial<InsertNotion>): Notion | undefined {
    return db.update(notions).set(data).where(eq(notions.id, id)).returning().get();
  }

  deleteNotion(id: number): void {
    db.delete(notionUsages).where(eq(notionUsages.notionId, id)).run();
    db.delete(notions).where(eq(notions.id, id)).run();
  }

  // ===== THREADS =====
  getAllThreads(): Thread[] {
    return db.select().from(threads).orderBy(desc(threads.createdAt)).all();
  }

  getThread(id: number): Thread | undefined {
    return db.select().from(threads).where(eq(threads.id, id)).get();
  }

  createThread(thread: InsertThread): Thread {
    const now = new Date().toISOString();
    return db.insert(threads).values({
      ...thread,
      remainingSpools: thread.totalSpools,
      createdAt: now,
    }).returning().get();
  }

  updateThread(id: number, data: Partial<InsertThread>): Thread | undefined {
    return db.update(threads).set(data).where(eq(threads.id, id)).returning().get();
  }

  deleteThread(id: number): void {
    db.delete(threadUsages).where(eq(threadUsages.threadId, id)).run();
    db.delete(threads).where(eq(threads.id, id)).run();
  }

  // ===== PATTERNS =====
  getAllPatterns(): Pattern[] {
    return db.select().from(patterns).orderBy(desc(patterns.createdAt)).all();
  }

  getPattern(id: number): Pattern | undefined {
    return db.select().from(patterns).where(eq(patterns.id, id)).get();
  }

  createPattern(pattern: InsertPattern): Pattern {
    const now = new Date().toISOString();
    return db.insert(patterns).values({
      ...pattern,
      createdAt: now,
    }).returning().get();
  }

  updatePattern(id: number, data: Partial<InsertPattern>): Pattern | undefined {
    return db.update(patterns).set(data).where(eq(patterns.id, id)).returning().get();
  }

  deletePattern(id: number): void {
    db.delete(projectPatterns).where(eq(projectPatterns.patternId, id)).run();
    db.delete(patterns).where(eq(patterns.id, id)).run();
  }

  // ===== PROJECTS =====
  getAllProjects(): Project[] {
    return db.select().from(projects).orderBy(desc(projects.createdAt)).all();
  }

  getProject(id: number): Project | undefined {
    return db.select().from(projects).where(eq(projects.id, id)).get();
  }

  createProject(project: InsertProject): Project {
    const now = new Date().toISOString();
    return db.insert(projects).values({
      ...project,
      createdAt: now,
    }).returning().get();
  }

  updateProject(id: number, data: Partial<InsertProject>): Project | undefined {
    return db.update(projects).set(data).where(eq(projects.id, id)).returning().get();
  }

  deleteProject(id: number): void {
    db.delete(projectPatterns).where(eq(projectPatterns.projectId, id)).run();
    db.delete(projects).where(eq(projects.id, id)).run();
  }

  // ===== FABRIC USAGES =====
  getAllUsages(): FabricUsage[] {
    return db.select().from(fabricUsages).orderBy(desc(fabricUsages.usedAt)).all();
  }

  getUsagesByFabric(fabricId: number): FabricUsage[] {
    return db.select().from(fabricUsages).where(eq(fabricUsages.fabricId, fabricId)).orderBy(desc(fabricUsages.usedAt)).all();
  }

  getUsagesByProject(projectId: number): FabricUsage[] {
    return db.select().from(fabricUsages).where(eq(fabricUsages.projectId, projectId)).orderBy(desc(fabricUsages.usedAt)).all();
  }

  createUsage(usage: InsertFabricUsage): FabricUsage {
    const now = new Date().toISOString();
    const fabric = this.getFabric(usage.fabricId);
    if (!fabric) throw new Error("Ткань не найдена");
    if (fabric.remainingLengthM < usage.lengthUsedM) {
      throw new Error("Недостаточно ткани на остатке");
    }
    db.update(fabrics).set({
      remainingLengthM: fabric.remainingLengthM - usage.lengthUsedM,
    }).where(eq(fabrics.id, usage.fabricId)).run();

    return db.insert(fabricUsages).values({
      ...usage,
      usedAt: now,
    }).returning().get();
  }

  deleteUsage(id: number): void {
    const usage = db.select().from(fabricUsages).where(eq(fabricUsages.id, id)).get();
    if (usage) {
      const fabric = this.getFabric(usage.fabricId);
      if (fabric) {
        db.update(fabrics).set({
          remainingLengthM: fabric.remainingLengthM + usage.lengthUsedM,
        }).where(eq(fabrics.id, usage.fabricId)).run();
      }
      db.delete(fabricUsages).where(eq(fabricUsages.id, id)).run();
    }
  }

  // ===== NOTION USAGES =====
  getAllNotionUsages(): NotionUsage[] {
    return db.select().from(notionUsages).orderBy(desc(notionUsages.usedAt)).all();
  }

  getNotionUsagesByProject(projectId: number): NotionUsage[] {
    return db.select().from(notionUsages).where(eq(notionUsages.projectId, projectId)).orderBy(desc(notionUsages.usedAt)).all();
  }

  createNotionUsage(usage: InsertNotionUsage): NotionUsage {
    const now = new Date().toISOString();
    const notion = this.getNotion(usage.notionId);
    if (!notion) throw new Error("Фурнитура не найдена");
    if (notion.remainingQuantity < usage.quantityUsed) {
      throw new Error("Недостаточно фурнитуры на остатке");
    }
    db.update(notions).set({
      remainingQuantity: notion.remainingQuantity - usage.quantityUsed,
    }).where(eq(notions.id, usage.notionId)).run();

    return db.insert(notionUsages).values({
      ...usage,
      usedAt: now,
    }).returning().get();
  }

  deleteNotionUsage(id: number): void {
    const usage = db.select().from(notionUsages).where(eq(notionUsages.id, id)).get();
    if (usage) {
      const notion = this.getNotion(usage.notionId);
      if (notion) {
        db.update(notions).set({
          remainingQuantity: notion.remainingQuantity + usage.quantityUsed,
        }).where(eq(notions.id, usage.notionId)).run();
      }
      db.delete(notionUsages).where(eq(notionUsages.id, id)).run();
    }
  }

  // ===== THREAD USAGES =====
  getAllThreadUsages(): ThreadUsage[] {
    return db.select().from(threadUsages).orderBy(desc(threadUsages.usedAt)).all();
  }

  getThreadUsagesByProject(projectId: number): ThreadUsage[] {
    return db.select().from(threadUsages).where(eq(threadUsages.projectId, projectId)).orderBy(desc(threadUsages.usedAt)).all();
  }

  createThreadUsage(usage: InsertThreadUsage): ThreadUsage {
    const now = new Date().toISOString();
    const thread = this.getThread(usage.threadId);
    if (!thread) throw new Error("Нить не найдена");
    if (thread.remainingSpools < usage.spoolsUsed) {
      throw new Error("Недостаточно катушек на остатке");
    }
    db.update(threads).set({
      remainingSpools: thread.remainingSpools - usage.spoolsUsed,
    }).where(eq(threads.id, usage.threadId)).run();

    return db.insert(threadUsages).values({
      ...usage,
      usedAt: now,
    }).returning().get();
  }

  deleteThreadUsage(id: number): void {
    const usage = db.select().from(threadUsages).where(eq(threadUsages.id, id)).get();
    if (usage) {
      const thread = this.getThread(usage.threadId);
      if (thread) {
        db.update(threads).set({
          remainingSpools: thread.remainingSpools + usage.spoolsUsed,
        }).where(eq(threads.id, usage.threadId)).run();
      }
      db.delete(threadUsages).where(eq(threadUsages.id, id)).run();
    }
  }

  // ===== PROJECT-PATTERN LINKS =====
  getProjectPatterns(projectId: number): ProjectPattern[] {
    return db.select().from(projectPatterns).where(eq(projectPatterns.projectId, projectId)).all();
  }

  addProjectPattern(link: InsertProjectPattern): ProjectPattern {
    return db.insert(projectPatterns).values(link).returning().get();
  }

  removeProjectPattern(id: number): void {
    db.delete(projectPatterns).where(eq(projectPatterns.id, id)).run();
  }

  // ===== WISH LIST =====
  getAllWishListItems(): WishListItem[] {
    return db.select().from(wishListItems).orderBy(desc(wishListItems.createdAt)).all();
  }

  getWishListItem(id: number): WishListItem | undefined {
    return db.select().from(wishListItems).where(eq(wishListItems.id, id)).get();
  }

  createWishListItem(item: InsertWishListItem): WishListItem {
    const now = new Date().toISOString();
    return db.insert(wishListItems).values({
      ...item,
      createdAt: now,
    }).returning().get();
  }

  updateWishListItem(id: number, data: Partial<InsertWishListItem>): WishListItem | undefined {
    return db.update(wishListItems).set(data).where(eq(wishListItems.id, id)).returning().get();
  }

  deleteWishListItem(id: number): void {
    db.delete(wishListItems).where(eq(wishListItems.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
