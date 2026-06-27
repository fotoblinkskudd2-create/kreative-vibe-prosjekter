import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { requireUserId } from "../../middleware/auth.js";
import { createTaskSchema, moveTaskSchema, updateTaskSchema } from "./tasks.schema.js";
import * as tasksService from "./tasks.service.js";

const idParamSchema = z.object({ taskId: z.string().uuid() });

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await tasksService.createTask(input, requireUserId(req));
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = idParamSchema.parse(req.params);
    const input = updateTaskSchema.parse(req.body);
    const task = await tasksService.updateTask(taskId, input, requireUserId(req));
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = idParamSchema.parse(req.params);
    await tasksService.deleteTask(taskId, requireUserId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:taskId/move
 * Drag-and-drop-endepunktet: flytter en oppgave til en kolonne og en posisjon
 * mellom to gitte naboer. Se tasks.service.ts for posisjonsberegningen.
 */
export async function moveTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = idParamSchema.parse(req.params);
    const { columnId, beforeTaskId, afterTaskId } = moveTaskSchema.parse(req.body);

    const task = await tasksService.moveTask({
      taskId,
      columnId,
      beforeTaskId,
      afterTaskId,
      requesterId: requireUserId(req),
    });

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function listProjectTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = z.object({ projectId: z.string().uuid() }).parse(req.query);
    const columns = await tasksService.listTasksForProject(projectId, requireUserId(req));
    res.status(200).json({ columns });
  } catch (err) {
    next(err);
  }
}
