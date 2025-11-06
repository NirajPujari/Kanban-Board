import { Board, BoardData, BoardLane } from "../types";

export function findCardInBoard(
  boardState: Board,
  id: string
): [BoardLane | null, BoardData | null] {
  for (const column in boardState) {
    const colKey = column as keyof Board;
    const card = boardState[colKey].find((item) => item._id === id);
    if (card) return [colKey, card];
  }
  return [null, null];
}
