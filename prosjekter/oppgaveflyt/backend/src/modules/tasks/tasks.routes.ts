import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  createTaskHandler,
  deleteTaskHandler,
  listProjectTasksHandler,
  moveTaskHandler,
  updateTaskHandler,
} from "./tasks.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listProjectTasksHandler);
router.post("/", createTaskHandler);
router.patch("/:taskId", updateTaskHandler);
router.patch("/:taskId/move", moveTaskHandler);
router.delete("/:taskId", deleteTaskHandler);

export default router;
