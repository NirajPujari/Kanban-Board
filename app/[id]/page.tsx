"use client";
import { useEffect, useState } from "react";
import { Board, BoardData, BoardLane } from "@types";
import Card from "@components/Card";
import { Column } from "@components/Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { findCardInBoard } from "@utils/dndUtils";
import { use } from "react";
import { toast } from "sonner";

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

function Dashboard({ id }: { id: string }) {
  const [board, setBoard] = useState<Board>(initialData);
  const [activeAddColumn, setActiveAddColumn] = useState<BoardLane | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/user/task/${id}`);
        const json = await res.json();

        if (!res.ok) {
          toast.error(json.error || "Failed to fetch tasks");
          return;
        }

        const tasks = json.tasks ?? [];

        const newBoard: Board = {
          "To Do": [] as BoardData[],
          "In Progress": [] as BoardData[],
          Done: [] as BoardData[],
        };

        tasks.forEach((task: BoardData) => {
          if (!newBoard[task.type]) return;
          newBoard[task.type].push(task);
        });

        setBoard(newBoard);
      } catch (err) {
        const error = err as Error;
        console.error("Fetch error:", error);
        toast.error(error.message || "Server error");
      }
    };

    fetchTasks();
  }, [id]);

  const handleStartAdd = (colId: BoardLane) => {
    setActiveAddColumn(colId);
  };

  const handleSubmitAdd = (colId: BoardLane, data: BoardData) => {
    setBoard((prev) => ({
      ...prev,
      [colId]: [...prev[colId], data],
    }));
    setActiveAddColumn(null);
  };

  const handleCancelAdd = () => {
    setActiveAddColumn(null);
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;

    const cardId = active.id.toString(); // active.id is string | number
    const newColId = over.id as BoardLane;

    setBoard((prevBoard) => {
      const [fromColumn, card] = findCardInBoard(prevBoard, cardId);
      if (!fromColumn || !card || fromColumn == newColId) return prevBoard;

      // Remove card from old column
      const updatedFromColumn = prevBoard[fromColumn].filter(
        (c) => c._id !== cardId
      );

      // Add card to new column
      const updatedToColumn = [...prevBoard[newColId], card];

      return {
        ...prevBoard,
        [fromColumn]: updatedFromColumn,
        [newColId]: updatedToColumn,
      };
    });
  }

  const handleDelete = (cardId: string) => {
    setBoard((prevBoard) => {
      const [column] = findCardInBoard(prevBoard, cardId);
      if (!column) return prevBoard;

      return {
        ...prevBoard,
        [column]: prevBoard[column].filter((card) => card._id !== cardId),
      };
    });
  };

  const cols: BoardLane[] = ["To Do", "In Progress", "Done"];

  return (
    <main className="py-6 lg:py-10 px-8 sm:px-20 md:px-32 lg:px-44">
      <h1 className="text-xl lg:text-2xl font-bold capitalize">Kanban Board</h1>
      <div className="text-md lg:text-lg pb-10">
        Manage your tasks and track progress
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-5">
          {cols.map((col) => (
            <Column
              id={col}
              cardCount={board[col].length}
              key={col}
              isAdding={activeAddColumn === col}
              onStartAdd={handleStartAdd}
              onSubmitAdd={handleSubmitAdd}
              onCancelAdd={handleCancelAdd}
            >
              {board[col].map((data) => (
                <Card onDelete={handleDelete} data={data} key={data._id} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>
    </main>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Dashboard id={id} />;
}
