import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BoardData, LevelType } from "@types";
import { Trash2, GripVertical } from "lucide-react";

const LEVELS: LevelType = {
  1: { label: "Low", color: "bg-green-500" },
  2: { label: "Medium", color: "bg-yellow-500" },
  3: { label: "High", color: "bg-red-500" },
};

export default function Card({
  data,
  onDelete,
}: {
  data: BoardData;
  onDelete: (id: string) => void;
}) {
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
    // stopPropagation here is for safety on the click event as well
    e.stopPropagation();
    e.preventDefault();
    onDelete(data._id);
  };

  const cardTemplate = (
    <div className="bg-[#171717] w-[95%] min-h-[140px] rounded-xl p-4 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300 cursor-grab">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
          <h2 className="text-sm lg:text-base font-semibold text-white">
            {data.header}
          </h2>
        </div>
        <div className="relative">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={handleDelete}
            aria-label={`Delete ${data.header}`}
            className="p-1"
          >
            <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-2 line-clamp-3">{data.desc}</p>
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
        {...listeners}
        {...attributes}
        className={`w-full flex justify-center ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
      >
        {cardTemplate}
      </div>
      {isDragging && (
        <div
          style={stylePlaceholder}
          className={`w-full flex justify-center ${
            isDragging
              ? "-mt-40 opacity-50 rotate-3 scale-105"
              : "mt-0 opacity-100 rotate-0 scale-100"
          }`}
        >
          {cardTemplate}
        </div>
      )}
    </>
  );
}
