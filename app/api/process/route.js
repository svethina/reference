import { parseArticle } from "@/lib/parseArticle";
import { translateArticle } from "@/lib/translateArticle";

const VALID_ACTIONS = ["summary", "theses", "telegram", "translate"];

export async function POST(request) {
  const { url, action } = await request.json();

  if (!url || typeof url !== "string") {
    return Response.json({ error: "URL обязателен" }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return Response.json({ error: "Некорректный URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return Response.json(
      { error: "URL должен начинаться с http или https" },
      { status: 400 },
    );
  }

  if (!VALID_ACTIONS.includes(action)) {
    return Response.json({ error: "Неизвестное действие" }, { status: 400 });
  }

  try {
    const article = await parseArticle(parsedUrl.toString());

    if (!article.title && !article.content) {
      return Response.json(
        { error: "Не удалось извлечь заголовок и контент статьи" },
        { status: 422 },
      );
    }

    if (action === "translate") {
      const translation = await translateArticle(article);
      return Response.json({ result: translation });
    }

    // AI-обработка по action будет добавлена позже
    return Response.json(article);
  } catch (err) {
    return Response.json(
      { error: err.message || "Ошибка при обработке статьи" },
      { status: 500 },
    );
  }
}
