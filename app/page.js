"use client";

import { useState } from "react";

const ACTIONS = [
  { id: "summary", label: "О чем статья?" },
  { id: "theses", label: "Тезисы" },
  { id: "telegram", label: "Пост для Telegram" },
  { id: "translate", label: "Перевод" },
];

const LOADING_LABELS = {
  summary: "Обработка статьи…",
  theses: "Обработка статьи…",
  telegram: "Обработка статьи…",
  translate: "Перевод статьи…",
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [error, setError] = useState("");

  async function handleAction(actionId) {
    if (!url.trim()) {
      setError("Введите URL статьи");
      return;
    }

    setError("");
    setLoading(true);
    setActiveAction(actionId);
    setResult("");

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), action: actionId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Не удалось обработать статью");
      }

      const data = await response.json();

      if (typeof data.result === "string") {
        setResult(data.result);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Reference
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Вставьте ссылку на англоязычную статью и выберите действие.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label htmlFor="article-url" className="block text-sm font-medium text-slate-700">
            URL статьи
          </label>
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            disabled={loading}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action.id)}
                disabled={loading}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  activeAction === action.id && loading
                    ? "bg-sky-700 text-white"
                    : "bg-sky-600 text-white hover:bg-sky-700"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700">Результат</h2>

          <div className="mt-3 min-h-[12rem] rounded-lg border border-slate-200 bg-slate-50 p-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
                {LOADING_LABELS[activeAction] || "Обработка…"}
              </div>
            ) : result ? (
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
                {result}
              </pre>
            ) : (
              <p className="text-sm text-slate-400">
                Здесь появится ответ после выбора действия.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
