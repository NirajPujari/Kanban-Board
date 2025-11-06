import { PropsWithChildren } from "react";

export type BoardLane = "To Do" | "In Progress" | "Done";

export type Board = Record<BoardLane, BoardData[]>;

export type BoardData = {
  _id: string;
  userId: string;
  header: string;
  desc: string;
  level: number;
  person: string;
  type: BoardLane;
};

export type CardsProps = {
  data: BoardData;
  onDelete: (id: number) => void;
  id: number;
};
export type ColumnProps = PropsWithChildren<{
  id: BoardLane;
  cardCount: number;
  isAdding: boolean;
  onStartAdd: (columnId: BoardLane) => void;
  onSubmitAdd: (columnId: BoardLane, data: BoardData) => void;
  onCancelAdd: () => void;
}>;

export type LevelType = Record<number, { label: string; color: string }>;


export type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  lastLogin?: Date | null;
};