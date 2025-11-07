"use client";
import { useEffect, useState } from "react";
import { Board, BoardData, BoardLane, DashboardProps, User } from "@types";
import Card from "@components/Card";
import { Column } from "@components/Column";
import Loader from "@components/Loader";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { apiFetchJson, findCardInBoard } from "@utils/dndUtils";
import { use } from "react";
import { toast } from "sonner";
import { removeData } from "@utils/localStorage";
import { useRouter } from "next/navigation";

const initialData: Board = {
  "To Do": [
    {
      _id: "1",
      userId: "user123",
      type: "To Do",
      header: "Design user interface",
      desc: "Create wireframes and mockups for the new dashboard",
      level: 3,
      person: "Sarah Chen",
    },
    {
      _id: "2",
      userId: "user123",
      type: "To Do",
      header: "Set up database schema",
      desc: "Design schema and ER diagrams",
      level: 2,
      person: "Alex Kim",
    },
  ],
  "In Progress": [
    {
      _id: "3",
      userId: "user123",
      type: "In Progress",
      header: "Implement authentication",
      desc: "Set up JWT and OAuth integration",
      level: 3,
      person: "Michael Lee",
    },
  ],
  Done: [
    {
      _id: "4",
      userId: "user123",
      type: "Done",
      header: "Project kickoff",
      desc: "Initial meeting with stakeholders",
      level: 1,
      person: "Team",
    },
  ],
};

function Dashboard({ id }: DashboardProps) {
  const [board, setBoard] = useState<Board>(initialData);
  const [activeAddColumn, setActiveAddColumn] = useState<BoardLane | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetchJson("/user/" + id);
        setUser(data);
      } catch (err) {
        const error = err as Error;
        console.log(error.message || "Unable to Fetch User");
        toast.error(error.message || "Unable to Fetch User");
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setIsLoading(true);

    (async () => {
      try {
        const json = await apiFetchJson(
          `/user/task/${id}`,
          undefined,
          ac.signal
        );
        const tasks: BoardData[] = Array.isArray(json.tasks) ? json.tasks : [];
        const newBoard: Board = { "To Do": [], "In Progress": [], Done: [] };
        for (const t of tasks) {
          if (t?.type && newBoard[t.type as BoardLane])
            newBoard[t.type as BoardLane].push(t);
        }
        setBoard(newBoard);
      } catch (err) {
        const e = err as Error;
        console.error("Fetch tasks error:", e);
        toast.error(e.message || "Failed to fetch tasks");
        // keep previous board (demo) if fetch fails
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  const handleStartAdd = (colId: BoardLane) => {
    setActiveAddColumn(colId);
  };

  const handleSubmitAdd = (colId: BoardLane, data: BoardData) => {
    const newData: BoardData = {
      ...data,
      userId: id,
    };
    (async () => {
      try {
        const data = await apiFetchJson("user/task/" + id, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        });
        newData._id = data.taskId || Date.now().toString();
        toast.success("Task created");
      } catch (err) {
        const error = err as Error;
        console.error("Create error:", error);
        toast.error(error.message || "Failed to create task");
      }
    })();
    setBoard((prev) => ({ ...prev, [colId]: [...prev[colId], newData] }));
    setActiveAddColumn(null);
  };

  const handleCancelAdd = () => {
    setActiveAddColumn(null);
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const cardId = String(active.id);
    const newColId = over.id as BoardLane;

    const [fromColumn, card] = findCardInBoard(board, cardId);
    if (!fromColumn || !card || fromColumn === newColId) return;

    setBoard((prev) => {
      const updatedFrom = prev[fromColumn].filter((c) => c._id !== cardId);
      const updatedTo = [...prev[newColId], { ...card, type: newColId }];
      return { ...prev, [fromColumn]: updatedFrom, [newColId]: updatedTo };
    });

    (async () => {
      try {
        await apiFetchJson(`/user/task/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...card, type: newColId }),
        });
      } catch (err) {
        console.error("Move task error:", err);
        toast.error((err as Error).message || "Failed to move task");
        setBoard((prev) => {
          const revertedTo = prev[newColId].filter((c) => c._id !== cardId);
          return {
            ...prev,
            [newColId]: revertedTo,
            [fromColumn]: [...prev[fromColumn], card],
          };
        });
      }
    })();
  }

  const handleEdit = (cardId: string, updatedData: BoardData) => {
    const oldData = board;
    setBoard((prevBoard) => ({
      ...prevBoard,
      [updatedData.type]: prevBoard[updatedData.type].map((card) =>
        card._id === cardId ? updatedData : card
      ),
    }));
    (async () => {
      try {
        await apiFetchJson(`/user/task/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
      } catch (err) {
        const error = err as Error;
        console.error("Update task error:", err);
        toast.error(error.message || "Failed to update task");
        setBoard(oldData);
      }
    })();
  };

  const handleDelete = (cardId: string) => {
    const oldData = board;
    setBoard((prevBoard) => {
      const [column] = findCardInBoard(prevBoard, cardId);
      if (!column) return prevBoard;

      return {
        ...prevBoard,
        [column]: prevBoard[column].filter((card) => card._id !== cardId),
      };
    });

    (async () => {
      try {
        const res = await fetch(`/user/task/${cardId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to delete task");
        }
        toast.success("Task deleted");
      } catch (err) {
        const error = err as Error;
        console.error("Delete error:", error);
        toast.error(error.message || "Failed to delete task");
        setBoard(oldData);
      }
    })();
  };

  const cols: BoardLane[] = ["To Do", "In Progress", "Done"];

  const handleLogout = () => {
    removeData("User Id");
    router.push("/");
  };

  return (
    <main className="py-6 lg:py-10 px-8 sm:px-20 md:px-32 lg:px-44">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl lg:text-2xl font-bold capitalize">
          Kanban Board
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
      <div className="text-md lg:text-lg pb-10">Welcome, {user?.name}</div>
      {isLoading ? (
        <Loader />
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col lg:flex-row gap-5">
            {cols.map((col) => (
              <Column
                key={col}
                id={col}
                cardCount={board[col].length}
                isAdding={activeAddColumn === col}
                onStartAdd={handleStartAdd}
                onSubmitAdd={handleSubmitAdd}
                onCancelAdd={handleCancelAdd}
              >
                {board[col].map((data) => (
                  <Card
                    key={data._id}
                    data={data}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </Column>
            ))}
          </div>
        </DndContext>
      )}
    </main>
  );
}

export default function Page({ params }: { params: Promise<DashboardProps> }) {
  const { id } = use(params);
  return <Dashboard id={id} />;
}
