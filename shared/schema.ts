import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== FABRICS =====
export const fabrics = sqliteTable("fabrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(), // хлопок, шёлк, полиэстер, лён, шерсть, смесовая, другое
  composition: text("composition"), // JSON: [{"fiber":"хлопок","percent":60},{"fiber":"эластан","percent":40}]
  color: text("color").notNull(),
  colorHex: text("color_hex"), // hex code for color swatch
  pattern: text("pattern"), // паттерн/рисунок
  article: text("article"), // артикул поставщика
  supplier: text("supplier"),
  pricePerMeter: real("price_per_meter"),
  widthCm: integer("width_cm"),
  density: text("density"), // плотность (г/м²)
  totalLengthM: real("total_length_m").notNull(),
  remainingLengthM: real("remaining_length_m").notNull(),
  unit: text("unit").notNull().default("м"),
  photos: text("photos"), // JSON array of base64 data URIs, up to 8
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ===== NOTIONS (Фурнитура) =====
export const notions = sqliteTable("notions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // пуговицы, молнии, ленты, кнопки, крючки, резинка, другое
  color: text("color"),
  size: text("size"), // размер (напр. "2 см", "60 см")
  unit: text("unit").notNull().default("шт"), // шт, м, см
  totalQuantity: real("total_quantity").notNull(),
  remainingQuantity: real("remaining_quantity").notNull(),
  pricePerUnit: real("price_per_unit"),
  supplier: text("supplier"),
  article: text("article"),
  photos: text("photos"), // JSON array of base64 data URIs
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ===== THREADS (Нити) =====
export const threads = sqliteTable("threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand"),
  color: text("color").notNull(),
  colorCode: text("color_code"), // код цвета от производителя
  type: text("type").notNull().default("универсальные"), // универсальные, оверлочные, декоративные, вышивальные
  material: text("material"), // полиэстер, хлопок, шёлк
  thickness: text("thickness"), // толщина/номер
  totalSpools: integer("total_spools").notNull().default(1),
  remainingSpools: integer("remaining_spools").notNull().default(1),
  pricePerSpool: real("price_per_spool"),
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ===== PATTERNS (Выкройки) =====
export const patterns = sqliteTable("patterns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  source: text("source"), // журнал, бренд, автор
  category: text("category"), // платья, юбки, блузки, брюки, верхняя одежда, другое
  sizes: text("sizes"), // "42-48" или "S-XL"
  fabricConsumptionM: real("fabric_consumption_m"), // рекомендуемый расход ткани
  description: text("description"),
  tags: text("tags"), // JSON array of strings
  photos: text("photos"), // JSON array of base64 data URIs
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ===== PROJECTS (expanded) =====
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, completed, paused
  deadline: text("deadline"), // ISO date string
  salePrice: real("sale_price"), // цена продажи
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ===== FABRIC USAGES =====
export const fabricUsages = sqliteTable("fabric_usages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fabricId: integer("fabric_id").notNull(),
  projectId: integer("project_id"),
  lengthUsedM: real("length_used_m").notNull(),
  note: text("note"),
  usedAt: text("used_at").notNull(),
});

// ===== NOTION USAGES (расход фурнитуры) =====
export const notionUsages = sqliteTable("notion_usages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  notionId: integer("notion_id").notNull(),
  projectId: integer("project_id"),
  quantityUsed: real("quantity_used").notNull(),
  note: text("note"),
  usedAt: text("used_at").notNull(),
});

// ===== THREAD USAGES (расход нитей) =====
export const threadUsages = sqliteTable("thread_usages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id").notNull(),
  projectId: integer("project_id"),
  spoolsUsed: integer("spools_used").notNull().default(1),
  note: text("note"),
  usedAt: text("used_at").notNull(),
});

// ===== PROJECT-PATTERN LINKS =====
export const projectPatterns = sqliteTable("project_patterns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  patternId: integer("pattern_id").notNull(),
});

// ===== WISH LIST =====
export const wishListItems = sqliteTable("wish_list_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull().default("ткань"), // ткань, фурнитура, нити, выкройка, другое
  description: text("description"),
  link: text("link"), // URL
  estimatedPrice: real("estimated_price"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  photos: text("photos"), // JSON array
  purchased: integer("purchased").notNull().default(0), // 0 = нет, 1 = да
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

// ===== INSERT SCHEMAS =====
export const insertFabricSchema = createInsertSchema(fabrics).omit({
  id: true,
  remainingLengthM: true,
  createdAt: true,
});

export const insertNotionSchema = createInsertSchema(notions).omit({
  id: true,
  remainingQuantity: true,
  createdAt: true,
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  remainingSpools: true,
  createdAt: true,
});

export const insertPatternSchema = createInsertSchema(patterns).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertFabricUsageSchema = createInsertSchema(fabricUsages).omit({
  id: true,
  usedAt: true,
});

export const insertNotionUsageSchema = createInsertSchema(notionUsages).omit({
  id: true,
  usedAt: true,
});

export const insertThreadUsageSchema = createInsertSchema(threadUsages).omit({
  id: true,
  usedAt: true,
});

export const insertProjectPatternSchema = createInsertSchema(projectPatterns).omit({
  id: true,
});

export const insertWishListItemSchema = createInsertSchema(wishListItems).omit({
  id: true,
  createdAt: true,
});

// ===== TYPES =====
export type InsertFabric = z.infer<typeof insertFabricSchema>;
export type Fabric = typeof fabrics.$inferSelect;
export type InsertNotion = z.infer<typeof insertNotionSchema>;
export type Notion = typeof notions.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertPattern = z.infer<typeof insertPatternSchema>;
export type Pattern = typeof patterns.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertFabricUsage = z.infer<typeof insertFabricUsageSchema>;
export type FabricUsage = typeof fabricUsages.$inferSelect;
export type InsertNotionUsage = z.infer<typeof insertNotionUsageSchema>;
export type NotionUsage = typeof notionUsages.$inferSelect;
export type InsertThreadUsage = z.infer<typeof insertThreadUsageSchema>;
export type ThreadUsage = typeof threadUsages.$inferSelect;
export type InsertProjectPattern = z.infer<typeof insertProjectPatternSchema>;
export type ProjectPattern = typeof projectPatterns.$inferSelect;
export type InsertWishListItem = z.infer<typeof insertWishListItemSchema>;
export type WishListItem = typeof wishListItems.$inferSelect;
