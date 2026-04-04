import { Router } from "express";
import { db, categoriesTable, entriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      color: categoriesTable.color,
      entryCount: sql<number>`count(${entriesTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(entriesTable, eq(entriesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id);
  res.json(categories);
});

router.post("/", async (req, res) => {
  const body = CreateCategoryBody.parse(req.body);
  const [category] = await db
    .insert(categoriesTable)
    .values({ name: body.name, color: body.color })
    .returning();
  res.status(201).json({ ...category, entryCount: 0 });
});

export default router;
