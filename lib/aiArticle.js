import { chatCompletion } from "./openrouter";

const MAX_INPUT_CHARS = 50000;

const PROMPTS = {
  summary: {
    system:
      "Ты аналитик. На основе англоязычной статьи кратко ответь на русском: о чём эта статья. 2–4 предложения, только суть, без вступлений.",
    userPrefix: "Проанализируй статью и ответь: о чём она?\n\n",
  },
  theses: {
    system:
      "Ты аналитик. Выдели ключевые тезисы англоязычной статьи и изложи их на русском маркированным списком. 5–8 пунктов, каждый — одна законченная мысль.",
    userPrefix: "Выдели основные тезисы статьи:\n\n",
  },
  telegram: {
    system:
      "Ты редактор Telegram-канала. Напиши пост для Telegram на русском по мотивам англоязычной статьи. Стиль: живой, информативный, без воды. Длина: 800–1200 символов. Эмодзи — умеренно. В конце — короткий призыв к обсуждению.",
    userPrefix: "Напиши пост для Telegram на основе статьи:\n\n",
  },
};

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

export async function processArticle(article, action) {
  const prompt = PROMPTS[action];

  if (!prompt) {
    throw new Error("Неизвестное действие");
  }

  const text = buildArticleText(article);

  if (!text.trim()) {
    throw new Error("Нет текста для обработки");
  }

  return chatCompletion([
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.userPrefix + text },
  ]);
}
