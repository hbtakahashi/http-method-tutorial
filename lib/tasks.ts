// 新規作成ファイルのため、変更前のコードはありません
export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export const tasks: Task[] = [
  { id: 1, title: "Next.jsを学ぶ", completed: false },
  { id: 2, title: "TypeScriptを極める", completed: false },
];