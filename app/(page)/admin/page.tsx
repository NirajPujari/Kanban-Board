"use client";
import { useState, useEffect } from "react";
import { Board, BoardData, BoardLane, User } from "@types";
import { Card } from "@components/Card";
import { Column } from "@components/Column";
import { Loader } from "@components/Loader";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  Users,
  Check,
  User as UserIcon,
  Pencil,
  Trash,
  EyeOff,
  Eye,
} from "lucide-react";
import { apiFetchJson, findCardInBoard } from "@/app/utils/dndUtils";
import { toast } from "sonner";

/* keep your initialUsers as you want (3 or 50). Works for any count */
const initialUsers = [
  { _id: "1", name: "Sarah Chen", email: "sarah@example.com", password: "" },
  { _id: "2", name: "Alex Kim", email: "alex@example.com", password: "" },
  { _id: "3", name: "Michael Lee", email: "michael@example.com", password: "" },
  { _id: "4", name: "Emma Davis", email: "emma@example.com", password: "" },
  { _id: "5", name: "Daniel Patel", email: "daniel@example.com", password: "" },
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
  const [showPassword, setShowPassword] = useState(false);
  const [allTasks, setAllTasks] = useState<Record<string, Board>>(mockBoards);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState(initialUsers[0]?._id ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [board, setBoard] = useState<Board>(
    allTasks[selectedUser] ?? { "To Do": [], "In Progress": [], Done: [] }
  );
  const cols: BoardLane[] = ["To Do", "In Progress", "Done"];
  const [activeAddColumn, setActiveAddColumn] = useState<BoardLane | null>(
    null
  );

  // Search/filter state for user list
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Simulate loading
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const [usersData, tasksData] = await Promise.all([
          apiFetchJson("/admin/user"),
          apiFetchJson("/admin/tasks"),
        ]);

        const newTaskList: Record<string, Board> = {};

        usersData.forEach((user: User) => {
          const userId = user._id;
          const userTasks = tasksData.filter(
            (t: BoardData) => t.userId === userId
          );
          newTaskList[userId] = {
            "To Do": userTasks.filter((t: BoardData) => t.type === "To Do"),
            "In Progress": userTasks.filter(
              (t: BoardData) => t.type === "In Progress"
            ),
            Done: userTasks.filter((t: BoardData) => t.type === "Done"),
          };
        });
        setUsers(usersData);
        setAllTasks(newTaskList);
        setSelectedUser(usersData[0]._id);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Error loading dashboard data:");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Update board when selectedUser changes
  useEffect(() => {
    setBoard(
      allTasks[selectedUser] ?? { "To Do": [], "In Progress": [], Done: [] }
    );
  }, [selectedUser, allTasks]);

  /* User handlers */
  const openAddUserModal = () => {
    setEditUserId(null);
    setUserForm({ name: "", email: "", password: "" });
    setShowUserModal(true);
  };

  const openEditUserModal = (userId: string) => {
    const user = users.find((u) => u._id === userId);
    if (user) {
      setEditUserId(userId);
      setUserForm({
        name: user.name,
        email: user.email,
        password: user.password || "",
      });
      setShowUserModal(true);
    }
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { name, email, password } = userForm;

    const fail = (err: string) => {
      toast.error(err);
      setShowPassword(false);
      setIsLoading(false);
      return;
    };

    // Input validation
    if (!name.trim() || name.trim().length < 3) {
      fail("Username must be at least 3 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fail("Enter a valid email address");
    }

    const strongPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()+\-_=<>{}\[\]|~]).{8,}$/;
    if (!strongPass.test(password)) {
      fail(
        "Password must include uppercase, lowercase, number, symbol, and be 8+ chars"
      );
    }
    const method = editUserId ? "PUT" : "POST";
    const url = editUserId ? `admin/user/${editUserId}` : "admin/user";

    (async () => {
      try {
        const data = await apiFetchJson(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userForm),
        });
        if (editUserId) {
          const { password } = data;
          const newUserForm = { ...userForm, password: password };
          setUsers((prev) =>
            prev.map((u) =>
              u._id === editUserId ? { ...u, ...newUserForm } : u
            )
          );
        } else {
          setUsers([...users, data]);
          setAllTasks({
            ...allTasks,
            [data._id]: { "To Do": [], "In Progress": [], Done: [] },
          });
        }
        toast.success(
          editUserId ? "User updated successfully" : "User created successfully"
        );
        setShowUserModal(false);
      } catch (err) {
        console.error("Error handling user form:", err);
        toast.error("Something went wrong");
      } finally {
        setShowPassword(false);
        setIsLoading(false);
      }
    })();
  };

  const handleUserModalClose = () => {
    setShowPassword(false);
    setShowUserModal(false);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleDeleteUser = (userId: string) => {
    setIsLoading(true);
    const newUsers = users.filter((u: User) => u._id !== userId);
    setUsers(newUsers);
    (async () => {
      try {
        await apiFetchJson(`admin/user/${userId}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error("Failed to delete user");
      } finally {
        setIsLoading(false);
      }
    })();

    if (selectedUser === userId) {
      setSelectedUser(users[0]._id);
    }
  };
  
  const handleStartAdd = (colId: BoardLane) => setActiveAddColumn(colId);
  const handleCancelAdd = () => setActiveAddColumn(null);

  const handleSubmitAdd = (colId: BoardLane, data: BoardData) => {
     const newData: BoardData = {
      ...data,
      userId: selectedUser,
    };
    (async () => {
      try {
        const data = await apiFetchJson(`user/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        });
        newData._id = data.insertedId
      } catch (err) {
        console.error("Create error:", err);
        toast.error((err as Error).message || "Failed to create task");
      }
    })();
    setBoard((prev) => ({ ...prev, [colId]: [...prev[colId], newData] }));
    setAllTasks((prev)=>{
      return{
        ...prev,[selectedUser]:{
          ...prev[selectedUser],
          newData
        }
      }

    })
    setActiveAddColumn(null);
  };

  const handleEdit = (cardId: string, updatedData: BoardData) => {
    const prevBoard = board;
    const prevAllTasks = allTasks;
    const column = updatedData.type;
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    setBoard((prev) => ({
      ...prev,
      [column]: prev[column].map((card) =>
        card._id === cardId ? updatedData : card
      ),
    }));
    setAllTasks((prev) => {
      return {
        ...prev,
        [selectedUser]: {
          ...prev[selectedUser],
          [column]: prev[selectedUser][column].forEach((card) =>
            card._id === cardId ? updatedData : card
          ),
        },
      };
    });
    (async () => {
      try {
        await apiFetchJson(`admin/tasks/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
      } catch (err) {
        console.error("Update task error:", err);
        toast.error((err as Error)?.message || "Failed to update task");
        setBoard(prevBoard);
        setAllTasks(prevAllTasks);
      }
    })();
  };

  const handleDelete = (cardId: string) => {
    const prevBoard = board;
    const prevAllTasks = allTasks;
    const [column] = findCardInBoard(prevBoard, cardId);
    if (!column) return;
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    setBoard((perv) => ({
      ...perv,
      [column]: perv[column].filter((card) => card._id !== cardId),
    }));
    setAllTasks((prev) => {
      const userTasks = prev[selectedUser];
      return {
        ...prev,
        [selectedUser]: {
          ...userTasks,
          [column]: userTasks[column].filter((card) => card._id !== cardId),
        },
      };
    });
    (async () => {
      try {
        await apiFetchJson(`admin/tasks/${cardId}`, {
          method: "DELETE",
        });
        toast.success("Task deleted");
      } catch (err) {
        const error = err as Error;
        console.error("Delete error:", error);
        toast.error(error.message || "Failed to delete task");
        setBoard(prevBoard);
        setAllTasks(prevAllTasks);
      }
    })();
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

    setAllTasks((prev) => {
      const userTasks = prev[selectedUser];
      const updatedFrom = userTasks[fromColumn].filter((c) => c._id !== cardId);
      const updatedTo = [...userTasks[newColId], { ...card, type: newColId }];
      const newUserTasks = {
        ...userTasks,
        [fromColumn]: updatedFrom,
        [newColId]: updatedTo,
      };
      return { ...prev, [selectedUser]: newUserTasks };
    });

    (async () => {
      try {
        await apiFetchJson(`admin/tasks/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...card, type: newColId }),
        });
      } catch (err) {
        console.error("Move task error:", err);
        toast.error((err as Error).message || "Failed to move task");
      }
    })();
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
            {/* Show currently selected user as badge instead of select box */}
            <div className="text-sm text-gray-300 flex items-center gap-3">
              <span className="text-xs text-gray-400">Selected:</span>
              <div className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-sm">
                {users.find((u) => u._id === selectedUser)?.name ?? "—"}
              </div>
            </div>

            <button
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={openAddUserModal}
            >
              Add User
            </button>
          </div>
        )}
      </div>

      {/* User List with inline selection. Single visible row showing 3 cards at a time */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">User List</h2>

        <div className="sticky top-0 z-10 pb-4 mb-2">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <Loader type="userList" />
        ) : (
          <div
            className="overflow-x-auto overflow-y-hidden p-2"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex gap-5 items-stretch" role="list">
              {filteredUsers.map((user) => {
                const isSelected = user._id === selectedUser;
                return (
                  <div
                    key={user._id}
                    role="listitem"
                    onClick={() => handleSelectUser(user._id)}
                    className={`flex-shrink-0 w-[32%] min-w-[220px] bg-neutral-800 rounded-xl shadow-lg p-5 flex flex-col items-center justify-center relative cursor-pointer transition-transform
                ${
                  isSelected
                    ? "border-2 border-blue-500 scale-102"
                    : "border border-transparent hover:scale-102"
                }`}
                    title={`Select ${user.name}`}
                  >
                    {/* Selection indicator */}
                    <div className="absolute top-3 left-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-neutral-900 text-gray-400"
                        } shadow`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <UserIcon className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* User initials */}
                    <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center text-white text-xl font-bold mb-2">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    {/* User details */}
                    <div className="text-center">
                      <div className="font-semibold text-lg">{user.name}</div>
                      <div className="text-xs text-gray-400 mb-2">
                        {user.email}
                      </div>
                    </div>

                    {/* Edit & Delete buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        className="px-2 py-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditUserModal(user._id);
                        }}
                        title="Edit user"
                      >
                        <Pencil className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
                      </button>
                      <button
                        className="px-2 py-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                        title="Delete user"
                      >
                        <Trash className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-400 py-8">No users found.</div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">
              {editUserId ? "Edit User" : "Add User"}
            </h2>

            <form
              onSubmit={handleUserFormSubmit}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="name"
                placeholder="Username"
                value={userForm.name}
                onChange={handleUserFormChange}
                className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={userForm.email}
                onChange={handleUserFormChange}
                className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
                required
              />

              {/* Password with toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm pr-10"
                  required={!editUserId}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  onClick={handleUserModalClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {editUserId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">User Statistics</h2>
        {isLoading ? (
          <Loader type="stats" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#171717] rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold mt-1">
                {Object.values(board).reduce((acc, col) => acc + col.length, 0)}
              </p>
            </div>
            <div className="bg-[#171717] rounded-lg p-4">
              <p className="text-gray-400 text-sm">To Do</p>
              <p className="text-2xl font-bold mt-1">{board["To Do"].length}</p>
            </div>
            <div className="bg-[#171717] rounded-lg p-4">
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold mt-1">
                {board["In Progress"].length}
              </p>
            </div>
            <div className="bg-[#171717] rounded-lg p-4">
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
