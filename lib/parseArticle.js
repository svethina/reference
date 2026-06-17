import * as cheerio from "cheerio";

const CONTENT_SELECTORS = [
  "article",
  '[role="article"]',
  ".entry-content",
  ".post-content",
  ".article-content",
  ".article-body",
  ".post-body",
  ".content",
  ".post",
  "main",
  "#content",
];

const DATE_META_SELECTORS = [
  'meta[property="article:published_time"]',
  'meta[name="article:published_time"]',
  'meta[property="og:article:published_time"]',
  'meta[name="date"]',
  'meta[name="pubdate"]',
  'meta[name="publish-date"]',
  'meta[itemprop="datePublished"]',
  'meta[property="article:modified_time"]',
];

const NOISE_SELECTORS =
  "script, style, nav, footer, aside, header, noscript, iframe, .comments, .comment, .sidebar, .advertisement, .ad, .social-share, .related-posts";

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractTitle($) {
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (ogTitle) return normalizeText(ogTitle);

  const h1 = $("h1").first().text();
  if (h1) return normalizeText(h1);

  const title = $("title").first().text();
  if (title) return normalizeText(title);

  return "";
}

function extractDateFromJsonLd($) {
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    try {
      const raw = $(scripts[i]).html();
      if (!raw) continue;

      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (item["@graph"] && Array.isArray(item["@graph"])) {
          items.push(...item["@graph"]);
        }

        const type = item["@type"];
        const isArticle =
          type === "Article" ||
          type === "NewsArticle" ||
          type === "BlogPosting" ||
          (Array.isArray(type) &&
            type.some((t) =>
              ["Article", "NewsArticle", "BlogPosting"].includes(t),
            ));

        if (isArticle && item.datePublished) {
          return String(item.datePublished);
        }
      }
    } catch {
      // пропускаем невалидный JSON-LD
    }
  }

  return "";
}

function extractDate($) {
  for (const selector of DATE_META_SELECTORS) {
    const value = $(selector).attr("content");
    if (value) return value.trim();
  }

  const timeDatetime = $("time[datetime]").first().attr("datetime");
  if (timeDatetime) return timeDatetime.trim();

  const timeText = $("time").first().text();
  if (timeText) return normalizeText(timeText);

  const jsonLdDate = extractDateFromJsonLd($);
  if (jsonLdDate) return jsonLdDate;

  return "";
}

function getElementText($, element) {
  const clone = $(element).clone();
  clone.find(NOISE_SELECTORS).remove();
  return normalizeText(clone.text());
}

function extractContent($) {
  let bestText = "";
  let bestLength = 0;

  for (const selector of CONTENT_SELECTORS) {
    $(selector).each((_, element) => {
      const text = getElementText($, element);
      if (text.length > bestLength) {
        bestLength = text.length;
        bestText = text;
      }
    });
  }

  if (bestText) return bestText;

  return getElementText($, "body");
}

export async function parseArticle(url) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ReferenceBot/1.0; +https://localhost)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw new Error(`Не удалось загрузить страницу: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`Страница вернула ошибку: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  return {
    date: extractDate($),
    title: extractTitle($),
    content: extractContent($),
  };
}
