
import { NextResponse } from "next/server";
import { tasks } from "@/lib/tasks";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await request.json();
  
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { id, title: body.title, completed: body.completed };
  }
  
  return NextResponse.json({ message: "Task updated fully", task: tasks[taskIndex] });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await request.json();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    Object.assign(task, body);
  }

  return NextResponse.json({ message: "Task patched", task });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
  }
  
  return NextResponse.json({ message: "Task deleted" });
}