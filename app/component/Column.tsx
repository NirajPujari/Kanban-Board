import { useDroppable } from "@dnd-kit/core";
import { BoardData, ColumnProps } from "@types";
import { useState } from "react";

export function Column({
  id,
  children,
  cardCount,
  isAdding,
  onStartAdd,
  onSubmitAdd,
  onCancelAdd,
}: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const [draft, setDraft] = useState<BoardData>({
    id: -1,
    header: "",
    desc: "",
    level: 1,
    person: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmitAdd(id, { ...draft, id: Date.now() });
    setDraft({ id: -1, header: "", desc: "", level: 1, person: "" }); // reset
  };

  return (
    <div ref={setNodeRef} className="w-full min-h-6/12">
      <div className="flex justify-between items-center">
        <h5 className="text-lg lg:text-xl font-semibold">{id}</h5>
        <div className="text-sm lg:text-md font-semibold bg-[#00BC7D] px-2 py-0.5 rounded-md">
          {cardCount}
        </div>
      </div>
      <div
        className={`flex flex-col gap-5 mt-3 py-3 justify-center items-center rounded-2xl ${
          isOver
            ? "border-2 border-dashed border-[#3b82f6] bg-[#3b82f6]/10"
            : ""
        }`}
      >
        {children}
        {!isAdding ? (
          <button
            className="w-[95%] text-xs lg:text-sm py-2 rounded-lg border-2 border-dashed border-[#171717] hover:border-[#284688]/50 hover:bg-[#284688]/5"
            onClick={() => onStartAdd(id)}
          >
            + Add Task
          </button>
        ) : (
          <div className="bg-[#171717] w-[95%] min-h-[140px] rounded-xl p-4 flex flex-col gap-1 justify-between shadow-md hover:shadow-lg transition-shadow duration-300">
            <input
              type="text"
              name="header"
              value={draft.header}
              onChange={handleChange}
              placeholder="Task Title..."
              className="focus-visible:outline-0 focus-visible:inset-ring-2 focus-visible:inset-ring-[#3b82f6] focus-visible:shadow-xs focus-visible:shadow-[#3b82f6] rounded-md text-white px-2 py-1"
            />
            <textarea
              name="desc"
              value={draft.desc}
              onChange={handleChange}
              placeholder="Task Description..."
              className="focus-visible:outline-0 focus-visible:inset-ring-2 focus-visible:inset-ring-[#3b82f6] focus-visible:shadow-xs focus-visible:shadow-[#3b82f6] rounded-md text-white px-2 py-1"
            />
            <input
              type="text"
              name="person"
              value={draft.person}
              onChange={handleChange}
              placeholder="Assignee (optional)..."
              className="focus-visible:outline-0 focus-visible:inset-ring-2 focus-visible:inset-ring-[#3b82f6] focus-visible:shadow-xs focus-visible:shadow-[#3b82f6] rounded-md text-white px-2 py-1"
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
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, level: opt.value }))
                    }
                    className={`text-[10px] font-medium  px-2 py-1 rounded-full ${
                      draft.level === opt.value
                        ? opt.value === 1
                          ? "bg-green-500 text-white"
                          : opt.value === 2
                          ? "bg-yellow-500 text-black"
                          : "bg-red-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 text-base font-medium rounded-md bg-blue-600 text-white hover:bg-blue-600/50 transition-colors ease-in-out duration-500"
                >
                  Add
                </button>
                <button
                  onClick={onCancelAdd}
                  className="px-3 py-1 text-base font-medium rounded-md bg-transparent text-white hover:bg-blue-600 transition-colors ease-in-out duration-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
