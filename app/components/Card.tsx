import React, { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BoardData, CardProps, LevelType } from "@types";
import { Trash2, GripVertical, Pencil } from "lucide-react";

const LEVELS: LevelType = {
  1: { label: "Low", color: "bg-green-500" },
  2: { label: "Medium", color: "bg-yellow-500" },
  3: { label: "High", color: "bg-red-500" },
};

export function Card({ data, onEdit, onDelete }: CardProps) {
  const [editData, setEditData] = useState<BoardData>({ ...data });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditData({ ...data });
  }, [data]);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: data._id });

  const styleMain: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: "opacity 0.2s ease-in-out, rotate 0.5s ease-in-out",
  };

  const stylePlaceholder: React.CSSProperties = {
    transition: "opacity 0.2s ease-in-out, rotate 0.5s ease-in-out",
  };

  const level = LEVELS[data.level] || { label: "None", color: "bg-gray-400" };

  const handleDelete = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(data._id);
  };

  const handleEditToggle = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setIsEditing((v) => !v);
    setEditData({ ...data });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (value: number) =>
    setEditData((prev) => ({ ...prev, level: value }));

  const handleEdit = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (
      !editData.header ||
      editData.header.trim() === "" ||
      editData.person === ""
    ) {
      return setEditData((p) => ({
        ...p,
        header: (p.header ?? "").trim(),
        person: (p.person ?? "").trim(),
      }));
    }
    onEdit(data._id, editData);
    setIsEditing(false);
  };

  const handleCancel = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setEditData({ ...data });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (
      (e.key === "Enter" && (e.ctrlKey || e.metaKey)) ||
      (e.key === "s" && (e.ctrlKey || e.metaKey))
    ) {
      e.preventDefault();
      handleEdit();
    }
  };

  const editTemplate = (
    <div
      className="bg-[#171717] w-[95%] min-h-[140px] rounded-xl p-4 flex flex-col gap-1 justify-between shadow-md hover:shadow-lg transition-shadow duration-300"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`Edit ${data.header}`}
    >
      <input
        type="text"
        name="header"
        value={editData.header ?? ""}
        onChange={handleChange}
        placeholder="Task Title..."
        className="focus-visible:outline-0 focus-visible:inset-ring-2 focus-visible:inset-ring-[#3b82f6] focus-visible:shadow-xs focus-visible:shadow-[#3b82f6] rounded-md text-white px-2 py-1"
        aria-label="Task title"
        autoFocus
      />
      <textarea
        name="desc"
        value={editData.desc ?? ""}
        onChange={handleChange}
        placeholder="Task Description..."
        className="focus-visible:outline-0 focus-visible:inset-ring-2 focus-visible:inset-ring-[#3b82f6] focus-visible:shadow-xs focus-visible:shadow-[#3b82f6] rounded-md text-white px-2 py-1"
        aria-label="Task description"
      />
      <input
        type="text"
        name="person"
        value={editData.person ?? ""}
        onChange={handleChange}
        placeholder="Assignee (optional)..."
        className="focus-visible:outline-0 focus-visible:inset-ring-2 focus-visible:inset-ring-[#3b82f6] focus-visible:shadow-xs focus-visible:shadow-[#3b82f6] rounded-md text-white px-2 py-1"
        aria-label="Assignee"
      />
      <div className="flex justify-between items-center pt-1.5">
        <div className="flex gap-2">
          {[
            { label: "Low", value: 1, color: "" },
            { label: "Medium", value: 2, color: "" },
            { label: "High", value: 3, color: "" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleLevelChange(opt.value)}
              className={`text-[10px] font-medium  px-2 py-1 rounded-full ${
                editData.level === opt.value
                  ? opt.value === 1
                    ? "bg-green-500 text-white"
                    : opt.value === 2
                    ? "bg-yellow-500 text-black"
                    : "bg-red-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
              aria-pressed={editData.level === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-base font-medium rounded-md bg-blue-600 text-white hover:bg-blue-600/50 transition-colors ease-in-out duration-500"
          >
            Edit
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-base font-medium rounded-md bg-transparent text-white hover:bg-blue-600 transition-colors ease-in-out duration-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const cardTemplate = (
    <div className="bg-[#171717] w-[95%] min-h-[140px] rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300 cursor-default">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <h2 className="text-sm lg:text-base font-semibold text-white select-text">
            {data.header}
          </h2>
        </div>
        <div className="relative flex gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handleEditToggle}
            aria-label={`Edit ${data.header}`}
            className="p-1"
            title="Edit"
          >
            <Pencil className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handleDelete}
            aria-label={`Delete ${data.header}`}
            className="p-1"
            title="Delete"
          >
            <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-300 mt-2 line-clamp-3 break-words">
        {data.desc}
      </p>

      <div className="flex justify-between items-center mt-3">
        <span
          className={`text-[10px] font-medium text-white px-2 py-1 rounded-full ${level.color}`}
        >
          {level.label}
        </span>
        <span className="text-[10px] text-gray-400 italic">{data.person}</span>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={setNodeRef}
        style={styleMain}
        {...attributes}
        className="w-full flex justify-center"
      >
        {isEditing ? (
          <div className="w-full flex justify-center pointer-events-auto">
            {editTemplate}
          </div>
        ) : (
          <div {...listeners} className="w-full flex justify-center">
            {cardTemplate}
          </div>
        )}
      </div>
      {isDragging && !isEditing && (
        <div
          style={stylePlaceholder}
          aria-hidden="true"
          className="w-full flex justify-center -mt-40 opacity-50 rotate-3 scale-105 pointer-events-none"
        >
          {cardTemplate}
        </div>
      )}
    </>
  );
}
