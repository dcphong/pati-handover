import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "driver.js/dist/driver.css";
import "./globals.css";
import { Topbar } from "@/components/docs/topbar";
import { AudienceModeProvider } from "@/components/docs/audience-mode";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PATI Handover — pati-master-app",
  description:
    "Onboarding & handover documentation for the PATI pati-master-app platform. Setup, deployment, features, and troubleshooting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-audience="user"
      className={`${manrope.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <AudienceModeProvider>
          <Topbar />
          {children}
        </AudienceModeProvider>
      </body>
    </html>
  );
}
