import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Videoai",
  description: "Generate videos programmatically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="antialiased min-h-dvh min-w-dvw flex flex-col items-center">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
