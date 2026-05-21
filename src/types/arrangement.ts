export type ArrangementItem = {
  id: string;
  title: string;
  dueDate: string | null; // YYYY-MM-DD 格式，可为 null
  createdAt: number;
  completed?: boolean;
};
