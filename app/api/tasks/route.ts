import { NextResponse } from "next/server";
import { tasks, Task } from "@/lib/tasks";

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    // 1. リクエストボディの解析（失敗するとcatchへ飛ぶ）
    const body = await request.json();

    // 2. バリデーション（値の妥当性チェック）
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "適切なタイトルを入力してください" }, { status: 400 });
    }

    // 3. データの作成処理
    const id = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask: Task = {
      id,
      title: body.title,
      completed: false,
    };

    tasks.push(newTask);
    
    // 4. 成功レスポンス
    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    // 解析エラーや通信エラーが発生した場合の処理
    return NextResponse.json(
      { error: "リクエストの処理中にエラーが発生しました" },
      { status: 400 }
    );
  }
}