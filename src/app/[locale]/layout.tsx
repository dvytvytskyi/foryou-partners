import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Partner Portal | For You Real Estate",
  description: "Portal for partners to track leads and commissions",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <html lang={locale}>
      <body className={`font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
