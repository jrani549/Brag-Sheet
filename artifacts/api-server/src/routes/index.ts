import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateRouter from "./generate";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/generate", generateRouter);
router.use("/chat", chatRouter);

export default router;
