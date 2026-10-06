import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Chrome from "@/components/Chrome";
import { siteUrl } from "@/lib/site";

const description =
  "Senior fullstack developer in Ho Chi Minh City. Vue, React, NestJS, Laravel. Builds scalable web platforms, payments and AI features for 35,000+ concurrent users.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Huỳnh Nhật Khang, Senior Fullstack Developer", template: "%s · Huỳnh Nhật Khang" },
  description,
  openGraph: {
    title: "Huỳnh Nhật Khang, Senior Fullstack Developer",
    description,
    type: "website",
    siteName: "Khang Huỳnh",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b1620",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <Chrome>{children}</Chrome>
        </LangProvider>
      </body>
    </html>
  );
}
