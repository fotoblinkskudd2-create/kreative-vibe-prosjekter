import { z } from "zod";

export const createTaskSchema = z.object({
  columnId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ columnId: true });

// Klienten sender hva oppgaven nå skal ligge mellom, ikke en rå tall-posisjon —
// serveren beregner selv den nye `position` (gjennomsnitt av naboene).
export const moveTaskSchema = z.object({
  columnId: z.string().uuid(),
  beforeTaskId: z.string().uuid().optional(),
  afterTaskId: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
