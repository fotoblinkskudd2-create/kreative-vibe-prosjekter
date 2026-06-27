export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
}

export interface BoardColumn {
  id: string;
  projectId: string;
  name: string;
  position: number;
  tasks: Task[];
}
