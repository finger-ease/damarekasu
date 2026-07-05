import type { Metadata } from "next";
import { MuteButton } from "@/components/MuteButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "黙れカス — 想定問答バトル",
  description:
    "渋い決裁者・無茶なクライアント・細かい経理を相手に想定問答を練習し、我慢の限界で「黙れカス」を叩き込むローカルWebゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="halftone min-h-full flex flex-col">
        <MuteButton />
        {children}
      </body>
    </html>
  );
}
