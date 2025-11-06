import { Board, BoardData, BoardLane } from "../types";

export function findCardInBoard(
  boardState: Board,
  id: string
): [BoardLane | null, BoardData | null] {
  for (const column in boardState) {
    const colKey = column as BoardLane;
    const card = boardState[colKey].find((item) => item._id === id);
    if (card) return [colKey, card];
  }
  return [null, null];
}

export async function apiFetchJson(
  input: RequestInfo,
  init?: RequestInit,
  signal?: AbortSignal
) {
  const response = await fetch(input, { ...init, signal });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || response.statusText || "API error");
  return json;
}