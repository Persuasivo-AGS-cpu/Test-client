import { KanbanBoard } from "@/components/kanban/kanban-board";
import { MOCK_PROYECTOS } from "@/lib/mock/proyectos";

export default function KanbanPage() {
  return <KanbanBoard initialProyectos={MOCK_PROYECTOS} />;
}
