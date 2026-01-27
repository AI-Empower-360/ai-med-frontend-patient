import type { Metadata } from "next";
import "./globals.css";
import { EnvValidator } from "@/components/env-validator";
import { ErrorBoundary } from "@/components/error-boundary";

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
      <body>
        <ErrorBoundary>
          <EnvValidator />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
