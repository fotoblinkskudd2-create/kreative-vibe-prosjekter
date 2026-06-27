import { prisma } from "../../lib/prisma.js";
import { ForbiddenError, NotFoundError } from "../../lib/errors.js";
import type { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from "./tasks.schema.js";

const DEFAULT_POSITION_GAP = 1024;

/** Kaster ForbiddenError hvis brukeren ikke er medlem av prosjektet kolonnen hører til. */
async function assertColumnAccess(columnId: string, userId: string) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: {
      id: true,
      projectId: true,
      project: { select: { members: { where: { userId }, select: { id: true } } } },
    },
  });

  if (!column) {
    throw new NotFoundError("Kolonne");
  }
  if (column.project.members.length === 0) {
    throw new ForbiddenError("Du er ikke medlem av dette prosjektet");
  }
  return column;
}

/** Kaster ForbiddenError hvis brukeren ikke er medlem av prosjektet oppgaven hører til. */
async function assertTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      column: {
        select: { project: { select: { members: { where: { userId }, select: { id: true } } } } },
      },
    },
  });

  if (!task) {
    throw new NotFoundError("Oppgave");
  }
  if (task.column.project.members.length === 0) {
    throw new ForbiddenError("Du er ikke medlem av dette prosjektet");
  }
  return task;
}

export async function createTask(input: CreateTaskInput, requesterId: string) {
  await assertColumnAccess(input.columnId, requesterId);

  const lastTask = await prisma.task.findFirst({
    where: { columnId: input.columnId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return prisma.task.create({
    data: {
      ...input,
      position: (lastTask?.position ?? 0) + DEFAULT_POSITION_GAP,
      createdById: requesterId,
    },
  });
}

export async function updateTask(taskId: string, input: UpdateTaskInput, requesterId: string) {
  await assertTaskAccess(taskId, requesterId);
  return prisma.task.update({ where: { id: taskId }, data: input });
}

export async function deleteTask(taskId: string, requesterId: string): Promise<void> {
  await assertTaskAccess(taskId, requesterId);
  await prisma.task.delete({ where: { id: taskId } });
}

interface MoveTaskParams extends MoveTaskInput {
  taskId: string;
  requesterId: string;
}

/**
 * Flytter en oppgave til en (eventuelt ny) kolonne og plasserer den mellom to naboer.
 * Ny posisjon = gjennomsnittet av nabo-oppgavenes `position`, slik at vi kun trenger å
 * skrive denne ene raden — ingen reindeksering av resten av kolonnen.
 */
export async function moveTask(params: MoveTaskParams) {
  const { taskId, columnId, beforeTaskId, afterTaskId, requesterId } = params;

  await assertTaskAccess(taskId, requesterId);
  await assertColumnAccess(columnId, requesterId);

  const [before, after] = await Promise.all([
    beforeTaskId
      ? prisma.task.findUnique({ where: { id: beforeTaskId }, select: { position: true } })
      : null,
    afterTaskId
      ? prisma.task.findUnique({ where: { id: afterTaskId }, select: { position: true } })
      : null,
  ]);

  let position: number;
  if (before && after) {
    position = (before.position + after.position) / 2;
  } else if (before) {
    position = before.position + DEFAULT_POSITION_GAP;
  } else if (after) {
    position = after.position - DEFAULT_POSITION_GAP;
  } else {
    position = DEFAULT_POSITION_GAP;
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { columnId, position },
  });
}

export async function listTasksForProject(projectId: string, requesterId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: requesterId } },
  });
  if (!membership) {
    throw new ForbiddenError("Du er ikke medlem av dette prosjektet");
  }

  return prisma.column.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
    include: { tasks: { orderBy: { position: "asc" } } },
  });
}
