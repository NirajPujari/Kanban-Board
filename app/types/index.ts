import { PropsWithChildren } from "react";

export type Board = {
  "To Do": BoardData[];
  "In Progress": BoardData[];
  Done: BoardData[];
};

export type BoardData = {
  id: number;
  header: string;
  desc: string;
  level: number;
  person: string;
};

export type CardsProps = {
  data: BoardData;
  onDelete: (id: number) => void;
  id: number;
};
export type ColumnProps = PropsWithChildren<{
  id: string;
  cardCount: number;
  isAdding: boolean;
  onStartAdd: (columnId: string) => void;
  onSubmitAdd: (columnId: string, data: BoardData) => void;
  onCancelAdd: () => void;
}>;

export type LevelType = Record<number, { label: string; color: string }>;
