import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../src/lib/errors.js";

// Service-laget kjenner ikke til Express/HTTP, derfor kan vi enhetsteste det
// med en mocket Prisma-klient — ingen ekte database eller HTTP-server nødvendig.
vi.mock("../src/lib/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));

const { prisma } = await import("../src/lib/prisma.js");
const tasksService = await import("../src/modules/tasks/tasks.service.js");

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(mockPrisma);
});

describe("moveTask", () => {
  const taskId = "11111111-1111-1111-1111-111111111111";
  const columnId = "22222222-2222-2222-2222-222222222222";
  const requesterId = "33333333-3333-3333-3333-333333333333";

  function mockAccessGranted() {
    mockPrisma.task.findUnique.mockResolvedValueOnce({
      id: taskId,
      column: { project: { members: [{ id: "membership-1" }] } },
    } as never);
    mockPrisma.column.findUnique.mockResolvedValueOnce({
      id: columnId,
      projectId: "project-1",
      project: { members: [{ id: "membership-1" }] },
    } as never);
  }

  it("setter posisjon til gjennomsnittet av to naboer", async () => {
    mockAccessGranted();
    mockPrisma.task.findUnique
      .mockResolvedValueOnce({ position: 100 } as never) // before
      .mockResolvedValueOnce({ position: 200 } as never); // after
    mockPrisma.task.update.mockResolvedValueOnce({ id: taskId, position: 150 } as never);

    await tasksService.moveTask({
      taskId,
      columnId,
      beforeTaskId: "before-id",
      afterTaskId: "after-id",
      requesterId,
    });

    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: { columnId, position: 150 },
    });
  });

  it("kaster ForbiddenError når brukeren ikke er medlem av prosjektet", async () => {
    mockPrisma.task.findUnique.mockResolvedValueOnce({
      id: taskId,
      column: { project: { members: [] } },
    } as never);

    await expect(
      tasksService.moveTask({ taskId, columnId, requesterId }),
    ).rejects.toThrowError(ForbiddenError);
  });

  it("kaster NotFoundError når oppgaven ikke finnes", async () => {
    mockPrisma.task.findUnique.mockResolvedValueOnce(null);

    await expect(
      tasksService.moveTask({ taskId, columnId, requesterId }),
    ).rejects.toThrowError(NotFoundError);
  });
});
