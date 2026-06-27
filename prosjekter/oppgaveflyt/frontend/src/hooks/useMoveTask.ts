import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { boardQueryKey } from "./useBoard";
import type { BoardColumn, Task } from "../types/task";

interface MoveTaskArgs {
  taskId: string;
  columnId: string;
  beforeTaskId?: string;
  afterTaskId?: string;
}

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();
  const queryKey = boardQueryKey(projectId);

  return useMutation({
    mutationFn: (args: MoveTaskArgs) =>
      apiFetch<{ task: Task }>(`/tasks/${args.taskId}/move`, {
        method: "PATCH",
        body: JSON.stringify({
          columnId: args.columnId,
          beforeTaskId: args.beforeTaskId,
          afterTaskId: args.afterTaskId,
        }),
      }),

    // Optimistisk oppdatering: flytt kortet lokalt umiddelbart, slik at drag-and-drop
    // oppleves instant. Ved feil rulles cachen tilbake til snapshot-et tatt før mutasjonen.
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey });
      const previousColumns = queryClient.getQueryData<BoardColumn[]>(queryKey);

      queryClient.setQueryData<BoardColumn[]>(queryKey, (columns) => {
        if (!columns) return columns;

        let movedTask: Task | undefined;
        const withoutTask = columns.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => {
            if (task.id === args.taskId) {
              movedTask = task;
              return false;
            }
            return true;
          }),
        }));

        if (!movedTask) return columns;

        return withoutTask.map((column) =>
          column.id === args.columnId
            ? { ...column, tasks: [...column.tasks, { ...movedTask!, columnId: args.columnId }] }
            : column,
        );
      });

      return { previousColumns };
    },

    onError: (_err, _args, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(queryKey, context.previousColumns);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
