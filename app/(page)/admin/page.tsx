"use client";
import { useState, useEffect } from "react";
import { Board, BoardData, BoardLane } from "@types";
import Card from "@components/Card";
import { Column } from "@components/Column";
import Loader from "@components/Loader";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Users } from "lucide-react";
import { findCardInBoard } from "@/app/utils/dndUtils";

// Mock data for multiple users
const mockUsers = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com" },
  { id: "2", name: "Alex Kim", email: "alex@example.com" },
  { id: "3", name: "Michael Lee", email: "michael@example.com" },
];

const mockBoards: Record<string, Board> = {
  "1": {
    "To Do": [
      {
        _id: "1",
        userId: "1",
        type: "To Do",
        header: "Design user interface",
        desc: "Create wireframes and mockups for the new dashboard",
        level: 3,
        person: "Sarah Chen",
      },
    ],
    "In Progress": [
      {
        _id: "2",
        userId: "1",
        type: "In Progress",
        header: "Implement API endpoints",
        desc: "Create REST endpoints for user management",
        level: 2,
        person: "Sarah Chen",
      },
    ],
    Done: [],
  },
  "2": {
    "To Do": [
      {
        _id: "3",
        userId: "2",
        type: "To Do",
        header: "Database optimization",
        desc: "Optimize database queries for better performance",
        level: 3,
        person: "Alex Kim",
      },
    ],
    "In Progress": [],
    Done: [
      {
        _id: "4",
        userId: "2",
        type: "Done",
        header: "Setup testing environment",
        desc: "Configure Jest and testing utilities",
        level: 1,
        person: "Alex Kim",
      },
    ],
  },
  "3": {
    "To Do": [],
    "In Progress": [
      {
        _id: "5",
        userId: "3",
        type: "In Progress",
        header: "Authentication system",
        desc: "Implement JWT-based authentication",
        level: 3,
        person: "Michael Lee",
      },
    ],
    Done: [
      {
        _id: "6",
        userId: "3",
        type: "Done",
        header: "Project setup",
        desc: "Initial project configuration and dependency setup",
        level: 1,
        person: "Michael Lee",
      },
    ],
  },
};

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [board, setBoard] = useState<Board>(mockBoards[selectedUser]);
  const cols: BoardLane[] = ["To Do", "In Progress", "Done"];
  const [activeAddColumn, setActiveAddColumn] = useState<BoardLane | null>(
    null
  );

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedUser]);

  const handleStartAdd = (colId: BoardLane) => {
    setActiveAddColumn(colId);
  };

  const handleSubmitAdd = (colId: BoardLane, data: BoardData) => {
    console.log(colId, data);
    setActiveAddColumn(null);
  };

  const handleCancelAdd = () => {
    setActiveAddColumn(null);
  };

  const handleEdit = (cardId: string, updatedData: BoardData) => {
    console.log(cardId, updatedData);
  };

  const handleDelete = (cardId: string) => {
    console.log(cardId);
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
  }

  return (
    <main className="py-6 lg:py-10 px-8 sm:px-20 md:px-32 lg:px-44">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold capitalize flex items-center gap-2">
            <Users className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage all user tasks</p>
        </div>
        {isLoading ? (
          <Loader type="users" />
        ) : (
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-300">Select User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mockUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-neutral-900/50 rounded-xl p-4 mb-8">
        <h2 className="text-lg font-semibold mb-2">User Statistics</h2>
        {isLoading ? (
          <Loader type="stats" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold mt-1">
                {Object.values(board).reduce((acc, col) => acc + col.length, 0)}
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold mt-1">
                {board["In Progress"].length}
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold mt-1">{board["Done"].length}</p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <Loader type="board" />
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
