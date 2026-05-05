"use client";

import { useState, useEffect, useRef } from "react";
import type { Task } from "@/lib/tasks";

// ── ヘルパー ────────────────────────────────────────────
const api = {
  // GET: タスク一覧を取得
  fetchAll: (): Promise<Task[]> => fetch("/api/tasks").then((r) => r.json()),

  // POST: 新規タスクを追加
  create: (title: string): Promise<Task> =>
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => r.json()),

  // PUT: タスクを完全に置き換え（タイトル編集）
  replace: (task: Task): Promise<{ task: Task }> =>
    fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    }).then((r) => r.json()),

  // PATCH: 完了状態だけを更新
  toggle: (id: number, completed: boolean): Promise<{ task: Task }> =>
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }).then((r) => r.json()),

  // DELETE: タスクを削除
  remove: (id: number): Promise<{ message: string }> =>
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).then((r) => r.json()),
};

// ── メインコンポーネント ────────────────────────────────
export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  // GET: 初回ロード
  useEffect(() => {
    api.fetchAll().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  // フラッシュメッセージ表示
  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2000);
  };

  // ここまでコードリーディングをした 26/05/05/16:04

  // POST: 追加
  const handleAdd = async () => {
    const title = input.trim();
    if (!title) return;
    setAddLoading(true);
    const newTask = await api.create(title);
    setTasks((prev) => [...prev, newTask]);
    setInput("");
    setAddLoading(false);
    showFlash("✅ タスクを追加しました (POST)");
  };

  // PATCH: チェックボックスで完了トグル
  const handleToggle = async (task: Task) => {
    const result = await api.toggle(task.id, !task.completed);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? result.task : t)));
    showFlash(
      result.task.completed
        ? "🎉 完了しました (PATCH)"
        : "🔄 未完了に戻しました (PATCH)",
    );
  };

  // 編集モード開始
  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.title);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  // PUT: タイトル更新
  const handlePut = async (task: Task) => {
    const title = editValue.trim();
    if (!title) return;
    const result = await api.replace({ ...task, title });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? result.task : t)));
    setEditingId(null);
    showFlash("✏️ タスクを更新しました (PUT)");
  };

  // DELETE: 削除
  const handleDelete = async (id: number) => {
    await api.remove(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showFlash("🗑️ タスクを削除しました (DELETE)");
  };

  const done = tasks.filter((t) => t.completed).length;

  return (
    <div className="todo-root">
      {/* 背景装飾 */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <main className="todo-card">
        {/* ヘッダー */}
        <header className="todo-header">
          <h1 className="todo-title">
            <span className="todo-icon">📋</span>
            HTTP メソッド Todo
          </h1>
          <p className="todo-subtitle">
            GET・POST・PUT・PATCH・DELETE を体験する学習アプリ
          </p>
          {!loading && (
            <div className="todo-progress-wrap">
              <div className="todo-progress-bar">
                <div
                  className="todo-progress-fill"
                  style={{
                    width: tasks.length
                      ? `${(done / tasks.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="todo-progress-label">
                {done} / {tasks.length} 完了
              </span>
            </div>
          )}
        </header>

        {/* フラッシュメッセージ */}
        {flash && <div className="flash">{flash}</div>}

        {/* 入力欄 */}
        <div className="todo-form">
          <input
            id="new-task-input"
            className="todo-input"
            type="text"
            placeholder="新しいタスクを入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            id="add-task-btn"
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={addLoading || !input.trim()}
          >
            {addLoading ? "…" : "追加 POST"}
          </button>
        </div>

        {/* タスクリスト */}
        {loading ? (
          <div className="todo-loading">読み込み中…</div>
        ) : tasks.length === 0 ? (
          <div className="todo-empty">
            <span className="todo-empty-icon">🌟</span>
            <p>タスクがありません。上から追加してみましょう！</p>
          </div>
        ) : (
          <ul className="todo-list" id="task-list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`todo-item ${task.completed ? "done" : ""}`}
                id={`task-${task.id}`}
              >
                {/* チェックボックス（PATCH） */}
                <button
                  id={`toggle-${task.id}`}
                  className={`todo-check ${task.completed ? "checked" : ""}`}
                  onClick={() => handleToggle(task)}
                  aria-label="完了切り替え"
                >
                  {task.completed ? "✓" : ""}
                </button>

                {/* タイトル / 編集フォーム */}
                {editingId === task.id ? (
                  <div className="todo-edit-form">
                    <input
                      ref={editRef}
                      id={`edit-input-${task.id}`}
                      className="todo-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePut(task);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      id={`save-btn-${task.id}`}
                      className="btn btn-save"
                      onClick={() => handlePut(task)}
                    >
                      保存 PUT
                    </button>
                    <button
                      id={`cancel-btn-${task.id}`}
                      className="btn btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <span
                    className="todo-text"
                    onDoubleClick={() => startEdit(task)}
                    title="ダブルクリックで編集（PUT）"
                  >
                    {task.title}
                  </span>
                )}

                {/* アクションボタン */}
                {editingId !== task.id && (
                  <div className="todo-actions">
                    <button
                      id={`edit-btn-${task.id}`}
                      className="btn btn-edit"
                      onClick={() => startEdit(task)}
                      aria-label="編集"
                    >
                      ✏️
                    </button>
                    <button
                      id={`delete-btn-${task.id}`}
                      className="btn btn-delete"
                      onClick={() => handleDelete(task.id)}
                      aria-label="削除"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* HTTP メソッド凡例 */}
        <footer className="method-legend">
          <h2 className="legend-title">使用している HTTP メソッド</h2>
          <div className="legend-grid">
            {[
              { method: "GET", color: "#22c55e", desc: "タスク一覧を取得" },
              { method: "POST", color: "#3b82f6", desc: "新規タスクを追加" },
              { method: "PUT", color: "#f59e0b", desc: "タスクを完全に更新" },
              { method: "PATCH", color: "#a855f7", desc: "完了状態を部分更新" },
              { method: "DELETE", color: "#ef4444", desc: "タスクを削除" },
            ].map(({ method, color, desc }) => (
              <div key={method} className="legend-item">
                <span className="legend-badge" style={{ background: color }}>
                  {method}
                </span>
                <span className="legend-desc">{desc}</span>
              </div>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
