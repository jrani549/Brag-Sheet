import { Router } from "express";
import { db, entriesTable, categoriesTable } from "@workspace/db";
import { eq, desc, sql, and, ilike, gte, lte } from "drizzle-orm";
import { CreateEntryBody, UpdateEntryBody, ListEntriesQueryParams, GetEntryParams, UpdateEntryParams, DeleteEntryParams } from "@workspace/api-zod";

const router = Router();

const entryWithCategory = {
  id: entriesTable.id,
  title: entriesTable.title,
  description: entriesTable.description,
  impact: entriesTable.impact,
  categoryId: entriesTable.categoryId,
  categoryName: categoriesTable.name,
  date: entriesTable.date,
  createdAt: entriesTable.createdAt,
  updatedAt: entriesTable.updatedAt,
};

router.get("/recent", async (req, res) => {
  const entries = await db
    .select(entryWithCategory)
    .from(entriesTable)
    .leftJoin(categoriesTable, eq(entriesTable.categoryId, categoriesTable.id))
    .orderBy(desc(entriesTable.createdAt))
    .limit(5);
  res.json(entries);
});

router.get("/", async (req, res) => {
  const query = ListEntriesQueryParams.parse(req.query);
  const conditions = [];

  if (query.category) {
    conditions.push(ilike(categoriesTable.name, `%${query.category}%`));
  }
  if (query.search) {
    conditions.push(
      sql`(${ilike(entriesTable.title, `%${query.search}%`)} OR ${ilike(entriesTable.description, `%${query.search}%`)})`
    );
  }

  const entries = await db
    .select(entryWithCategory)
    .from(entriesTable)
    .leftJoin(categoriesTable, eq(entriesTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(entriesTable.date));

  res.json(entries);
});

router.post("/", async (req, res) => {
  const body = CreateEntryBody.parse(req.body);
  const [entry] = await db
    .insert(entriesTable)
    .values({
      title: body.title,
      description: body.description,
      impact: body.impact,
      categoryId: body.categoryId ?? null,
      date: body.date,
    })
    .returning();

  let categoryName = null;
  if (entry.categoryId) {
    const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, entry.categoryId)).limit(1);
    categoryName = cat[0]?.name ?? null;
  }

  res.status(201).json({ ...entry, categoryName });
});

router.get("/:id", async (req, res) => {
  const { id } = GetEntryParams.parse({ id: Number(req.params.id) });
  const [entry] = await db
    .select(entryWithCategory)
    .from(entriesTable)
    .leftJoin(categoriesTable, eq(entriesTable.categoryId, categoriesTable.id))
    .where(eq(entriesTable.id, id))
    .limit(1);

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(entry);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateEntryParams.parse({ id: Number(req.params.id) });
  const body = UpdateEntryBody.parse(req.body);

  const updateData: Partial<typeof entriesTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.impact !== undefined) updateData.impact = body.impact;
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId ?? null;
  if (body.date !== undefined) updateData.date = body.date;

  const [entry] = await db
    .update(entriesTable)
    .set(updateData)
    .where(eq(entriesTable.id, id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  let categoryName = null;
  if (entry.categoryId) {
    const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, entry.categoryId)).limit(1);
    categoryName = cat[0]?.name ?? null;
  }

  res.json({ ...entry, categoryName });
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteEntryParams.parse({ id: Number(req.params.id) });
  await db.delete(entriesTable).where(eq(entriesTable.id, id));
  res.status(204).send();
});

export default router;
