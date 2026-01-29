import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Med - Patient Portal",
  description: "AI Med Patient Portal (read-only)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
