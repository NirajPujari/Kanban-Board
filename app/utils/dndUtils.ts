import { Board, BoardData } from "../types";

export function findCardInBoard(
  boardState: Board,
  id: number
): [keyof Board | null, BoardData | null] {
  for (const column in boardState) {
    const colKey = column as keyof Board;
    const card = boardState[colKey].find((item) => item.id === id);
    if (card) return [colKey, card];
  }
  return [null, null];
}
