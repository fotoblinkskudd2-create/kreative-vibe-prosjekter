import { useState } from "react";
import { TaskBoard } from "./components/TaskBoard";

export default function App() {
  const [projectId] = useState("demo-project-id");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Oppgaveflyt</h1>
      </header>
      <TaskBoard projectId={projectId} onOpenTask={setOpenTaskId} />
      {openTaskId && (
        <p className="px-4 text-xs text-slate-400">Åpnet oppgave: {openTaskId}</p>
      )}
    </div>
  );
}
