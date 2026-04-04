import { Router } from "express";
import { db, entriesTable, categoriesTable } from "@workspace/db";
import { eq, sql, and, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [totals] = await db
    .select({
      totalEntries: sql<number>`count(*)::int`,
      highImpactCount: sql<number>`count(*) filter (where ${entriesTable.impact} = 'high')::int`,
      mediumImpactCount: sql<number>`count(*) filter (where ${entriesTable.impact} = 'medium')::int`,
      lowImpactCount: sql<number>`count(*) filter (where ${entriesTable.impact} = 'low')::int`,
      thisMonthCount: sql<number>`count(*) filter (where ${entriesTable.date} >= ${firstOfMonth} and ${entriesTable.date} <= ${lastOfMonth})::int`,
    })
    .from(entriesTable);

  const categoryBreakdown = await db
    .select({
      categoryName: sql<string>`coalesce(${categoriesTable.name}, 'Uncategorized')`,
      count: sql<number>`count(${entriesTable.id})::int`,
    })
    .from(entriesTable)
    .leftJoin(categoriesTable, eq(entriesTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.name)
    .orderBy(sql`count(${entriesTable.id}) desc`);

  res.json({
    totalEntries: totals?.totalEntries ?? 0,
    highImpactCount: totals?.highImpactCount ?? 0,
    mediumImpactCount: totals?.mediumImpactCount ?? 0,
    lowImpactCount: totals?.lowImpactCount ?? 0,
    thisMonthCount: totals?.thisMonthCount ?? 0,
    categoryBreakdown,
  });
});

export default router;
