import { LoaderProps } from "@types";

export function Loader({
  cols = ["To Do", "In Progress", "Done"],
  type = "board",
}: LoaderProps) {
  if (type === "stats") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-neutral-800 rounded-lg p-4">
            <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-12 bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "users") {
    return (
      <div className="flex items-center gap-4">
        <div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-9 w-64 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  // New: loader for the horizontal user list (single row, ~3 visible)
  if (type === "userList") {
    return (
      <div className="overflow-x-auto py-2">
        <div className="flex gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[32%] min-w-[220px] bg-neutral-800 rounded-xl shadow-lg p-5 flex flex-col items-center justify-center relative"
            >
              <div className="absolute top-3 left-3">
                <div className="w-7 h-7 rounded-full bg-neutral-900 animate-pulse"></div>
              </div>

              <div className="w-14 h-14 rounded-full bg-gray-700 animate-pulse mb-2"></div>

              <div className="text-center w-full">
                <div className="h-5 w-3/4 bg-gray-700 rounded mx-auto animate-pulse mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-700 rounded mx-auto animate-pulse"></div>
              </div>

              <div className="absolute top-3 right-3">
                <div className="h-6 w-12 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {cols.map((col) => (
        <div key={col} className="w-full min-h-6/12">
          <div className="flex justify-between items-center">
            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="mt-3 py-3 flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#171717] w-[95%] h-[140px] rounded-xl p-4 mx-auto animate-pulse"
              >
                <div className="h-5 w-3/4 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
