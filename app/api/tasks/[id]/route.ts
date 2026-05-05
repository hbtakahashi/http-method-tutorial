
import { NextResponse } from "next/server";
import { tasks } from "@/lib/tasks";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const body = await request.json();

  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
  }

  tasks[taskIndex] = { id, title: body.title, completed: body.completed };

  return NextResponse.json({ message: "Task updated fully", task: tasks[taskIndex] });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const body = await request.json();

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
  }

  Object.assign(task, body);

  return NextResponse.json({ message: "Task patched", task });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
  }

  tasks.splice(index, 1);

  return NextResponse.json({ message: "Task deleted" });
}