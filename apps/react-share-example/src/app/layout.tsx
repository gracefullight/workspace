import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Share Example",
  description: "Example app for @gracefullight/react-share",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
