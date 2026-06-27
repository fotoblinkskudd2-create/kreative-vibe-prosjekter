import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { BoardColumn } from "../types/task";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  column: BoardColumn;
  onOpenTask: (taskId: string) => void;
}

export function TaskColumn({ column, onOpenTask }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div ref={setNodeRef} className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-slate-50 p-3">
      <h3 className="mb-3 px-1 text-sm font-semibold text-slate-700">
        {column.name} <span className="text-slate-400">({column.tasks.length})</span>
      </h3>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
