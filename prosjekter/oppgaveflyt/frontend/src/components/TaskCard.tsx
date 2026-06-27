import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

interface TaskCardProps {
  task: Task;
  onOpen: (taskId: string) => void;
}

// Bevisst minimalt kort: kun tittel, prioritet og frist er synlig her.
// Resten (beskrivelse, kommentarer, oppgavehistorikk) ligger i detalj-modalen,
// for å holde kognitiv belastning lav (inspirert av Leantimes designfilosofi).
export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task.id)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm
        hover:border-slate-300 ${isDragging ? "opacity-50" : ""}`}
    >
      <p className="text-sm font-medium text-slate-900">{task.title}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-xs text-slate-500">
            {new Date(task.dueDate).toLocaleDateString("no-NO")}
          </span>
        )}
      </div>
    </button>
  );
}
