import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"], // Adding cyrillic for Russian support
});

export const metadata: Metadata = {
  title: "Partner Portal | For You Real Estate",
  description: "Portal for partners to track leads and commissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
