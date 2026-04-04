import { Router, type IRouter } from "express";
import healthRouter from "./health";
import entriesRouter from "./entries";
import categoriesRouter from "./categories";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/entries", entriesRouter);
router.use("/categories", categoriesRouter);
router.use("/summary", summaryRouter);

export default router;
