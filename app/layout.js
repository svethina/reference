import "./globals.css";

export const metadata = {
  title: "Reference",
  description: "Минимальное приложение на Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
