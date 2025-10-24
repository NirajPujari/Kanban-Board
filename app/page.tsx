"use client";
import { useState } from "react";
import { Board, BoardData } from "./types";
import Card from "./component/Card";
import { Column } from "./component/Column";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { findCardInBoard } from "./utils/dndUtils";

export default function Home() {
  const [board, setBoard] = useState({
    "To Do": [
      {
        id: 1,
        header: "Design user interface",
        desc: "Create wireframes and mockups for the new dashboard",
        level: 3,
        person: "Sarah Chen",
      },
      {
        id: 2,
        header: "Set up database schema",
        desc: "Design schema and ER diagrams",
        level: 2,
        person: "Alex Kim",
      },
    ],
    "In Progress": [
      {
        id: 3,
        header: "Implement authentication",
        desc: "Set up JWT and OAuth integration",
        level: 3,
        person: "Michael Lee",
      },
    ],
    Done: [
      {
        id: 4,
        header: "Project kickoff",
        desc: "Initial meeting with stakeholders",
        level: 1,
        person: "Team",
      },
    ],
  });

  const [activeAddColumn, setActiveAddColumn] = useState<string | null>(null);

  const handleStartAdd = (colId: string) => {
    setActiveAddColumn(colId); // only one active form at a time
  };

  const handleSubmitAdd = (colId: string, data: BoardData) => {
    setBoard((prev) => ({
      ...prev,
      [colId]: [...prev[colId as keyof Board], data],
    }));
    setActiveAddColumn(null);
  };

  const handleCancelAdd = () => {
    setActiveAddColumn(null);
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;

    const cardId = active.id as number; // active.id is string | number

    setBoard((prevBoard) => {
      const [fromColumn, card] = findCardInBoard(prevBoard, cardId);
      if (!fromColumn || !card || fromColumn == over.id) return prevBoard;

      // Remove card from old column
      const updatedFromColumn = prevBoard[fromColumn].filter(
        (c) => c.id !== cardId
      );

      // Add card to new column
      const updatedToColumn = [...prevBoard[over.id as keyof Board], card];

      return {
        ...prevBoard,
        [fromColumn]: updatedFromColumn,
        [over.id as keyof Board]: updatedToColumn,
      };
    });
  }

  // Helper: find card + its column

  const cols: (keyof Board)[] = ["To Do", "In Progress", "Done"];

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
                <Card onDelete={() => {}} data={data} key={data.id} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>
    </main>
  );
}
