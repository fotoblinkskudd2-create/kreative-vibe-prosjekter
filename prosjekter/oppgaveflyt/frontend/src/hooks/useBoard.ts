import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { BoardColumn } from "../types/task";

export function boardQueryKey(projectId: string) {
  return ["board", projectId] as const;
}

export function useBoard(projectId: string) {
  return useQuery({
    queryKey: boardQueryKey(projectId),
    queryFn: () =>
      apiFetch<{ columns: BoardColumn[] }>(`/tasks?projectId=${projectId}`).then(
        (res) => res.columns,
      ),
  });
}
