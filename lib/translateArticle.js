import { chatCompletion } from "./openrouter";

const MAX_INPUT_CHARS = 50000;

function buildArticleText(article) {
  const parts = [];

  if (article.title) {
    parts.push(`Title: ${article.title}`);
  }

  if (article.date) {
    parts.push(`Date: ${article.date}`);
  }

  if (article.content) {
    parts.push(`Content:\n${article.content}`);
  }

  let text = parts.join("\n\n");

  if (text.length > MAX_INPUT_CHARS) {
    text = `${text.slice(0, MAX_INPUT_CHARS)}\n\n[... текст обрезан ...]`;
  }

  return text;
}

export async function translateArticle(article) {
  const text = buildArticleText(article);

  if (!text.trim()) {
    throw new Error("Нет текста для перевода");
  }

  return chatCompletion([
    {
      role: "system",
      content:
        "Ты профессиональный переводчик. Переводи англоязычные статьи на русский язык. Сохраняй структуру: заголовок, дату (если есть) и основной текст. Выводи только перевод без пояснений.",
    },
    {
      role: "user",
      content: text,
    },
  ]);
}
