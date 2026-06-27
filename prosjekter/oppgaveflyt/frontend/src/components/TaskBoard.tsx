import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useBoard } from "../hooks/useBoard";
import { useMoveTask } from "../hooks/useMoveTask";
import { TaskColumn } from "./TaskColumn";

interface TaskBoardProps {
  projectId: string;
  /** Kalles når brukeren klikker et kort, f.eks. for å åpne en detalj-modal (ikke vist her). */
  onOpenTask: (taskId: string) => void;
}

/**
 * Kanban-tavlen for et prosjekt. Henter kolonner+oppgaver med TanStack Query,
 * og bruker dnd-kit til å la brukeren dra oppgaver mellom kolonner.
 * Selve flytte-logikken (optimistisk oppdatering + API-kall) ligger i useMoveTask.
 */
export function TaskBoard({ projectId, onOpenTask }: TaskBoardProps) {
  const { data: columns, isLoading, isError } = useBoard(projectId);
  const moveTask = useMoveTask(projectId);

  // PointerSensor med en liten aktiveringsavstand unngår at et vanlig klikk
  // (for å åpne oppgaven) tolkes som en drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (isLoading) {
    return <p className="p-4 text-sm text-slate-500">Laster tavle…</p>;
  }
  if (isError || !columns) {
    return <p className="p-4 text-sm text-red-600">Kunne ikke laste tavlen. Prøv igjen.</p>;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const targetColumn = columns!.find(
      (column) => column.id === over.id || column.tasks.some((task) => task.id === over.id),
    );
    if (!targetColumn) return;

    const overIndex = targetColumn.tasks.findIndex((task) => task.id === over.id);
    const beforeTaskId = overIndex > 0 ? targetColumn.tasks[overIndex - 1]?.id : undefined;
    const afterTaskId = overIndex >= 0 ? targetColumn.tasks[overIndex]?.id : undefined;

    moveTask.mutate({
      taskId: String(active.id),
      columnId: targetColumn.id,
      beforeTaskId,
      afterTaskId,
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <TaskColumn key={column.id} column={column} onOpenTask={onOpenTask} />
        ))}
      </div>
    </DndContext>
  );
}
