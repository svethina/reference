import "./globals.css";

export const metadata = {
  title: "Reference",
  description: "Парсинг англоязычных статей и генерация ответов с помощью AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
