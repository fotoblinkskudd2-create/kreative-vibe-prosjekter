import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskBoard } from "./TaskBoard";
import * as boardHook from "../hooks/useBoard";
import * as moveHook from "../hooks/useMoveTask";
import type { BoardColumn } from "../types/task";

const columns: BoardColumn[] = [
  {
    id: "col-1",
    projectId: "p1",
    name: "Backlog",
    position: 0,
    tasks: [
      {
        id: "task-1",
        columnId: "col-1",
        title: "Skriv testdekning",
        description: null,
        priority: "MEDIUM",
        position: 0,
        dueDate: null,
        assigneeId: null,
      },
    ],
  },
];

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("TaskBoard", () => {
  it("viser kolonner og oppgaver fra useBoard", () => {
    vi.spyOn(boardHook, "useBoard").mockReturnValue({
      data: columns,
      isLoading: false,
      isError: false,
    } as never);
    vi.spyOn(moveHook, "useMoveTask").mockReturnValue({ mutate: vi.fn() } as never);

    renderWithQueryClient(<TaskBoard projectId="p1" onOpenTask={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Backlog (1)" })).toBeInTheDocument();
    expect(screen.getByText("Skriv testdekning")).toBeInTheDocument();
  });

  it("viser feilmelding når tavlen ikke kan lastes", () => {
    vi.spyOn(boardHook, "useBoard").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as never);
    vi.spyOn(moveHook, "useMoveTask").mockReturnValue({ mutate: vi.fn() } as never);

    renderWithQueryClient(<TaskBoard projectId="p1" onOpenTask={vi.fn()} />);

    expect(screen.getByText(/Kunne ikke laste tavlen/)).toBeInTheDocument();
  });
});
